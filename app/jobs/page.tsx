import Link from "next/link";
import prisma from "@/lib/prisma";
import JobCard from "@/components/JobCard";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl p-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Jobs</h1>

        <Link
          href="/jobs/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="text-2xl font-semibold">No Jobs Found</h2>
          <p className="mt-2 text-gray-500">
            Start tracking your applications by adding your first job.
          </p>

          <Link
            href="/jobs/new"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Add First Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}