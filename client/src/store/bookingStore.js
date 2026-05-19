import { create } from 'zustand';

const initialState = {
  selectedSalon: null,
  selectedStylist: null,
  selectedService: null,
  selectedServices: [],
  selectedDate: null,
  selectedTime: null,
};

const useBookingStore = create((set) => ({
  ...initialState,

  setSalon: (selectedSalon) => set({ selectedSalon }),
  setStylist: (selectedStylist) =>
    set({ selectedStylist: selectedStylist ?? null }),
  setService: (selectedService) => {
    const selectedServices = Array.isArray(selectedService)
      ? selectedService
      : selectedService
        ? [selectedService]
        : [];
    set({
      selectedServices,
      selectedService: selectedServices[0] ?? null,
    });
  },
  setDateTime: (selectedDate, selectedTime) => set({ selectedDate, selectedTime }),
  clearBooking: () => set(initialState),
}));

export default useBookingStore;
