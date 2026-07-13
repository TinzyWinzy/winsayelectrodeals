import { NextResponse } from "next/server";
import { submitLead } from "@/lib/solar-finder/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      "fullName",
      "whatsappNumber",
      "appliances",
      "recommendedPackageId",
      "recommendedPackageName",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const id = await submitLead({
      fullName: body.fullName,
      whatsappNumber: body.whatsappNumber,
      email: body.email || "",
      city: body.city || "",
      suburb: body.suburb || "",
      appliances: body.appliances,
      propertyType: body.propertyType || null,
      backupDuration: body.backupDuration || null,
      usagePattern: body.usagePattern || null,
      budget: body.budget || null,
      installationTimeline: body.installationTimeline || "researching",
      recommendedPackageId: body.recommendedPackageId,
      recommendedPackageName: body.recommendedPackageName,
      upgradePackageId: body.upgradePackageId || null,
      upgradePackageName: body.upgradePackageName || null,
      estimatedContinuousLoad: body.estimatedContinuousLoad || 0,
      estimatedSurgeLoad: body.estimatedSurgeLoad || 0,
      expertReviewRequired: body.expertReviewRequired || false,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Solar finder lead submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}
