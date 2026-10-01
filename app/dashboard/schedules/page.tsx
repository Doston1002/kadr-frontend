"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Clock3 } from "lucide-react";
import { schedulesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

export default function SchedulesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    lateAfter: "09:10",
    earlyLeave: "17:30",
    weekendDays: [6, 0] as number[],
  });

  const weekDays = [
    { label: "Dushanba", value: 1 },
    { label: "Seshanba", value: 2 },
    { label: "Chorshanba", value: 3 },
    { label: "Payshanba", value: 4 },
    { label: "Juma", value: 5 },
    { label: "Shanba", value: 6 },
    { label: "Yakshanba", value: 0 },
  ];

  const toggleWeekendDay = (day: number) => {
    setForm({
      ...form,
      weekendDays: form.weekendDays.includes(day)
        ? form.weekendDays.filter((d) => d !== day)
        : [...form.weekendDays, day],
    });
  };

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => schedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  return (
    <div>
      <PageHeader
        title="Ish vaqtlari"
        description="Ish jadvallari va dam olish kunlarini sozlash"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi jadval
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Yangi jadval" description="Ish vaqti chegaralarini belgilang" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <Label>Nomi</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Standart smena"
                required
              />
            </div>
            <div>
              <Label>Boshlanish</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label>Tugash</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
            <div>
              <Label>Kechikish (dan keyin)</Label>
              <Input
                type="time"
                value={form.lateAfter}
                onChange={(e) => setForm({ ...form, lateAfter: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Dam olish kunlari</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {weekDays.map((day) => {
                  const active = form.weekendDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWeekendDay(day.value)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                        active
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)]"
                          : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]",
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit">Saqlash</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Bekor qilish
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {schedules.map(
          (s: {
            _id: string;
            name: string;
            startTime: string;
            endTime: string;
            lateAfter: string;
            weekendDays?: number[];
          }) => {
            const weekdayLabels: Record<number, string> = {
              0: "Yakshanba",
              1: "Dushanba",
              2: "Seshanba",
              3: "Chorshanba",
              4: "Payshanba",
              5: "Juma",
              6: "Shanba",
            };
            return (
              <Card key={s._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold">{s.name}</h3>
                  </div>
                  <button
                    onClick={() =>
                      confirm("O'chirishni tasdiqlaysizmi?") &&
                      deleteMutation.mutate(s._id)
                    }
                    className="rounded-lg p-1.5 text-[var(--ink-faint)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[var(--ink-muted)]">
                  <p>
                    Ish vaqti:{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {s.startTime} — {s.endTime}
                    </span>
                  </p>
                  <p>
                    Kechikish:{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {s.lateAfter}
                    </span>{" "}
                    dan keyin
                  </p>
                  {s.weekendDays && s.weekendDays.length > 0 && (
                    <p>
                      Dam olish:{" "}
                      {s.weekendDays.map((d) => weekdayLabels[d]).join(", ")}
                    </p>
                  )}
                </div>
              </Card>
            );
          },
        )}
      </div>
    </div>
  );
}
