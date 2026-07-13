import { NextResponse } from "next/server";
import { getLeads, submitLead, updateLeadStatus } from "@/lib/solar-finder/db";
import { getAdminUser, unauthorizedResponse } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { leadStatusLabels, type LeadStatus } from "@/types/solar-finder";

export async function GET() {
  const admin = await getAdminUser("SALES_AGENT");
  if (!admin) return unauthorizedResponse();

  try {
    const leads = await getLeads();
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch solar finder leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`solar-finder:${ip}`, 8, 3600000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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

    const url = new URL(request.url);
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
      utmSource: body.utmSource || url.searchParams.get("utm_source"),
      utmMedium: body.utmMedium || url.searchParams.get("utm_medium"),
      utmCampaign: body.utmCampaign || url.searchParams.get("utm_campaign"),
      utmContent: body.utmContent || url.searchParams.get("utm_content"),
      referrer: body.referrer || request.headers.get("referer"),
      landingPage: body.landingPage || request.headers.get("referer"),
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

export async function PATCH(request: Request) {
  const admin = await getAdminUser("SALES_AGENT");
  if (!admin) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== "string" || !(status in leadStatusLabels)) {
      return NextResponse.json(
        { error: "Valid id and status are required" },
        { status: 400 }
      );
    }

    await updateLeadStatus(id, status as LeadStatus);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update lead status" },
      { status: 500 }
    );
  }
}
