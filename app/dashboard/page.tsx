"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { attendanceApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { AttendanceDownload } from "@/components/attendance-download";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div
        className={cn(
          "absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20",
          tone,
        )}
      />
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
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => attendanceApi.dashboard().then((r) => r.data),
  });

  const { data: weekly } = useQuery({
    queryKey: ["weekly"],
    queryFn: () => attendanceApi.weekly().then((r) => r.data),
  });

  const chartData = (weekly || []).map(
    (d: { _id: string; present: number; late: number }) => ({
      date: d._id.slice(5),
      kelgan: d.present,
      kechikkan: d.late,
    }),
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Bugungi davomat statistikasi va haftalik ko‘rinish"
        actions={<AttendanceDownload />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Jami xodimlar"
          value={stats?.totalEmployees ?? 0}
          icon={Users}
          tone="bg-[var(--brand)]"
        />
        <StatCard
          title="Kelganlar"
          value={stats?.present ?? 0}
          icon={UserCheck}
          tone="bg-[var(--success)]"
        />
        <StatCard
          title="Kelmaganlar"
          value={stats?.absent ?? 0}
          icon={UserX}
          tone="bg-[var(--danger)]"
        />
        <StatCard
          title="Kechikkanlar"
          value={stats?.late ?? 0}
          icon={Clock}
          tone="bg-[var(--warning)]"
        />
        <StatCard
          title="Ishda turganlar"
          value={stats?.atWork ?? 0}
          icon={Briefcase}
          tone="bg-[var(--info)]"
        />
        <StatCard
          title="Foiz"
          value={`${stats?.percentage ?? 0}%`}
          icon={TrendingUp}
          tone="bg-[var(--accent)]"
        />
      </div>

      <Card>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Haftalik davomat</h3>
            <p className="text-sm text-[var(--ink-muted)]">
              Kelgan va kechikkan xodimlar dinamikasi
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
              axisLine={{ stroke: "var(--line)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow)",
              }}
            />
            <Bar dataKey="kelgan" fill="var(--success)" name="Kelgan" radius={[6, 6, 0, 0]} />
            <Bar dataKey="kechikkan" fill="var(--warning)" name="Kechikkan" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
