"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Briefcase,
  Send,
  CalendarDays,
  Trophy,
  XCircle,
  Award,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Building2,
  FileText,
  RefreshCw,
  Loader2,
  Kanban as KanbanIcon,
  Percent,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface StatusCounts {
  applied: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

interface StatusDistributionItem {
  status: string;
  count: number;
  key: string;
  color: string;
}

interface FunnelData {
  total: number;
  interview: number;
  offer: number;
  hired: number;
  interviewRate: number;
  offerRate: number;
  hireRate: number;
}

interface TimeSeriesItem {
  month: string;
  monthShort: string;
  applications: number;
}

interface RecentJob {
  id: string;
  company: string;
  position: string;
  status: string;
  location?: string | null;
  salary?: string | null;
  workMode?: string | null;
  appliedAt?: string | Date;
  createdAt: string | Date;
  resumeType?: string | null;
  resumeFilename?: string | null;
}

interface AnalyticsData {
  totalApplications: number;
  statusCounts: StatusCounts;
  statusDistribution: StatusDistributionItem[];
  funnel: FunnelData;
  applicationsOverTime: TimeSeriesItem[];
  recentApplications: RecentJob[];
}

interface DashboardAnalyticsProps {
  initialUserName?: string;
}

export default function DashboardAnalytics({ initialUserName }: DashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await fetch("/api/dashboard/analytics", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.analytics) {
          setData(json.analytics);
        }
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPLIED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "INTERVIEW":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HIRED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/[0.04] text-zinc-400 border-white/[0.06]";
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        <p className="text-xs font-semibold tracking-wide text-zinc-400">
          Loading live analytics...
        </p>
      </div>
    );
  }

  const hasData = (data?.totalApplications ?? 0) > 0;

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome back{initialUserName ? `, ${initialUserName}` : ""}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Real-time analytics and funnel tracking calculated from your database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#12151E] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] hover:text-white transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-400 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/kanban"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#12151E] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] hover:text-white transition shadow-xs"
          >
            <KanbanIcon className="h-3.5 w-3.5 text-blue-400" />
            <span>Kanban Board</span>
          </Link>

          <Link
            href="/jobs"
            className="rounded-xl border border-white/[0.08] bg-[#12151E] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] hover:text-white transition shadow-xs"
          >
            Applications
          </Link>

          <Link
            href="/jobs/new"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* 1. Real-Data KPI Overview */}
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="Total Jobs"
          value={data?.totalApplications ?? 0}
          icon={Briefcase}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <KpiCard
          title="Applied"
          value={data?.statusCounts.applied ?? 0}
          icon={Send}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <KpiCard
          title="Interviews"
          value={data?.statusCounts.interview ?? 0}
          icon={CalendarDays}
          color="text-indigo-400"
          bg="bg-indigo-500/10"
          border="border-indigo-500/20"
        />
        <KpiCard
          title="Offers"
          value={data?.statusCounts.offer ?? 0}
          icon={Trophy}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
        />
        <KpiCard
          title="Hired"
          value={data?.statusCounts.hired ?? 0}
          icon={Award}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
          border="border-cyan-500/20"
        />
        <KpiCard
          title="Rejected"
          value={data?.statusCounts.rejected ?? 0}
          icon={XCircle}
          color="text-rose-400"
          bg="bg-rose-500/10"
          border="border-rose-500/20"
        />
      </div>

      {/* 2. Pipeline Funnel & Conversion Rates */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-6 shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>Application Pipeline & Conversion Rates</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live progression metrics across your interview and offer funnel.
            </p>
          </div>
          {hasData && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-zinc-300">
                <Percent className="h-3.5 w-3.5 text-blue-400" />
                <span>Interview Rate: <strong className="text-white">{data?.funnel.interviewRate}%</strong></span>
              </div>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1 text-zinc-300">
                <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                <span>Offer Rate: <strong className="text-white">{data?.funnel.offerRate}%</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Funnel Progress Bars */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <FunnelMetricBox
            title="Total Applications"
            count={data?.funnel.total ?? 0}
            percentage="100%"
            color="bg-blue-500"
            subtext="All tracked positions"
          />
          <FunnelMetricBox
            title="Reached Interview"
            count={data?.funnel.interview ?? 0}
            percentage={`${data?.funnel.interviewRate ?? 0}%`}
            color="bg-indigo-500"
            subtext={`${data?.funnel.interviewRate ?? 0}% interview rate`}
          />
          <FunnelMetricBox
            title="Received Offer / Hired"
            count={data?.funnel.offer ?? 0}
            percentage={`${data?.funnel.offerRate ?? 0}%`}
            color="bg-emerald-500"
            subtext={`${data?.funnel.offerRate ?? 0}% offer conversion`}
          />
        </div>
      </div>

      {/* 3. Charts Section: Over Time & Status Distribution */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Applications Over Time (Time Series Chart) */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              <span>Applications Over Time</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Monthly activity graph tracking your job-search momentum.
            </p>
          </div>

          <div className="h-[220px] w-full pt-2">
            {mounted && hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.applicationsOverTime}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="monthShort"
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141824",
                      borderColor: "rgba(255,255,255,0.12)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#FFFFFF",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                    labelStyle={{ color: "#A1A1AA", marginBottom: "4px" }}
                    formatter={(value: any) => [`${value} applications`, "Submitted"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center border border-dashed rounded-xl border-white/[0.06] p-4">
                <CalendarDays className="h-6 w-6 text-zinc-600 mb-1.5" />
                <p className="text-xs font-medium text-zinc-400">No timeline data available</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Applications will appear across this monthly timeline as you add them.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span>Status Distribution</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live count across active pipeline stages.
            </p>
          </div>

          <div className="h-[220px] w-full pt-1">
            {mounted && hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.statusDistribution}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="status"
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141824",
                      borderColor: "rgba(255,255,255,0.12)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#FFFFFF",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} jobs`,
                      item.payload.status,
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data?.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center border border-dashed rounded-xl border-white/[0.06] p-4">
                <Briefcase className="h-6 w-6 text-zinc-600 mb-1.5" />
                <p className="text-xs font-medium text-zinc-400">No status metrics yet</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Stages will populate as applications are added.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Applications (with Resume Badges) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
            <p className="text-xs text-zinc-400">
              Your most recently tracked positions with attached resume history.
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
          >
            <span>View all</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {!hasData || data?.recentApplications.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl border-white/[0.06]">
              <Building2 className="h-8 w-8 text-zinc-600 mb-2" />
              <h3 className="text-xs font-semibold text-zinc-300">No applications yet</h3>
              <p className="mt-0.5 text-[11px] text-zinc-500 max-w-[240px]">
                Once you add your first job application, it will appear here.
              </p>
              <Link
                href="/jobs/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Job</span>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <th className="pb-2.5 text-left">Company</th>
                  <th className="pb-2.5 text-left">Position</th>
                  <th className="pb-2.5 text-left">Status</th>
                  <th className="pb-2.5 text-left">Resume Attached</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.recentApplications.map((job) => (
                  <tr
                    key={job.id}
                    className="group transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="py-3 font-medium text-zinc-200 pr-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center gap-2.5 hover:text-blue-400 transition"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] text-xs font-bold text-zinc-300 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{job.company}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-zinc-400 pr-4 truncate">
                      <Link href={`/jobs/${job.id}`} className="hover:text-zinc-200 transition">
                        {job.position}
                      </Link>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusBadge(job.status)}`}>
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      {job.resumeType ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                          <FileText className="h-3 w-3 text-blue-400" />
                          <span className="truncate max-w-[130px]">
                            {job.resumeType === "PDF" ? (job.resumeFilename || "Resume PDF") : "Resume Link"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  border,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#12151E] p-4 shadow-xs transition hover:border-white/[0.14] hover:bg-[#141824]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400">{title}</span>
        <div className={`rounded-lg border p-1 ${bg} ${border}`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
      </div>
      <p className="mt-2.5 text-xl sm:text-2xl font-bold text-white tracking-tight">
        {value}
      </p>
    </div>
  );
}

function FunnelMetricBox({
  title,
  count,
  percentage,
  color,
  subtext,
}: {
  title: string;
  count: number;
  percentage: string;
  color: string;
  subtext: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden my-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: percentage.endsWith("%") ? percentage : "0%" }}
        />
      </div>
      <p className="text-[10px] text-zinc-500">{subtext}</p>
    </div>
  );
}
