"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, Settings, LogOut, Sun, LayoutDashboard } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth, signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white shadow-xl">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold">Winsay Admin</span>
            <span className="text-[10px] text-white/60 block leading-none">Dashboard</span>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/10 font-medium shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-primary">Winsay</span>
          </div>
          <div className="md:hidden flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:text-primary hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-gray-500">
              Signed in as <span className="font-medium text-primary">{user.email}</span>
            </p>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
