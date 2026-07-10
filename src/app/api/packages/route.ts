import { NextResponse } from "next/server";
import { getPackages } from "@/lib/db";

export async function GET() {
  try {
    const packages = await getPackages();
    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
