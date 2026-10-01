"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get().then((r) => r.data),
  });

  const [form, setForm] = useState({
    companyName: "",
    latitude: "",
    longitude: "",
    radius: "",
    timezone: "",
    adminPhone: "",
    botToken: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName || "",
        latitude: settings.officeLocation?.latitude?.toString() || "",
        longitude: settings.officeLocation?.longitude?.toString() || "",
        radius: settings.radius?.toString() || "100",
        timezone: settings.timezone || "Asia/Tashkent",
        adminPhone: settings.adminPhone || "",
        botToken: settings.botToken || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      companyName: form.companyName,
      officeLocation: {
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      },
      radius: parseInt(form.radius),
      timezone: form.timezone,
      adminPhone: form.adminPhone,
      botToken: form.botToken || undefined,
    });
  };

  return (
    <div>
      <PageHeader
        title="Sozlamalar"
        description="Kompaniya, ofis joylashuvi va bot sozlamalari"
      />

      <Card className="max-w-3xl">
        <CardHeader
          title="Umumiy sozlamalar"
          description="Ofis radiusi check-in uchun ishlatiladi"
        />
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Kompaniya nomi</Label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div>
            <Label>Ofis kengligi (Latitude)</Label>
            <Input
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="41.3470559"
            />
          </div>
          <div>
            <Label>Ofis uzunligi (Longitude)</Label>
            <Input
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="69.3399627"
            />
          </div>
          <div>
            <Label>Radius (metr)</Label>
            <Input
              type="number"
              value={form.radius}
              onChange={(e) => setForm({ ...form, radius: e.target.value })}
            />
          </div>
          <div>
            <Label>Vaqt zonasi</Label>
            <Input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            />
          </div>
          <div>
            <Label>Admin telefon</Label>
            <Input
              value={form.adminPhone}
              onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
              placeholder="+998901234567"
            />
          </div>
          <div>
            <Label>Telegram Bot Token</Label>
            <Input
              value={form.botToken}
              onChange={(e) => setForm({ ...form, botToken: e.target.value })}
              placeholder="BotFather token"
              type="password"
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            {saveMutation.isSuccess && (
              <span className="text-sm font-medium text-[var(--success)]">
                Saqlandi!
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
