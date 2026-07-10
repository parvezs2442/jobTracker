import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";

interface JwtPayload {
  userId: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div>Please Login</div>;
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JwtPayload;

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

  return (
    <main className="mx-auto max-w-7xl p-10">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Welcome Back, {user?.name} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Keep track of your job search.
          </p>

        </div>

        <Link
          href="/jobs/new"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white"
        >
          + Add Job
        </Link>

      </div>

      {/* Stats */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Jobs"
          value={totalJobs}
        />

        <StatCard
          title="Applied"
          value={applied}
        />

        <StatCard
          title="Interview"
          value={interview}
        />

        <StatCard
          title="Offers"
          value={offer}
        />

      </div>

      {/* Recent Jobs */}

      <div className="mt-12 rounded-xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-bold">
          Recent Applications
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="py-3 text-left">
                Company
              </th>

              <th className="text-left">
                Position
              </th>

              <th className="text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {jobs.map((job) => (

              <tr
                key={job.id}
                className="border-b"
              >

                <td className="py-4">
                  {job.company}
                </td>

                <td>
                  {job.position}
                </td>

                <td>
                  {job.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Extra */}

      <div className="mt-10 rounded-xl bg-white p-6 shadow">

        <h2 className="mb-5 text-2xl font-bold">
          Status Summary
        </h2>

        <div className="space-y-4">

          <Progress
            label="Applied"
            value={applied}
          />

          <Progress
            label="Interview"
            value={interview}
          />

          <Progress
            label="Offer"
            value={offer}
          />

          <Progress
            label="Rejected"
            value={rejected}
          />

        </div>

      </div>

    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="mt-3 text-4xl font-bold">
        {value}
      </h2>

    </div>
  );
}

function Progress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>

      <div className="mb-2 flex justify-between">

        <span>{label}</span>

        <span>{value}</span>

      </div>

      <div className="h-3 rounded bg-gray-200">

        <div
          className="h-3 rounded bg-blue-600"
          style={{
            width: `${value * 10}%`,
          }}
        />

      </div>

    </div>
  );
}