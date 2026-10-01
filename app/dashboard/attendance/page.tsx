"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserRound,
  X,
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
} from "lucide-react";
import { attendanceApi, employeesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { cn, formatTime, commentReasonLabels } from "@/lib/utils";
import { AttendanceDownload } from "@/components/attendance-download";
import { EmployeeAttendanceModal } from "@/components/employee-attendance-modal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

type FilterKey = "all" | "present" | "absent" | "late" | "at_work";

interface PhotoInfo {
  _id: string;
  url: string;
}

interface EmployeeInfo {
  _id: string;
  fullname: string;
  phone: string;
  department?: { name: string };
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  checkInDistance?: number;
  comment?: string;
  employeeComment?: string;
  commentReason?: string;
  employeeCommentAt?: string;
  checkInPhoto?: PhotoInfo | string | null;
  checkOutPhoto?: PhotoInfo | string | null;
  employeeId: EmployeeInfo;
}

interface AttendanceRow {
  key: string;
  attendanceId?: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  checkInDistance?: number;
  comment?: string;
  employeeComment?: string;
  commentReason?: string;
  employeeCommentAt?: string;
  checkInPhoto?: PhotoInfo | string | null;
  checkOutPhoto?: PhotoInfo | string | null;
  employee: EmployeeInfo;
}

function photoUrl(photo?: PhotoInfo | string | null) {
  if (!photo || typeof photo === "string") return null;
  if (!photo.url) return null;
  return photo.url.startsWith("http") ? photo.url : `${API_BASE}${photo.url}`;
}

function TimeWithAvatar({
  time,
  photo,
  label,
  onOpen,
}: {
  time?: string;
  photo?: PhotoInfo | string | null;
  label: string;
  onOpen: (src: string, label: string) => void;
}) {
  const src = photoUrl(photo);

  return (
    <div className="flex items-center gap-2.5">
      {src ? (
        <button
          type="button"
          onClick={() => onOpen(src, label)}
          className="shrink-0 overflow-hidden rounded-full border-2 border-[var(--brand-soft)] shadow-sm transition-transform hover:scale-105"
          title={`${label} rasmini ochish`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="h-10 w-10 object-cover" />
        </button>
      ) : (
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-faint)]">
          <UserRound className="h-4 w-4" />
        </span>
      )}
      <span className="font-medium tabular-nums">{formatTime(time)}</span>
    </div>
  );
}

