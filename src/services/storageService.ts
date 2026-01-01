import { auth, db } from './firebaseConfig';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { Section } from '../types';

export interface PlanSummary {
  id: string;
  name: string;
  lastEdited: number;
}

export interface FullPlan extends PlanSummary {
  userId: string; // New field to link plans to users
  sections: Section[];
}

const COLLECTION_NAME = 'plans';

export const StorageService = {
  // --- Authentication ---

  login: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Check console for details.");
    }
  },
  
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

  /**
   * Subscribes to auth state changes.
   * Returns an unsubscribe function.
   */
  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },

  // --- Database Operations ---

  getPlans: async (): Promise<PlanSummary[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      // Query plans where userId matches current user
      const q = query(collection(db, COLLECTION_NAME), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const plans: PlanSummary[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FullPlan;
        plans.push({
          id: data.id,
          name: data.name,
          lastEdited: data.lastEdited
        });
      });

      return plans.sort((a, b) => b.lastEdited - a.lastEdited);
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  },

  getPlan: async (id: string): Promise<FullPlan | null> => {
    // We already have the logic in getPlans to filter by user, 
    // but for security we should ensure the doc belongs to the user or rely on Security Rules.
    // For this implementation, we fetch all user plans and find the one. 
    // (Optimized way is doc(db, 'plans', id), but let's stick to client-side filter for simplicity if rules aren't set up yet)
    
    // Better way: Fetch specific doc
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const q = query(collection(db, COLLECTION_NAME), where("userId", "==", user.uid), where("id", "==", id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as FullPlan;
        }
        return null;
    } catch (error) {
        console.error("Error getting plan:", error);
        return null;
    }
  },

  savePlan: async (plan: Omit<FullPlan, 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    const fullPlan: FullPlan = {
        ...plan,
        userId: user.uid
    };

    try {
      await setDoc(doc(db, COLLECTION_NAME, plan.id), fullPlan);
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  },

  deletePlan: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  },

  createPlan: async (initialSections: Section[]): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in");

    const newId = Math.random().toString(36).substr(2, 9);
    const newPlan: FullPlan = {
      id: newId,
      name: 'Untitled Retail Plan',
      lastEdited: Date.now(),
      sections: initialSections,
      userId: user.uid
    };

    await StorageService.savePlan(newPlan);
    return newId;
  }
};
