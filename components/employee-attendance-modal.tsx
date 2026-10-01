"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, UserRound, X } from "lucide-react";
import { attendanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import {
  exportEmployeeAttendanceToExcel,
  getDatesForPeriod,
  type AttendanceExportRecord,
} from "@/lib/export-attendance";
import { commentReasonLabels, formatDate, formatTime } from "@/lib/utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

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

interface HistoryRecord {
  _id: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  checkInDistance?: number;
  comment?: string;
  employeeComment?: string;
  commentReason?: string;
  checkInPhoto?: PhotoInfo | string | null;
  checkOutPhoto?: PhotoInfo | string | null;
  employeeId?: EmployeeInfo;
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
    <div className="flex items-center gap-2">
      {src ? (
        <button
          type="button"
          onClick={() => onOpen(src, label)}
          className="shrink-0 overflow-hidden rounded-full border border-[var(--brand-soft)] transition-transform hover:scale-105"
          title={`${label} rasmini ochish`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="h-8 w-8 object-cover" />
        </button>
      ) : (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--ink-faint)]">
          <UserRound className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="font-medium tabular-nums">{formatTime(time)}</span>
    </div>
  );
}

export function EmployeeAttendanceModal({
  employee,
  onClose,
}: {
  employee: EmployeeInfo;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState("30d");
  const [isDownloading, setIsDownloading] = useState(false);
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(
    null,
  );

  const { from, to } = useMemo(() => getDatesForPeriod(period), [period]);
  const hasRange = Boolean(from && to);
  const exportFrom = from || "barcha";
  const exportTo = to || new Date().toISOString().split("T")[0];

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["attendance-history", employee._id, from, to, period],
    queryFn: () =>
      attendanceApi
        .history(
          employee._id,
          hasRange ? { from, to } : undefined,
        )
        .then((r) => r.data as HistoryRecord[]),
  });

  const exportRecords: AttendanceExportRecord[] = useMemo(
    () =>
      records.map((record) => ({
        date: record.date,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        checkInDistance: record.checkInDistance,
        comment: record.comment,
        employeeComment: record.employeeComment,
        commentReason: record.commentReason,
        employeeId: record.employeeId || employee,
      })),
    [records, employee],
  );

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      exportEmployeeAttendanceToExcel(
        exportRecords,
        employee.fullname,
        exportFrom,
        exportTo,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgb(16_34_28/0.55)] p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-[var(--surface)] shadow-xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">
                Xodim davomati
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-[var(--ink)]">
                {employee.fullname}
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {employee.department?.name || "Bo'lim ko'rsatilmagan"}
                {employee.phone ? ` · ${employee.phone}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--ink-muted)]">
                Vaqt oralig&apos;i
              </span>
              <Select
                className="min-w-[160px]"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Bugun</option>
                <option value="7d">Oxirgi 1 hafta</option>
                <option value="30d">Oxirgi 1 oy</option>
                <option value="90d">Oxirgi 3 oy</option>
                <option value="all">Barcha davomat</option>
              </Select>
            </div>
            <Button onClick={downloadReport} disabled={isDownloading || records.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Yuklanmoqda..." : "Excel yuklab olish"}
            </Button>
          </div>

          <div className="overflow-auto">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Kelish</th>
                    <th>Ketish</th>
                    <th>Masofa</th>
                    <th>Holat</th>
                    <th>Xodim izohi</th>
                    <th>Admin izohi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[var(--ink-faint)]">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[var(--ink-faint)]">
                        Bu vaqt oralig&apos;ida davomat topilmadi
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record._id}>
                        <td className="font-medium">{formatDate(record.date)}</td>
                        <td>
                          <TimeWithAvatar
                            time={record.checkIn}
                            photo={record.checkInPhoto}
                            label="Kelish"
                            onOpen={(src, label) => setPreview({ src, label })}
                          />
                        </td>
                        <td>
                          <TimeWithAvatar
                            time={record.checkOut}
                            photo={record.checkOutPhoto}
                            label="Ketish"
                            onOpen={(src, label) => setPreview({ src, label })}
                          />
                        </td>
                        <td>
                          {record.checkInDistance ? `${record.checkInDistance}m` : "-"}
                        </td>
                        <td>
                          <Badge status={record.status} />
                        </td>
                        <td>
                          {record.employeeComment ? (
                            <div className="max-w-[220px] space-y-1">
                              {record.commentReason && (
                                <span className="inline-flex rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                                  {commentReasonLabels[record.commentReason] ||
                                    record.commentReason}
                                </span>
                              )}
                              <p className="text-sm text-[var(--ink)]">
                                {record.employeeComment}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--ink-faint)]">Izoh yo&apos;q</span>
                          )}
                        </td>
                        <td>
                          {record.comment ? (
                            <span className="text-sm">{record.comment}</span>
                          ) : (
                            <span className="text-sm text-[var(--ink-faint)]">Izoh yo&apos;q</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
              className="max-h-[70vh] w-full bg-[var(--surface-muted)] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
