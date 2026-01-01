import { Section } from '../types';

export interface PlanSummary {
  id: string;
  name: string;
  lastEdited: number;
}

export interface FullPlan extends PlanSummary {
  sections: Section[];
}

const STORAGE_KEY = 'retail_plans_v1';
const USER_KEY = 'retail_user_v1';

export const StorageService = {
  // User Session
  login: (email: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify({ email, isLoggedIn: true }));
  },
  
  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Plans
  getPlans: (): PlanSummary[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const plans: FullPlan[] = JSON.parse(data);
    return plans.map(p => ({
      id: p.id,
      name: p.name,
      lastEdited: p.lastEdited
    })).sort((a, b) => b.lastEdited - a.lastEdited);
  },

  getPlan: (id: string): FullPlan | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const plans: FullPlan[] = JSON.parse(data);
    return plans.find(p => p.id === id) || null;
  },

  savePlan: (plan: FullPlan) => {
    const data = localStorage.getItem(STORAGE_KEY);
    let plans: FullPlan[] = data ? JSON.parse(data) : [];
    
    const index = plans.findIndex(p => p.id === plan.id);
    if (index >= 0) {
      plans[index] = { ...plan, lastEdited: Date.now() };
    } else {
      plans.push({ ...plan, lastEdited: Date.now() });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  },

  deletePlan: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    let plans: FullPlan[] = JSON.parse(data);
    plans = plans.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  },

  createPlan: (initialSections: Section[]): FullPlan => {
    const newPlan: FullPlan = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Untitled Retail Plan',
      lastEdited: Date.now(),
      sections: initialSections
    };
    StorageService.savePlan(newPlan);
    return newPlan;
  }
};
