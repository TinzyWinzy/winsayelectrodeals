import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedResponse } from "@/lib/admin-auth";
import {
  completeFollowUp,
  createFollowUp,
  getFollowUps,
  getLeadsPipeline,
  updateLeadPipelineStatus,
} from "@/lib/lead-db";
import { pipelineStatusLabels, type FollowUpType, type PipelineStatus } from "@/types/leads";

export async function GET(request: Request) {
  const admin = await getAdminUser("SALES_AGENT");
  if (!admin) return unauthorizedResponse();

  const type = new URL(request.url).searchParams.get("type") || "pipeline";

  try {
    if (type === "follow-ups") {
      const followUps = await getFollowUps();
      return NextResponse.json({ followUps });
    }

    const leads = await getLeadsPipeline();
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser("SALES_AGENT");
  if (!admin) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !(status in pipelineStatusLabels)) {
      return NextResponse.json({ error: "Valid lead id and status are required" }, { status: 400 });
    }

    await updateLeadPipelineStatus(id, status as PipelineStatus);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser("SALES_AGENT");
  if (!admin) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (body.action === "complete-follow-up") {
      if (!body.id) return NextResponse.json({ error: "Follow-up id required" }, { status: 400 });
      await completeFollowUp(body.id, body.outcome || "Completed");
      return NextResponse.json({ success: true });
    }

    if (!body.leadId || !body.dueAt || !body.followUpType) {
      return NextResponse.json({ error: "leadId, dueAt, and followUpType are required" }, { status: 400 });
    }

    const id = await createFollowUp({
      leadId: body.leadId,
      customerId: body.customerId || null,
      followUpType: body.followUpType as FollowUpType,
      dueAt: body.dueAt,
      priority: body.priority,
      notes: body.notes,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save follow-up" }, { status: 500 });
  }
}
