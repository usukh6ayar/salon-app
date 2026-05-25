import { create } from 'zustand';

const useAppStore = create((set) => ({
  selectedCity: 'Улаанбаатар',
  setCity: (selectedCity) => set({ selectedCity }),
}));

export default useAppStore;
