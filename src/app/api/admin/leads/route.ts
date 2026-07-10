import { NextResponse } from "next/server";
import { getAllQuotes } from "@/lib/db";
import { getAdminUser, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const quotes = await getAllQuotes();
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
