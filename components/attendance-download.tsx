"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, MessageSquareText } from "lucide-react";
import { attendanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  exportAttendanceToExcel,
  getDatesForPeriod,
  type AttendanceExportRecord,
} from "@/lib/export-attendance";

export function AttendanceDownload() {
  const [period, setPeriod] = useState("7d");
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: pending } = useQuery({
    queryKey: ["pending-comments"],
    queryFn: () => attendanceApi.pendingComments().then((r) => r.data),
    refetchInterval: 15000,
  });

  const commentsCount = pending?.count ?? 0;

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const { from, to } = getDatesForPeriod(period);
      const response = await attendanceApi.report({ from, to });
      exportAttendanceToExcel(response.data as AttendanceExportRecord[], from, to);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={downloadReport} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Yuklanmoqda..." : "Excel yuklab olish"}
        </Button>
        <Link
          href="/dashboard/attendance"
          title={
            commentsCount > 0
              ? `${commentsCount} ta yangi xodim izohi`
              : "Xodim izohlari"
          }
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--accent)]/25 bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:brightness-95"
        >
          <MessageSquareText className="h-5 w-5" />
          {commentsCount > 0 && (
            <span className="badge-pulse absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--danger)] px-1 text-[11px] font-bold text-white">
              {commentsCount > 99 ? "99+" : commentsCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