function FilterCard({
  title,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface-panel relative overflow-hidden p-4 text-left transition-all",
        active
          ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--bg)]"
          : "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20", tone)} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
            {title}
          </p>
          <p className="font-display mt-2 text-3xl font-semibold text-[var(--ink)]">
            {value}
          </p>
        </div>
        <div className={cn("rounded-xl p-2.5 text-white", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

function matchesFilter(row: AttendanceRow, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "present") return Boolean(row.checkIn);
  if (filter === "absent") return !row.checkIn;
  if (filter === "late") return row.status === "late";
  if (filter === "at_work") return Boolean(row.checkIn) && !row.checkOut;
  return true;
}

const filterTitles: Record<FilterKey, string> = {
  all: "Barcha xodimlar",
  present: "Bugun kelganlar",
  absent: "Bugun kelmaganlar",
  late: "Bugun kechikkanlar",
  at_work: "Hozir ishda turganlar",
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(
    null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeInfo | null>(
    null,
  );

  const { data: records = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => attendanceApi.today().then((r) => r.data as AttendanceRecord[]),
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees", "active"],
    queryFn: () =>
      employeesApi.list({ status: "active" }).then((r) => r.data as EmployeeInfo[]),
  });

  const isLoading = loadingAttendance || loadingEmployees;

  const rows = useMemo<AttendanceRow[]>(() => {
    const byEmployee = new Map<string, AttendanceRecord>();
    for (const record of records) {
      const id = record.employeeId?._id;
      if (id) byEmployee.set(id, record);
    }

    return employees.map((employee) => {
      const record = byEmployee.get(employee._id);
      if (record) {
        return {
          key: record._id,
          attendanceId: record._id,
          status: record.status,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          checkInDistance: record.checkInDistance,
          comment: record.comment,
          employeeComment: record.employeeComment,
          commentReason: record.commentReason,
          employeeCommentAt: record.employeeCommentAt,
          checkInPhoto: record.checkInPhoto,
          checkOutPhoto: record.checkOutPhoto,
          employee: record.employeeId || employee,
        };
      }

      return {
        key: `absent-${employee._id}`,
        status: "absent",
        employee,
      };
    });
  }, [employees, records]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      present: rows.filter((r) => r.checkIn).length,
      absent: rows.filter((r) => !r.checkIn).length,
      late: rows.filter((r) => r.status === "late").length,
      at_work: rows.filter((r) => r.checkIn && !r.checkOut).length,
    }),
    [rows],
  );

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesFilter(row, filter)),
    [rows, filter],
  );

  const commentMutation = useMutation({
    mutationFn: (data: { attendanceId: string; comment: string }) =>
      attendanceApi.updateComment(data.attendanceId, data.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      queryClient.invalidateQueries({ queryKey: ["pending-comments"] });
      setEditingId(null);
      setComment("");
    },
  });

  return (
    <div>
      <PageHeader
        title="Davomat"
        description="Bugungi 1 kunlik davomat — kartochkani bosib filtrlash"
        actions={<AttendanceDownload />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <FilterCard
          title="Jami xodimlar"
          value={counts.all}
          icon={Users}
          tone="bg-[var(--brand)]"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterCard
          title="Kelganlar"
          value={counts.present}
          icon={UserCheck}
          tone="bg-[var(--success)]"
          active={filter === "present"}
          onClick={() => setFilter("present")}
        />
        <FilterCard
          title="Kelmaganlar"
          value={counts.absent}
          icon={UserX}
          tone="bg-[var(--danger)]"
          active={filter === "absent"}
          onClick={() => setFilter("absent")}
        />
        <FilterCard
          title="Kechikkanlar"
          value={counts.late}
          icon={Clock}
          tone="bg-[var(--warning)]"
          active={filter === "late"}
          onClick={() => setFilter("late")}
        />
        <FilterCard
          title="Ishda turganlar"
          value={counts.at_work}
          icon={Briefcase}
          tone="bg-[var(--info)]"
          active={filter === "at_work"}
          onClick={() => setFilter("at_work")}
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {filterTitles[filter]}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            {filteredRows.length} ta yozuv
          </p>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Xodim</th>
                <th>Bo&apos;lim</th>
                <th>Kelish</th>
                <th>Ketish</th>
                <th>Masofa</th>
                <th>Holat</th>
                <th>Xodim izohi</th>
                <th>Admin izohi</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[var(--ink-faint)]">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[var(--ink-faint)]">
                    Bu filtr bo&apos;yicha yozuv topilmadi
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <React.Fragment key={r.key}>
                    <tr className={r.employeeComment ? "has-comment" : undefined}>
                      <td className="font-semibold">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(r.employee)}
                          className="text-left text-[var(--brand)] underline-offset-2 transition-colors hover:text-[var(--brand-strong)] hover:underline"
                        >
                          {r.employee?.fullname || "-"}
                        </button>
                      </td>
                      <td className="max-w-[220px] text-[var(--ink-muted)]">
                        {r.employee?.department?.name || "-"}
                      </td>
                      <td>
                        <TimeWithAvatar
                          time={r.checkIn}
                          photo={r.checkInPhoto}
                          label="Kelish"
                          onOpen={(src, label) => setPreview({ src, label })}
                        />
                      </td>
                      <td>
                        <TimeWithAvatar
                          time={r.checkOut}
                          photo={r.checkOutPhoto}
                          label="Ketish"
                          onOpen={(src, label) => setPreview({ src, label })}
                        />
                      </td>
                      <td>{r.checkInDistance ? `${r.checkInDistance}m` : "-"}</td>
                      <td>
                        <Badge status={r.status} />
                      </td>
                      <td>
                        {r.employeeComment ? (
                          <div className="max-w-[220px] space-y-1">
                            {r.commentReason && (
                              <span className="inline-flex rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                                {commentReasonLabels[r.commentReason] || r.commentReason}
                              </span>
                            )}
                            <p className="text-sm text-[var(--ink)]">{r.employeeComment}</p>
                            {r.employeeCommentAt && (
                              <p className="text-xs text-[var(--ink-faint)]">
                                {formatTime(r.employeeCommentAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--ink-faint)]">Izoh yo&apos;q</span>
                        )}
                      </td>
                      <td>
                        {r.comment ? (
                          <span className="text-sm">{r.comment}</span>
                        ) : (
                          <span className="text-sm text-[var(--ink-faint)]">Izoh yo&apos;q</span>
                        )}
                      </td>
                      <td>
                        {r.attendanceId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(r.attendanceId!);
                              setComment(r.comment || "");
                            }}
                          >
                            Admin izohi
                          </Button>
                        ) : (
                          <span className="text-sm text-[var(--ink-faint)]">—</span>
                        )}
                      </td>
                    </tr>
                    {editingId === r.attendanceId && r.attendanceId && (
                      <tr>
                        <td colSpan={9} className="bg-[var(--surface-muted)]">
                          <div className="grid max-w-2xl gap-3 py-2">
                            <p className="text-sm font-medium text-[var(--ink-muted)]">
                              Admin izohi yozing (masalan: tasdiqlandi, rad etildi)
                            </p>
                            <Textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  commentMutation.mutate({
                                    attendanceId: r.attendanceId!,
                                    comment,
                                  })
                                }
                                disabled={commentMutation.isPending}
                              >
                                Saqlash
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditingId(null);
                                  setComment("");
                                }}
                              >
                                Bekor qilish
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedEmployee && (
        <EmployeeAttendanceModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgb(16_34_28/0.55)] p-4 backdrop-blur-[2px]"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <p className="font-semibold text-[var(--ink)]">{preview.label} selfiesi</p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.src}
              alt={preview.label}
              className="max-h-[70vh] w-full object-contain bg-[var(--surface-muted)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
