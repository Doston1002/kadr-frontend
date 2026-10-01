"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarCheck,
  Settings,
  LogOut,
  Camera,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Xodimlar", icon: Users },
  { href: "/dashboard/departments", label: "Bo'limlar", icon: Building2 },
  { href: "/dashboard/attendance", label: "Davomat", icon: CalendarCheck },
  { href: "/dashboard/schedules", label: "Ish vaqtlari", icon: Clock },
  { href: "/dashboard/photos", label: "Rasmlar", icon: Camera },
  { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center gap-3 border-b border-[var(--line)] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-sm">
          <span className="font-display text-lg font-bold">K</span>
        </div>
        <div>
          <p className="font-display text-lg font-semibold leading-none text-[var(--ink)]">
            Kadr
          </p>
          <p className="mt-1 text-xs text-[var(--ink-faint)]">Davomat tizimi</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[var(--brand)] text-white shadow-sm"
                  : "text-[var(--ink-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]",
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px]",
                  active ? "text-white" : "text-[var(--ink-faint)] group-hover:text-[var(--brand)]",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--line)] p-4">
        <div className="mb-3 rounded-xl bg-[var(--surface-muted)] px-3 py-3">
          <p className="truncate text-sm font-semibold text-[var(--ink)]">
            {user?.fullname || user?.username}
          </p>
          <p className="mt-0.5 text-xs capitalize text-[var(--ink-faint)]">
            {user?.role || "admin"}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Chiqish
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-sm lg:hidden"
        aria-label="Menyu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[rgb(16_34_28/0.35)] backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Yopish"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] border-r border-[var(--line)] bg-[var(--surface)] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] lg:hidden"
          aria-label="Yopish"
        >
          <X className="h-5 w-5" />
        </button>
        {Nav}
      </aside>
    </>
  );
}
