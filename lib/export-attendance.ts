import * as XLSX from "xlsx";
import {
  commentReasonLabels,
  formatDate,
  formatTime,
  statusLabels,
} from "@/lib/utils";

export interface AttendanceExportRecord {
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  checkInDistance?: number;
  comment?: string;
  employeeComment?: string;
  commentReason?: string;
  employeeId?: {
    fullname?: string;
    phone?: string;
    department?: { name?: string };
  };
}

export function getDatesForPeriod(periodValue: string) {
  const to = new Date();
  const from = new Date();

  if (periodValue === "7d") {
    from.setDate(to.getDate() - 6);
  } else if (periodValue === "30d") {
    from.setDate(to.getDate() - 29);
  } else if (periodValue === "90d") {
    from.setDate(to.getDate() - 89);
  } else if (periodValue === "today") {
    // bugungi kun
  } else if (periodValue === "all") {
    return { from: "", to: "" };
  } else {
    from.setDate(to.getDate() - 6);
  }

  const format = (date: Date) => date.toISOString().split("T")[0];
  return { from: format(from), to: format(to) };
}

export function exportAttendanceToExcel(
  data: AttendanceExportRecord[],
  from: string,
  to: string,
) {
  const headers = [
    "Sana",
    "Xodim",
    "Telefon",
    "Bo'lim",
    "Kelish",
    "Ketish",
    "Masofa (m)",
    "Holat",
    "Izoh sababi",
    "Xodim izohi",
    "Admin izohi",
  ];

  const rows = data.map((record) => [
    formatDate(record.date),
    record.employeeId?.fullname || "-",
    record.employeeId?.phone || "-",
    record.employeeId?.department?.name || "-",
    formatTime(record.checkIn),
    formatTime(record.checkOut),
    record.checkInDistance ?? "-",
    statusLabels[record.status] || record.status,
    record.commentReason
      ? commentReasonLabels[record.commentReason] || record.commentReason
      : "-",
    record.employeeComment || "-",
    record.comment || "-",
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat");
  XLSX.writeFile(workbook, `davomat_${from}_${to}.xlsx`);
}

export function exportEmployeeAttendanceToExcel(
  data: AttendanceExportRecord[],
  employeeName: string,
  from: string,
  to: string,
) {
  const safeName = employeeName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  const headers = [
    "Sana",
    "Kelish",
    "Ketish",
    "Masofa (m)",
    "Holat",
    "Izoh sababi",
    "Xodim izohi",
    "Admin izohi",
  ];

  const rows = data.map((record) => [
    formatDate(record.date),
    formatTime(record.checkIn),
    formatTime(record.checkOut),
    record.checkInDistance ?? "-",
    statusLabels[record.status] || record.status,
    record.commentReason
      ? commentReasonLabels[record.commentReason] || record.commentReason
      : "-",
    record.employeeComment || "-",
    record.comment || "-",
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Davomat");
  XLSX.writeFile(workbook, `davomat_${safeName || "xodim"}_${from}_${to}.xlsx`);
}
