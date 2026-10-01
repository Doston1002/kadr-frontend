"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useAuthHydrated } from "@/components/auth-hydrator";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthHydrated();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) router.replace("/login");
  }, [token, hasHydrated, router]);

  if (!hasHydrated) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="surface-panel px-6 py-4 text-sm text-[var(--ink-muted)]">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="app-shell min-h-screen">
      <Sidebar />
      <main className="min-h-screen px-4 pb-10 pt-20 lg:ml-[260px] lg:px-8 lg:pt-8">
        <div className="page-enter mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
