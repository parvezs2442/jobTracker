import Link from "next/link";
import prisma from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import { Plus, FolderOpen, LayoutList, Kanban } from "lucide-react";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function JobsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded;
  try {
    decoded = verifyJwt(token);
  } catch {
    redirect("/login");
  }

  // Fetch only the logged in user's jobs (matching the exact userId filter from the dashboard query)
  const jobs = await prisma.job.findMany({
    where: {
      userId: decoded.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Applications
            </h1>
            <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {jobs.length} total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            View, search, and coordinate your tracked job opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#12151E] p-1 shadow-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
              <LayoutList className="h-3.5 w-3.5 text-blue-400" />
              <span>List</span>
            </div>
            <Link
              href="/kanban"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </Link>
          </div>

          <Link
            href="/jobs/new"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Main Grid or Empty State */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#12151E] p-16 text-center shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500 border border-white/[0.06]">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">No applications found</h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Simplify your career search by tracking application statuses, locations, and salaries in one unified workspace.
          </p>
          <Link
            href="/jobs/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Track Your First Job</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}