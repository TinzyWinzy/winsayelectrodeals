"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle, Zap, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import { getApplianceById } from "@/lib/solar-finder/appliances";
import { getWhatsAppLink } from "@/lib/solar-finder/whatsapp";
import {
  propertyTypeLabels,
  backupDurationLabels,
  budgetLabels,
} from "@/types/solar-finder";
import type { SolarFinderFormData, RecommendationResult } from "@/types/solar-finder";
import type { FinderPackage } from "@/lib/solar-finder/packages";

interface ResultScreenProps {
  formData: SolarFinderFormData;
  recommendation: RecommendationResult;
  primaryPackage: FinderPackage;
  upgradePackage: FinderPackage | null;
  onRequestInstallation: () => void;
  onReset: () => void;
}

export function ResultScreen({
  formData,
  recommendation,
  primaryPackage,
  upgradePackage,
  onRequestInstallation,
  onReset,
}: ResultScreenProps) {
  const whatsappLink = getWhatsAppLink(formData, recommendation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Your Recommended Winsay System
        </h1>
      </div>

      {recommendation.expertReviewRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">
            Expert review recommended
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Based on your selections, we recommend speaking with a Winsay solar
            specialist for the safest and most cost-effective configuration.
          </p>
        </div>
      )}

      {recommendation.budgetMismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">
            Budget consideration
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Based on what you selected, your power needs may require a larger
            system than your current budget range. We recommend speaking with the
            Winsay team for the safest and most cost-effective configuration.
          </p>
        </div>
      )}

      <Card className="border-2 border-primary/20 overflow-hidden shadow-lg">
        <div className="relative h-48 sm:h-56 bg-gray-100">
          <Image
            src={primaryPackage.image}
            alt={primaryPackage.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <Badge variant="primary" className="text-xs">
              {primaryPackage.badge || "Recommended"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                {primaryPackage.name}
              </h2>
              <p className="text-3xl font-bold text-primary mt-2">
                {formatUsd(primaryPackage.basePriceUsd)}
              </p>
              {primaryPackage.freeGift && (
                <p className="text-xs text-success font-medium mt-1">
                  {primaryPackage.freeGift}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-5">
            {primaryPackage.specs.map((spec, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">{spec}</span>
              </div>
            ))}
          </div>

          {recommendation.reason && (
            <div className="bg-primary/5 rounded-xl p-4 mb-5">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Why we recommend this
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {recommendation.reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {upgradePackage && (
        <Card className="border-2 border-gray-200 overflow-hidden shadow-md">
          <div className="relative h-32 sm:h-40 bg-gray-100">
            <Image
              src={upgradePackage.image}
              alt={upgradePackage.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <Badge variant="secondary" className="text-xs">
                Upgrade Option
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-primary">{upgradePackage.name}</h3>
                <p className="text-xl font-bold text-primary mt-1">
                  {formatUsd(upgradePackage.basePriceUsd)}
                </p>
              </div>
              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-primary mb-3">
            You told us you want to power:
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.appliances.map((sel) => {
              const appliance = getApplianceById(sel.applianceId);
              return (
                <Badge key={sel.applianceId} variant="outline" className="text-xs">
                  {appliance?.name || sel.applianceId}
                  {sel.quantity > 1 ? ` (${sel.quantity})` : ""}
                </Badge>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {formData.propertyType && (
              <div>
                <span className="text-gray-500">Property:</span>
                <p className="font-medium text-primary">
                  {propertyTypeLabels[formData.propertyType]}
                </p>
              </div>
            )}
            {formData.backupDuration && (
              <div>
                <span className="text-gray-500">Backup:</span>
                <p className="font-medium text-primary">
                  {backupDurationLabels[formData.backupDuration]}
                </p>
              </div>
            )}
            {formData.budget && (
              <div>
                <span className="text-gray-500">Budget:</span>
                <p className="font-medium text-primary">
                  {budgetLabels[formData.budget]}
                </p>
              </div>
            )}
            {(formData.city || formData.suburb) && (
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium text-primary">
                  {[formData.city, formData.suburb].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        {recommendation.disclaimer}
      </p>

      <div className="space-y-3 pt-2">
        <Button
          variant="secondary"
          size="lg"
          className="w-full text-base"
          onClick={onRequestInstallation}
        >
          <Zap className="w-5 h-5" />
          Request Installation
        </Button>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="outline" size="lg" className="w-full text-base">
            <MessageCircle className="w-5 h-5" />
            Chat with Winsay on WhatsApp
          </Button>
        </a>
        <button
          type="button"
          onClick={onReset}
          className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors py-2"
        >
          <ArrowRight className="w-3 h-3 inline mr-1" />
          Start Over
        </button>
      </div>
    </motion.div>
  );
}
