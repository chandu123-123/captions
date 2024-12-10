import { create } from 'zustand';

interface CreditsStore {
  credits: number;
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => boolean;
  initializeCredits: (email:string) => Promise<void>;
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  credits: 0, // Initial default credits
  setCredits: (credits: number) => set({ credits }),
  deductCredits: (amount: number) => {
    const currentCredits = get().credits;
    if (currentCredits >= amount) {
      set({ credits: currentCredits - amount });
      return true;
    }
    return false;
  },
  initializeCredits: async (email: string) => {
  
    try {
     // Replace with your API endpoint
      const response = await fetch(`/api/credits?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const { credits } = await response.json();
      set({ credits });
    } catch (error) {
      console.error('Failed to initialize credits:', error);
    }
  },
}));
