import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PlanContextType, Section, ChecklistItem, FinancialData } from '../types';
import { generateRetailChecklist, chatWithRetailConsultant } from '../services/geminiService';
import { StorageService, FullPlan } from '../services/storageService';

interface ExtendedPlanContextType extends PlanContextType {
  loadPlan: (id: string) => Promise<void>;
  createNewPlan: () => Promise<string>;
  planMetadata: { id: string, name: string } | null;
}

const PlanContext = createContext<ExtendedPlanContextType | undefined>(undefined);

const INITIAL_FINANCIAL_DATA: FinancialData = {
  currency: '$',
  startupCosts: [
    { id: '1', name: 'Lease Deposit', amount: 5000 },
    { id: '2', name: 'Renovations', amount: 15000 },
    { id: '3', name: 'Initial Inventory', amount: 20000 },
    { id: '4', name: 'POS System', amount: 2000 }
  ],
  monthlyExpenses: [
    { id: '1', name: 'Rent', amount: 2500 },
    { id: '2', name: 'Utilities', amount: 400 },
    { id: '3', name: 'Staff Salaries', amount: 6000 },
    { id: '4', name: 'Marketing', amount: 1000 },
    { id: '5', name: 'Insurance', amount: 200 }
  ],
  productPrice: 45,
  productCost: 15,
  dailyCustomers: 20
};

const DEFAULT_SECTIONS_TEMPLATE: Section[] = [
  { id: '1', title: 'Executive Summary', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { id: '2', title: 'Company Overview', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { id: '3', title: 'Market Analysis (Retail)', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { id: '4', title: 'Products & Merchandising', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { id: '5', title: 'Marketing Strategy', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { id: '6', title: 'Operational Plan', content: '', history: [], checklist: [], tasks: [], notes: '', researchFiles: [], chatHistory: [] },
  { 
    id: '7', 
    title: 'Financial Plan', 
    content: '', 
    history: [], 
    checklist: [], 
    tasks: [], 
    notes: '', 
    researchFiles: [], 
    chatHistory: [],
    financialData: INITIAL_FINANCIAL_DATA 
  },
];

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>('');
  
  // Ref to prevent infinite loops in useEffect when saving
  const isInitialLoad = useRef(true);

  // Helper to generate ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load a plan into state
  const loadPlan = async (id: string) => {
    isInitialLoad.current = true;
    const plan = await StorageService.getPlan(id);
    if (plan) {
      setCurrentPlanId(plan.id);
      setPlanName(plan.name);
      setSections(plan.sections);
      setActiveSectionId(plan.sections.length > 0 ? plan.sections[0].id : null);
      isInitialLoad.current = false;
    }
  };

  const createNewPlan = async () => {
    // Deep copy default sections to ensure no reference sharing
    const initialSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_TEMPLATE));
    const newId = await StorageService.createPlan(initialSections);
    await loadPlan(newId);
    return newId;
  };

  // Auto-save effect
  useEffect(() => {
    if (currentPlanId && sections.length > 0 && !isInitialLoad.current) {
      const saveToCloud = async () => {
        const planToSave: Omit<FullPlan, 'userId'> = {
            id: currentPlanId,
            name: planName,
            lastEdited: Date.now(),
            sections: sections
        };
        await StorageService.savePlan(planToSave);
      };
      
      // Debounce saving slightly could be good, but for now strict effect is fine 
      // as long as we don't block UI.
      saveToCloud();
    }
    // Set initial load to false after first render cycle
    if(isInitialLoad.current && sections.length > 0) {
        isInitialLoad.current = false;
    }
  }, [sections, currentPlanId, planName]);


  const updateSection = (id: string, data: Partial<Section>) => {
    setSections(prev => prev.map(sec => {
      if (sec.id !== id) return sec;
      return { ...sec, ...data };
    }));
  };

  const addSection = (title: string) => {
    const newSection: Section = {
      id: generateId(),
      title,
      content: '',
      history: [],
      checklist: [],
      tasks: [],
      notes: '',
      researchFiles: [],
      chatHistory: []
    };
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newSection.id);
  };

  const deleteSection = (id: string) => {
    setSections(prev => {
      const newSections = prev.filter(s => s.id !== id);
      if (activeSectionId === id && newSections.length > 0) {
        setActiveSectionId(newSections[0].id);
      } else if (newSections.length === 0) {
        setActiveSectionId(null);
      }
      return newSections;
    });
  };

  const reorderSections = (dragIndex: number, hoverIndex: number) => {
    const newSections = [...sections];
    const [removed] = newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, removed);
    setSections(newSections);
  };

  const generateChecklist = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    if (section.checklist.length > 0) return;

    setIsLoadingAI(true);
    const items = await generateRetailChecklist(section.title);
    updateSection(sectionId, { checklist: items });
    setIsLoadingAI(false);
  };

  const generateContentHelp = async (sectionId: string, prompt: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsLoadingAI(true);
    const userMsg = { id: generateId(), role: 'user' as const, text: prompt, timestamp: Date.now() };
    const updatedHistory = [...section.chatHistory, userMsg];
    updateSection(sectionId, { chatHistory: updatedHistory });

    const responseText = await chatWithRetailConsultant(section.content, section.title, prompt, section.chatHistory);

    const aiMsg = { id: generateId(), role: 'model' as const, text: responseText, timestamp: Date.now() };
    updateSection(sectionId, { chatHistory: [...updatedHistory, aiMsg] });
    setIsLoadingAI(false);
  };

  useEffect(() => {
    if (activeSectionId) {
      const section = sections.find(s => s.id === activeSectionId);
      if (section && section.checklist.length === 0) {
        generateChecklist(activeSectionId);
      }
    }
  }, [activeSectionId]);

  return (
    <PlanContext.Provider value={{
      sections,
      activeSectionId,
      setActiveSectionId,
      updateSection,
      addSection,
      deleteSection,
      reorderSections,
      generateChecklist,
      generateContentHelp,
      isLoadingAI,
      loadPlan,
      createNewPlan,
      planMetadata: currentPlanId ? { id: currentPlanId, name: planName } : null
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};
