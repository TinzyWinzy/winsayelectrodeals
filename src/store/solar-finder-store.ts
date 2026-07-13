import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ApplianceSelection,
  SolarFinderFormData,
  RecommendationResult,
  PropertyType,
  BackupDuration,
  UsagePattern,
  BudgetRange,
  ContactMethod,
  InstallationTimeline,
} from "@/types/solar-finder";

interface SolarFinderStore {
  step: number;
  formData: SolarFinderFormData;
  recommendation: RecommendationResult | null;
  isSubmitting: boolean;
  submitted: boolean;
  setStep: (step: number) => void;
  setAppliances: (appliances: ApplianceSelection[]) => void;
  setPropertyType: (propertyType: PropertyType | null) => void;
  setLocation: (data: { city: string; suburb: string }) => void;
  setBackupDuration: (duration: BackupDuration | null) => void;
  setUsagePattern: (pattern: UsagePattern | null) => void;
  setBudget: (budget: BudgetRange | null) => void;
  setCustomerDetails: (data: {
    fullName: string;
    whatsappNumber: string;
    email: string;
    contactMethod: ContactMethod;
    installationTimeline: InstallationTimeline;
  }) => void;
  setRecommendation: (rec: RecommendationResult | null) => void;
  setIsSubmitting: (val: boolean) => void;
  setSubmitted: (val: boolean) => void;
  reset: () => void;
  goBack: () => void;
}

const initialFormData: SolarFinderFormData = {
  appliances: [],
  propertyType: null,
  city: "",
  suburb: "",
  backupDuration: null,
  usagePattern: null,
  budget: null,
  fullName: "",
  whatsappNumber: "",
  email: "",
  contactMethod: "whatsapp",
  installationTimeline: "researching",
};

export const useSolarFinderStore = create<SolarFinderStore>()(
  persist(
    (set, get) => ({
      step: 1,
      formData: initialFormData,
      recommendation: null,
      isSubmitting: false,
      submitted: false,

      setStep: (step) => set({ step }),

      setAppliances: (appliances) =>
        set((state) => ({
          formData: { ...state.formData, appliances },
        })),

      setPropertyType: (propertyType) =>
        set((state) => ({
          formData: { ...state.formData, propertyType },
        })),

      setLocation: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setBackupDuration: (backupDuration) =>
        set((state) => ({
          formData: { ...state.formData, backupDuration },
        })),

      setUsagePattern: (usagePattern) =>
        set((state) => ({
          formData: { ...state.formData, usagePattern },
        })),

      setBudget: (budget) =>
        set((state) => ({
          formData: { ...state.formData, budget },
        })),

      setCustomerDetails: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setRecommendation: (recommendation) => set({ recommendation }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setSubmitted: (submitted) => set({ submitted }),

      reset: () =>
        set({
          step: 1,
          formData: initialFormData,
          recommendation: null,
          isSubmitting: false,
          submitted: false,
        }),

      goBack: () => {
        const { step } = get();
        if (step > 1) set({ step: step - 1 });
      },
    }),
    {
      name: "winsay-solar-finder",
      partialize: (state) => ({
        step: state.step,
        formData: state.formData,
        recommendation: state.recommendation,
        submitted: state.submitted,
      }),
    }
  )
);
