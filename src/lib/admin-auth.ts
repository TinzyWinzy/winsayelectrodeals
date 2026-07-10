import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS || "";
  return env
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return null;

  if (!adminEmails.includes(user.email.toLowerCase())) return null;

  return user;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
