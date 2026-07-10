import { create } from "zustand";
import type { RoofType } from "@/types";

interface QuoteFormData {
  packageId: string;
  roofType: RoofType | null;
  province: string;
  city: string;
  suburb: string;
  meterPhotoFile: File | null;
  meterPhotoUrl: string | null;
  payAfterInstall: boolean;
  paymentMethod: string;
  customerName: string;
  phone: string;
  email: string;
}

interface QuoteStore {
  step: number;
  formData: QuoteFormData;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  reset: () => void;
}

const initialFormData: QuoteFormData = {
  packageId: "",
  roofType: null,
  province: "",
  city: "",
  suburb: "",
  meterPhotoFile: null,
  meterPhotoUrl: null,
  payAfterInstall: false,
  paymentMethod: "paynow",
  customerName: "",
  phone: "",
  email: "",
};

export const useQuoteStore = create<QuoteStore>((set) => ({
  step: 1,
  formData: initialFormData,
  setStep: (step) => set({ step }),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  reset: () =>
    set({
      step: 1,
      formData: initialFormData,
    }),
}));
