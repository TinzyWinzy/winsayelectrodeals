import type { SolarFinderFormData, RecommendationResult } from "@/types/solar-finder";
import { propertyTypeLabels, backupDurationLabels, budgetLabels, timelineLabels } from "@/types/solar-finder";
import { getApplianceById } from "./appliances";

const BUSINESS_PHONE = "263785293587";
const WHATSAPP_BASE_URL = "https://wa.me";

export function generateWhatsAppMessage(
  formData: SolarFinderFormData,
  recommendation: RecommendationResult
): string {
  const applianceNames = formData.appliances
    .map((sel) => {
      const appliance = getApplianceById(sel.applianceId);
      const name = appliance?.name || sel.applianceId;
      return sel.quantity > 1 ? `${sel.quantity} × ${name}` : name;
    })
    .join(", ");

  const propertyText = formData.propertyType
    ? propertyTypeLabels[formData.propertyType]
    : "Not specified";

  const backupText = formData.backupDuration
    ? backupDurationLabels[formData.backupDuration]
    : "Not specified";

  const locationParts: string[] = [];
  if (formData.city) locationParts.push(formData.city);
  if (formData.suburb) locationParts.push(formData.suburb);
  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "Not specified";

  const budgetText = formData.budget ? budgetLabels[formData.budget] : "Not specified";
  const timelineText = timelineLabels[formData.installationTimeline];

  const lines = [
    "Hi Winsay, I used your Solar System Finder.",
    "",
    `My recommended package is the ${recommendation.primaryPackageName} at $${recommendation.primaryPackagePrice.toLocaleString()}.`,
    "",
    "I want to power:",
    applianceNames,
    "",
    `Property: ${propertyText}`,
    `Backup requirement: ${backupText}`,
    `Budget: ${budgetText}`,
    `Location: ${locationText}`,
    "",
    `My name is: ${formData.fullName}`,
    `My number is: ${formData.whatsappNumber}`,
    `Installation timeline: ${timelineText}`,
    "",
    "I would like to discuss installation.",
  ];

  return lines.join("\n");
}

export function getWhatsAppLink(
  formData: SolarFinderFormData,
  recommendation: RecommendationResult
): string {
  const message = generateWhatsAppMessage(formData, recommendation);
  const encoded = encodeURIComponent(message);
  return `${WHATSAPP_BASE_URL}/${BUSINESS_PHONE}?text=${encoded}`;
}
