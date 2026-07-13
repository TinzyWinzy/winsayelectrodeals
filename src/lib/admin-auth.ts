import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { isUserRole, roleAtLeast, type UserRole } from "@/lib/rbac";

type TeamMemberAccessRow = {
  role: string | null;
  active: boolean | null;
};

function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS || "";
  return env
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser(minimumRole: UserRole = "VIEWER") {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;

  try {
    const { data } = await supabase
      .from("team_members")
      .select("role, active")
      .eq("user_id", user.id)
      .maybeSingle();
    const member = data as TeamMemberAccessRow | null;

    if (member?.active && isUserRole(member.role) && roleAtLeast(member.role, minimumRole)) {
      return { ...user, role: member.role };
    }
  } catch {
    // If the migration has not been applied yet, fall back to ADMIN_EMAILS.
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(user.email.toLowerCase())) return null;

  return { ...user, role: "SUPER_ADMIN" as UserRole };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
