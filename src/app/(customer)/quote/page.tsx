"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { QuoteProgress } from "@/components/quote/progress-indicator";
import { StepPackage } from "@/components/quote/step-package";
import { StepRoof } from "@/components/quote/step-roof";
import { StepLocation } from "@/components/quote/step-location";
import { StepPhoto } from "@/components/quote/step-photo";
import { StepPaymentTerms } from "@/components/quote/step-payment-terms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { useQuoteStore } from "@/store/quote-store";
import {
  createCustomer,
  getCustomerByPhone,
  createQuote,
  uploadMeterPhoto,
  updateQuote,
} from "@/lib/db";
import { calculateQuotePricing } from "@/lib/pricing";
import { getUsdToZigRate } from "@/lib/currency";
import { compressImage, generateQuoteId } from "@/lib/utils";
import type { Package, RoofType } from "@/types";

function QuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { step, formData, setStep, updateFormData } = useQuoteStore();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pkgIdFromUrl = searchParams.get("package");

  useEffect(() => {
    if (pkgIdFromUrl && !formData.packageId) {
      updateFormData({ packageId: pkgIdFromUrl });
    }
  }, [pkgIdFromUrl, formData.packageId, updateFormData]);

  const handlePackageNext = useCallback(
    (pkg: Package) => {
      setSelectedPackage(pkg);
      setStep(2);
    },
    [setStep]
  );

  const handleRoofSelect = useCallback(
    (type: RoofType) => {
      updateFormData({ roofType: type });
    },
    [updateFormData]
  );

  const handleSubmit = async () => {
    if (!selectedPackage || !formData.roofType || !formData.province || !formData.city || !formData.suburb) {
      setError("Please complete all steps.");
      return;
    }

    if (!formData.customerName || formData.customerName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!formData.phone || !/^(\+263|0)\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid Zimbabwe phone number (e.g. +263771234567 or 0771234567).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let customerId: string;
      const existing = await getCustomerByPhone(formData.phone);
      if (existing) {
        customerId = existing.id;
      } else {
        customerId = await createCustomer({
          name: formData.customerName,
          phone: formData.phone,
          email: formData.email || null,
          province: formData.province,
          city: formData.city,
          suburb: formData.suburb,
        });
      }

      const quoteId = generateQuoteId();

      const zigRate = await getUsdToZigRate();
      const pricing = calculateQuotePricing({
        pkg: selectedPackage,
        roofType: formData.roofType,
        province: formData.province,
        payAfterInstall: formData.payAfterInstall,
        zigRate,
      });

      const docId = await createQuote({
        customerId,
        packageId: selectedPackage.id,
        roofType: formData.roofType,
        location: `${formData.suburb}, ${formData.city}, ${formData.province}`,
        meterPhotoUrl: null,
        totalUsd: pricing.totalUsd,
        totalZig: pricing.totalZig,
        depositUsd: pricing.depositUsd,
        depositZig: pricing.depositZig,
        paymentMethod: formData.paymentMethod as "ecocash" | "innbucks" | "bank_transfer" | "paynow",
        status: "pending",
        quoteId,
        payAfterInstall: formData.payAfterInstall,
      });

      // Upload photo after quote creation so orphaned uploads don't occur on failure
      if (formData.meterPhotoFile) {
        try {
          const compressed = await compressImage(formData.meterPhotoFile);
          const meterPhotoUrl = await uploadMeterPhoto(compressed, quoteId);
          await updateQuote(docId, { meterPhotoUrl });
        } catch {
          // Quote already exists; photo is optional. Continue.
        }
      }

      router.push(`/payment?quote=${docId}&quoteId=${quoteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-2"
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.push("/packages"))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-gray-300 transition-all"
            aria-label={step > 1 ? "Go back" : "Back to packages"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary">Get a Quote</h1>
            <p className="text-sm text-gray-500">
              {step <= 5 ? `Step ${step} of 5` : "Summary"}
            </p>
          </div>
        </motion.div>

        {step <= 5 && (
          <div className="pt-4 pb-6">
            <QuoteProgress currentStep={step} />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger"
          >
            {error}
          </motion.div>
        )}

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && !pkgIdFromUrl && (
                <div className="text-center py-12 text-gray-500">
                  <p>No package selected. Please browse our packages first.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push("/packages")}>
                    View Packages
                  </Button>
                </div>
              )}
              {step === 1 && pkgIdFromUrl && !formData.packageId && (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              )}
              {step === 1 && pkgIdFromUrl && formData.packageId && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StepPackage
                    packageId={formData.packageId}
                    onNext={handlePackageNext}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StepRoof
                    selected={formData.roofType}
                    onSelect={handleRoofSelect}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StepLocation
                    province={formData.province}
                    city={formData.city}
                    suburb={formData.suburb}
                    onProvinceChange={(v) => updateFormData({ province: v })}
                    onCityChange={(v) => updateFormData({ city: v })}
                    onSuburbChange={(v) => updateFormData({ suburb: v })}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StepPhoto
                    onFileSelect={(file) => updateFormData({ meterPhotoFile: file })}
                    onBack={() => setStep(3)}
                    onNext={() => setStep(5)}
                    existingFile={formData.meterPhotoFile}
                    existingUrl={formData.meterPhotoUrl}
                  />
                </motion.div>
              )}

              {step === 5 && selectedPackage && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-5 mb-6">
                    <Input
                      label="Your Name"
                      placeholder="Full name"
                      value={formData.customerName}
                      onChange={(e) => updateFormData({ customerName: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+263 77 123 4567"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                    />
                    <Input
                      label="Email (optional)"
                      placeholder="email@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                    />
                  </div>

                  <StepPaymentTerms
                    payAfterInstall={formData.payAfterInstall}
                    canPayAfterInstall={selectedPackage.payAfterInstallEligible}
                    onChange={(v) => updateFormData({ payAfterInstall: v })}
                    onBack={() => setStep(4)}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <QuoteContent />
    </Suspense>
  );
}
