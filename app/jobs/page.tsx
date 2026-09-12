import Link from "next/link";
import prisma from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import { Plus, FolderOpen, Briefcase } from "lucide-react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

interface JwtPayload {
  userId: string;
}

export default async function JobsPage() {
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              My Applications
            </h1>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
              {jobs.length} total
            </span>
          </div>
          <p className="mt-1.5 text-zinc-500">
            View, search, and coordinate your tracked job opportunities.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Job</span>
        </Link>
      </div>

      {/* Main Grid or Empty State */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 border border-zinc-100">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900">No applications found</h2>
          <p className="mt-2 text-sm text-zinc-500 max-w-md">
            Simplify your job hunt by tracking your status, location, salary, interviews, and notes in one place.
          </p>
          <Link
            href="/jobs/new"
            className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Track Your First Job</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}