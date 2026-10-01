"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { employeesApi, departmentsApi, schedulesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
  /\/api\/?$/,
  "",
);

interface Employee {
  _id: string;
  fullname: string;
  phone: string;
  position?: string;
  status: string;
  department?: { _id: string; name: string };
  schedule?: { _id: string; name: string };
  telegramId?: string;
  profilePhotoUrl?: string;
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    position: "",
    department: "",
    schedule: "",
    status: "active",
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", search],
    queryFn: () => employeesApi.list({ search }).then((r) => r.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentsApi.list().then((r) => r.data),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => schedulesApi.list().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = editId
        ? await employeesApi.update(editId, data)
        : await employeesApi.create(data);
      const employeeId = editId || res.data._id;
      if (photoFile && employeeId) {
        await employeesApi.uploadPhoto(employeeId, photoFile);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm({
      fullname: "",
      phone: "",
      position: "",
      department: "",
      schedule: "",
      status: "active",
    });
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp._id);
    setPhotoFile(null);
    setPhotoPreview(emp.profilePhotoUrl ? `${API_BASE}${emp.profilePhotoUrl}` : null);
    setForm({
      fullname: emp.fullname,
      phone: emp.phone,
      position: emp.position || "",
      department: emp.department?._id || "",
      schedule: emp.schedule?._id || "",
      status: emp.status,
    });
    setShowForm(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId && !photoFile) {
      alert("Xodim rasmini yuklash majburiy (yuz tekshiruvi uchun)");
      return;
    }
    const payload: Record<string, unknown> = { ...form };
    if (!payload.department) delete payload.department;
    if (!payload.schedule) delete payload.schedule;
    saveMutation.mutate(payload);
  };

  return (
    <div>
      <PageHeader
        title="Xodimlar"
        description="Xodimlarni qo‘shish, tahrirlash va holatini boshqarish"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yangi xodim
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader
            title={editId ? "Xodimni tahrirlash" : "Yangi xodim"}
            description="Asosiy ma’lumotlarni to‘ldiring"
          />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>F.I.O</Label>
              <Input
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+998901234567"
                required
              />
            </div>
            <div>
              <Label>Lavozim</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <Label>Bo&apos;lim</Label>
              <Select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Tanlang</option>
                {departments.map((d: { _id: string; name: string }) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Ish vaqti</Label>
              <Select
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              >
                <option value="">Tanlang</option>
                {schedules.map((s: { _id: string; name: string }) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Holat</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="on_leave">Ta&apos;tilda</option>
                <option value="sick">Kasallik</option>
                <option value="business_trip">Xizmat safari</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Xodim rasmi (yuz tekshiruvi uchun){!editId ? " *" : ""}</Label>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Xodim rasmi"
                    className="h-24 w-24 rounded-xl object-cover ring-1 ring-[var(--line)]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--ink-faint)]">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required={!editId}
                  />
                  <p className="mt-1 text-xs text-[var(--ink-faint)]">
                    Yuz aniq ko‘rinadigan rasm yuklang. Davomatda selfie shu rasm bilan solishtiriladi.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Bekor qilish
              </Button>
            </div>
            {saveMutation.isError && (
              <p className="text-sm text-[var(--danger)] md:col-span-2">
                {(saveMutation.error as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message || "Xatolik yuz berdi"}
              </p>
            )}
          </form>
        </Card>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--ink-faint)]" />
        <Input
          className="pl-10"
          placeholder="Ism yoki telefon bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rasm</th>
                <th>F.I.O</th>
                <th>Telefon</th>
                <th>Lavozim</th>
                <th>Bo&apos;lim</th>
                <th>Holat</th>
                <th>Telegram</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[var(--ink-faint)]">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[var(--ink-faint)]">
                    Xodimlar topilmadi
                  </td>
                </tr>
              ) : (
                employees.map((emp: Employee) => (
                  <tr key={emp._id}>
                    <td>
                      {emp.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${API_BASE}${emp.profilePhotoUrl}`}
                          alt={emp.fullname}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs text-[var(--ink-faint)]">
                          —
                        </div>
                      )}
                    </td>
                    <td className="font-semibold">{emp.fullname}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.position || "-"}</td>
                    <td className="max-w-[220px] text-[var(--ink-muted)]">
                      {emp.department?.name || "-"}
                    </td>
                    <td>
                      <Badge status={emp.status} />
                    </td>
                    <td>
                      {emp.telegramId ? (
                        <span className="font-medium text-[var(--success)]">Ulangan</span>
                      ) : (
                        <span className="text-[var(--ink-faint)]">Ulanmagan</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => openEdit(emp)}
                        className="inline-flex rounded-lg p-2 text-[var(--ink-faint)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          confirm("O'chirishni tasdiqlaysizmi?") &&
                          deleteMutation.mutate(emp._id)
                        }
                        className="ml-1 inline-flex rounded-lg p-2 text-[var(--ink-faint)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
