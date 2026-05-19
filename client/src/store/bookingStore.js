import { create } from 'zustand';

const initialState = {
  selectedSalon: null,
  selectedStylist: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
};

const useBookingStore = create((set) => ({
  ...initialState,

  setSalon: (selectedSalon) => set({ selectedSalon }),
  setStylist: (selectedStylist) =>
    set({ selectedStylist: selectedStylist ?? null }),
  setService: (selectedService) => set({ selectedService }),
  setDateTime: (selectedDate, selectedTime) => set({ selectedDate, selectedTime }),
  clearBooking: () => set(initialState),
}));

export default useBookingStore;
