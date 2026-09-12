import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Briefcase, 
  Send, 
  CalendarDays, 
  Trophy, 
  Plus, 
  TrendingUp, 
  Building2, 
  ArrowUpRight,
  Kanban as KanbanIcon
} from "lucide-react";

interface JwtPayload {
  userId: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const jobs = await prisma.job.findMany({
    where: {
      userId: decoded.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const totalJobs = await prisma.job.count({
    where: {
      userId: decoded.userId,
    },
  });

  const applied = await prisma.job.count({
    where: {
      userId: decoded.userId,
      status: "APPLIED",
    },
  });

  const interview = await prisma.job.count({
    where: {
      userId: decoded.userId,
      status: "INTERVIEW",
    },
  });

  const offer = await prisma.job.count({
    where: {
      userId: decoded.userId,
      status: "OFFER",
    },
  });

  const rejected = await prisma.job.count({
    where: {
      userId: decoded.userId,
      status: "REJECTED",
    },
  });

  const hired = await prisma.job.count({
    where: {
      userId: decoded.userId,
      status: "HIRED",
    },
  });

  // Helper to resolve status badge styling in dark SaaS theme
  const getStatusStyle = (status: string) => {
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.name || "Job Hunter"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Here is your live application pipeline and career metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
            All Applications
          </Link>

          <Link
            href="/jobs/new"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Application</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <StatCard
          title="Applied"
          value={applied}
          icon={Send}
          color="text-indigo-400"
          bg="bg-indigo-500/10"
          border="border-indigo-500/20"
        />
        <StatCard
          title="Interviews"
          value={interview}
          icon={CalendarDays}
          color="text-amber-400"
          bg="bg-amber-500/10"
          border="border-amber-500/20"
        />
        <StatCard
          title="Offers"
          value={offer}
          icon={Trophy}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
        />
      </div>

      {/* Main Grid: Recent Applications & Status Overview */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-white/[0.06] bg-[#12151E] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Recent Applications</h2>
              <p className="text-xs text-zinc-500">Your most recently tracked positions.</p>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl border-white/[0.06]">
                <Building2 className="h-8 w-8 text-zinc-600 mb-2" />
                <h3 className="text-xs font-bold text-zinc-300">No applications yet</h3>
                <p className="mt-0.5 text-[11px] text-zinc-500 max-w-[240px]">Once you add some jobs, they will appear here.</p>
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
                  <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="pb-2.5 text-left">Company</th>
                    <th className="pb-2.5 text-left">Position</th>
                    <th className="pb-2.5 text-left">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {jobs.map((job) => (
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
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusStyle(job.status)}`}>
                          {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline"
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

        {/* Progress Summary Card */}
        <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-[#12151E] p-5 sm:p-6 shadow-xs">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>Status Distribution</span>
            </h2>
            <p className="text-xs text-zinc-500">Breakdown of applications across stages.</p>
          </div>

          <div className="space-y-4 flex-1">
            <Progress
              label="Applied"
              value={applied}
              max={totalJobs}
              color="bg-blue-500"
              bg="bg-blue-500/15"
            />
            <Progress
              label="Interview"
              value={interview}
              max={totalJobs}
              color="bg-indigo-500"
              bg="bg-indigo-500/15"
            />
            <Progress
              label="Offer"
              value={offer}
              max={totalJobs}
              color="bg-emerald-500"
              bg="bg-emerald-500/15"
            />
            <Progress
              label="Hired"
              value={hired}
              max={totalJobs}
              color="bg-cyan-500"
              bg="bg-cyan-500/15"
            />
            <Progress
              label="Rejected"
              value={rejected}
              max={totalJobs}
              color="bg-rose-500"
              bg="bg-rose-500/15"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  border,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12151E] p-4 sm:p-5 shadow-xs transition hover:border-white/[0.12] hover:bg-[#141824]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        <div className={`rounded-lg border p-1.5 ${bg} ${border}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
      </p>
    </div>
  );
}

interface ProgressProps {
  label: string;
  value: number;
  max: number;
  color: string;
  bg: string;
}

function Progress({
  label,
  value,
  max,
  color,
  bg,
}: ProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className={`h-1.5 w-full rounded-full ${bg}`}>
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}