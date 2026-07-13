import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { isUserRole, roleAtLeast, type UserRole } from "@/lib/rbac";

const adminPaths = ["/leads", "/schedule", "/settings", "/cms", "/crm", "/inventory"];
const isAdminPath = (pathname: string) =>
  adminPaths.some((p) => pathname.startsWith(p));

const routeMinimumRoles: Record<string, UserRole> = {
  "/cms": "MARKETING",
  "/crm": "SALES_AGENT",
  "/inventory": "MANAGER",
  "/leads": "SALES_AGENT",
  "/schedule": "TECHNICIAN",
  "/settings": "MANAGER",
};

function getAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS || "";
  return env
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminPath(request.nextUrl.pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return Response.redirect(url);
    }

    const minimumRole =
      Object.entries(routeMinimumRoles).find(([path]) =>
        request.nextUrl.pathname.startsWith(path)
      )?.[1] || "VIEWER";

    try {
      const { data } = await supabase
        .from("team_members")
        .select("role, active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.active && isUserRole(data.role) && roleAtLeast(data.role, minimumRole)) {
        return supabaseResponse;
      }
    } catch {
      // If team_members has not been migrated yet, keep ADMIN_EMAILS fallback.
    }

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(user.email?.toLowerCase() || "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return Response.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
