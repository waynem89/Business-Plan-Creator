export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ResearchFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
}

export interface FinancialData {
  currency: string;
  startupCosts: FinancialItem[];
  monthlyExpenses: FinancialItem[];
  productPrice: number;
  productCost: number;
  dailyCustomers: number;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  history: { timestamp: number; content: string }[];
  checklist: ChecklistItem[];
  tasks: Task[];
  notes: string;
  researchFiles: ResearchFile[];
  chatHistory: ChatMessage[];
  financialData?: FinancialData;
}

export interface PlanContextType {
  sections: Section[];
  activeSectionId: string | null;
  setActiveSectionId: (id: string) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  addSection: (title: string) => void;
  deleteSection: (id: string) => void;
  reorderSections: (dragIndex: number, hoverIndex: number) => void;
  generateChecklist: (sectionId: string) => Promise<void>;
  generateContentHelp: (sectionId: string, prompt: string) => Promise<void>;
  isLoadingAI: boolean;
}