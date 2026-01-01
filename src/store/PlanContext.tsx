import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlanContextType, Section, ChecklistItem } from '../types';
import { generateRetailChecklist, chatWithRetailConsultant } from '../services/geminiService';

const PlanContext = createContext<PlanContextType | undefined>(undefined);

const INITIAL_FINANCIAL_DATA = {
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

const INITIAL_SECTIONS: Section[] = [
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
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(INITIAL_SECTIONS[0].id);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Helper to generate ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateSection = (id: string, data: Partial<Section>) => {
    setSections(prev => prev.map(sec => {
      if (sec.id !== id) return sec;
      
      // Handle version history if content changes significantly (debounced in UI, but handled here structurally)
      let newHistory = sec.history;
      if (data.content && data.content !== sec.content) {
         // In a real app, we'd debounce this or save on specific triggers. 
         // For now, we update history only if explicitly passed or we rely on the component to manage when to push to history.
         // We will rely on the component to pass the *new* history array if it wants to record a version.
      }

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

    // Only generate if empty to avoid overwriting user work, or explicit request
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
    
    // Optimistic update for user message
    const userMsg = { id: generateId(), role: 'user' as const, text: prompt, timestamp: Date.now() };
    const updatedHistory = [...section.chatHistory, userMsg];
    updateSection(sectionId, { chatHistory: updatedHistory });

    const responseText = await chatWithRetailConsultant(section.content, section.title, prompt, section.chatHistory);

    const aiMsg = { id: generateId(), role: 'model' as const, text: responseText, timestamp: Date.now() };
    updateSection(sectionId, { chatHistory: [...updatedHistory, aiMsg] });
    
    setIsLoadingAI(false);
  };

  // Auto-generate checklist when switching to a section if it's empty
  useEffect(() => {
    if (activeSectionId) {
      const section = sections.find(s => s.id === activeSectionId);
      if (section && section.checklist.length === 0) {
        generateChecklist(activeSectionId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      isLoadingAI
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