import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { 
  Briefcase, 
  Send, 
  CalendarDays, 
  Trophy, 
  Plus, 
  TrendingUp, 
  Building2, 
  User,
  ArrowUpRight
} from "lucide-react";

interface JwtPayload {
  userId: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8 bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">Access Denied</h2>
        <p className="mt-2 text-zinc-500 max-w-sm">Please log in to your account to view your application dashboard.</p>
        <Link
          href="/login"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          Login Page
        </Link>
      </div>
    );
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8 bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900">Session Expired</h2>
        <p className="mt-2 text-zinc-500 max-w-sm">Your login session has expired or is invalid. Please log in again.</p>
        <Link
          href="/login"
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

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

  // Helper to resolve status badge styling
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPLIED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "INTERVIEW":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "OFFER":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "HIRED":
        return "bg-teal-50 text-teal-700 border-teal-100";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-100";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Welcome back, {user?.name || "Job Hunter"} 👋
          </h1>
          <p className="mt-1.5 text-zinc-500">
            Here's a snapshot of your career search and active pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            All Applications
          </Link>
          <Link
            href="/jobs/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          color="text-blue-600"
          bg="bg-blue-50/50"
          border="border-blue-100"
        />
        <StatCard
          title="Applied"
          value={applied}
          icon={Send}
          color="text-indigo-600"
          bg="bg-indigo-50/50"
          border="border-indigo-100"
        />
        <StatCard
          title="Interviews"
          value={interview}
          icon={CalendarDays}
          color="text-amber-600"
          bg="bg-amber-50/50"
          border="border-amber-100"
        />
        <StatCard
          title="Offers"
          value={offer}
          icon={Trophy}
          color="text-emerald-600"
          bg="bg-emerald-50/50"
          border="border-emerald-100"
        />
      </div>

      {/* Main Grid: Recent Applications & Progress Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-950">Recent Applications</h2>
              <p className="text-sm text-zinc-500">Your most recently logged positions.</p>
            </div>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              <span>View all</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl border-zinc-200">
                <Building2 className="h-10 w-10 text-zinc-300" />
                <h3 className="mt-4 text-sm font-bold text-zinc-800">No applications yet</h3>
                <p className="mt-1 text-xs text-zinc-400 max-w-[240px]">Once you add some jobs, they will appear here.</p>
                <Link
                  href="/jobs/new"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Job</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="pb-3 text-left">Company</th>
                    <th className="pb-3 text-left">Position</th>
                    <th className="pb-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="group transition-all hover:bg-zinc-50/50"
                    >
                      <td className="py-3.5 font-medium text-zinc-900 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                            {job.company.charAt(0)}
                          </div>
                          <span className="truncate">{job.company}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-500 pr-4 truncate">{job.position}</td>
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(job.status)}`}>
                          {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Progress Summary Card */}
        <div className="flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Status Summary</span>
            </h2>
            <p className="text-sm text-zinc-500">Distribution of application states.</p>
          </div>

          <div className="space-y-5 flex-1">
            <Progress
              label="Applied"
              value={applied}
              max={totalJobs}
              color="bg-blue-600"
              bg="bg-blue-100"
            />
            <Progress
              label="Interview"
              value={interview}
              max={totalJobs}
              color="bg-amber-500"
              bg="bg-amber-100"
            />
            <Progress
              label="Offer"
              value={offer}
              max={totalJobs}
              color="bg-emerald-500"
              bg="bg-emerald-100"
            />
            <Progress
              label="Rejected"
              value={rejected}
              max={totalJobs}
              color="bg-rose-500"
              bg="bg-rose-100"
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
    <div className={`rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-500">{title}</span>
        <div className={`rounded-xl border p-2 ${bg} ${border}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-zinc-900 tracking-tight">
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
  // Safe percentage calculation to avoid Division by Zero
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-semibold text-zinc-700">{label}</span>
        <span className="font-bold text-zinc-900">{value}</span>
      </div>
      <div className={`h-2.5 w-full rounded-full ${bg}`}>
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}