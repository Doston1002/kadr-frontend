"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useAuthHydrated } from "@/components/auth-hydrator";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthHydrated();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(username, password);
      setAuth(data.accessToken, data.user);
      router.push("/dashboard");
    } catch {
      setError("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  if (!hasHydrated || token) {
    return (
      <div className="login-atmosphere flex min-h-screen items-center justify-center">
        <p className="text-white/80">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="login-atmosphere relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 20%) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 20%) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-[0_30px_80px_rgb(0_0_0/0.28)] backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between p-10 text-white lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Davomat platformasi
            </p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-tight">
              Kadr
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/75">
              Xodimlar joylashuvi, kelish-ketish va izohlarni bitta boshqaruv
              panelidan kuzating.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Realtime kuzatuv", value: "Telegram" },
              { label: "Geo nazorat", value: "Ofis radius" },
              { label: "Hisobotlar", value: "Excel" },
              { label: "Izohlar", value: "Admin" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
              >
                <p className="text-xs text-white/60">{item.label}</p>
                <p className="mt-1 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <h1 className="font-display text-3xl font-semibold text-[var(--brand)]">
              Kadr
            </h1>
            <p className="mt-1 text-[var(--ink-muted)]">Davomat boshqaruv tizimi</p>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
              Admin kirishi
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Hisobingizga kiring va panelni boshqaring
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Kirish..." : "Kirish"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
