"use client";

import { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useSolarFinderStore } from "@/store/solar-finder-store";
import { generateRecommendationFromForm } from "@/lib/solar-finder/recommendation-engine";
import { trackEvent } from "@/lib/solar-finder/analytics";
import { getFinderPackageById } from "@/lib/solar-finder/packages";
import { WizardProgress } from "@/components/solar-finder/wizard-progress";
import { Step1Appliances } from "@/components/solar-finder/step-1-appliances";
import { Step2Property } from "@/components/solar-finder/step-2-property";
import { Step3Backup } from "@/components/solar-finder/step-3-backup";
import { Step4Budget } from "@/components/solar-finder/step-4-budget";
import { Step5Details } from "@/components/solar-finder/step-5-details";
import { ResultScreen } from "@/components/solar-finder/result-screen";
import type { PropertyType, BackupDuration, UsagePattern, BudgetRange } from "@/types/solar-finder";

const TOTAL_STEPS = 5;

export default function SolarFinderPage() {
  const store = useSolarFinderStore();

  const handleNext = useCallback(() => {
    trackEvent("step_completed", { step: store.step });
    store.setStep(store.step + 1);
  }, [store]);

  const handleBack = useCallback(() => {
    store.goBack();
  }, [store]);

  const handleGenerateRecommendation = useCallback(async () => {
    trackEvent("recommendation_requested");
    store.setIsSubmitting(true);

    try {
      const result = generateRecommendationFromForm(store.formData);
      store.setRecommendation(result);
      store.setStep(6);
      trackEvent("recommendation_generated", {
        package: result.primaryPackageId,
        expertReview: result.expertReviewRequired,
      });
    } catch (err) {
      console.error("Failed to generate recommendation:", err);
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store]);

  const handleRequestInstallation = useCallback(async () => {
    if (!store.recommendation) return;
    store.setIsSubmitting(true);

    try {
      const response = await fetch("/api/solar-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: store.formData.fullName,
          whatsappNumber: store.formData.whatsappNumber,
          email: store.formData.email,
          city: store.formData.city,
          suburb: store.formData.suburb,
          appliances: store.formData.appliances,
          propertyType: store.formData.propertyType,
          backupDuration: store.formData.backupDuration,
          usagePattern: store.formData.usagePattern,
          budget: store.formData.budget,
          installationTimeline: store.formData.installationTimeline,
          recommendedPackageId: store.recommendation.primaryPackageId,
          recommendedPackageName: store.recommendation.primaryPackageName,
          upgradePackageId: store.recommendation.upgradePackageId,
          upgradePackageName: store.recommendation.upgradePackageName,
          estimatedContinuousLoad: store.recommendation.estimatedContinuousLoad,
          estimatedSurgeLoad: store.recommendation.estimatedSurgeLoad,
          expertReviewRequired: store.recommendation.expertReviewRequired,
        }),
      });

      if (response.ok) {
        store.setSubmitted(true);
        trackEvent("installation_requested", {
          package: store.recommendation.primaryPackageId,
        });
      }
    } catch (err) {
      console.error("Failed to submit lead:", err);
    } finally {
      store.setIsSubmitting(false);
    }
  }, [store]);

  const handleReset = useCallback(() => {
    store.reset();
    trackEvent("wizard_restarted");
  }, [store]);

  const primaryPackage = store.recommendation
    ? getFinderPackageById(store.recommendation.primaryPackageId)
    : null;

  const upgradePackage = store.recommendation?.upgradePackageId
    ? (getFinderPackageById(store.recommendation.upgradePackageId) ?? null)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-24 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {store.step <= 5 && (
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Find My Solar System
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Tell us what you want to power. We&apos;ll help you find the right Winsay
              solar package in under 60 seconds.
            </p>
          </div>
        )}

        {store.step <= 5 && (
          <WizardProgress currentStep={store.step} totalSteps={TOTAL_STEPS} />
        )}

        <AnimatePresence mode="wait">
          <div key={store.step} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
            {store.step === 1 && (
              <Step1Appliances
                selected={store.formData.appliances}
                onSelect={store.setAppliances}
                onNext={handleNext}
              />
            )}

            {store.step === 2 && (
              <Step2Property
                propertyType={store.formData.propertyType}
                city={store.formData.city}
                suburb={store.formData.suburb}
                onPropertyTypeChange={(type: PropertyType) => store.setPropertyType(type)}
                onLocationChange={store.setLocation}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 3 && (
              <Step3Backup
                backupDuration={store.formData.backupDuration}
                usagePattern={store.formData.usagePattern}
                onBackupDurationChange={(d: BackupDuration) => store.setBackupDuration(d)}
                onUsagePatternChange={(p: UsagePattern) => store.setUsagePattern(p)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 4 && (
              <Step4Budget
                budget={store.formData.budget}
                onBudgetChange={(b: BudgetRange) => store.setBudget(b)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {store.step === 5 && (
              <Step5Details
                fullName={store.formData.fullName}
                whatsappNumber={store.formData.whatsappNumber}
                email={store.formData.email}
                contactMethod={store.formData.contactMethod}
                installationTimeline={store.formData.installationTimeline}
                isSubmitting={store.isSubmitting}
                onChange={(data) => store.setCustomerDetails(data)}
                onSubmit={handleGenerateRecommendation}
                onBack={handleBack}
              />
            )}

            {store.step === 6 && store.recommendation && primaryPackage && (
              <ResultScreen
                formData={store.formData}
                recommendation={store.recommendation}
                primaryPackage={primaryPackage!}
                upgradePackage={upgradePackage ?? null}
                onRequestInstallation={handleRequestInstallation}
                onReset={handleReset}
              />
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
