import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const adminPaths = ["/leads", "/schedule", "/settings"];
const isAdminPath = (pathname: string) =>
  adminPaths.some((p) => pathname.startsWith(p));

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

    const adminEmails = getAdminEmails();
    if (
      adminEmails.length > 0 &&
      !adminEmails.includes(user.email?.toLowerCase() || "")
    ) {
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
