"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Building2 } from "lucide-react";
import { departmentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setShowForm(false);
      setForm({ name: "", description: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  return (
    <div>
      <PageHeader
        title="Bo‘limlar"
        description="Tashkilot bo‘limlarini boshqarish"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi bo‘lim
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Yangi bo‘lim" description="Nom va qisqa tavsif" />
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
                required
              />
            </div>
            <div>
              <Label>Tavsif</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
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
        {departments.map(
          (dept: { _id: string; name: string; description?: string }) => (
            <Card key={dept._id} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-[var(--ink)]">
                    {dept.name}
                  </h3>
                  <button
                    onClick={() =>
                      confirm("O'chirishni tasdiqlaysizmi?") &&
                      deleteMutation.mutate(dept._id)
                    }
                    className="rounded-lg p-1.5 text-[var(--ink-faint)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {dept.description || "Tavsif yo‘q"}
                </p>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
