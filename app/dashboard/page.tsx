import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Jobs",
      value: 24,
      color: "text-blue-600",
    },
    {
      title: "Applied",
      value: 15,
      color: "text-yellow-500",
    },
    {
      title: "Interview",
      value: 5,
      color: "text-purple-600",
    },
    {
      title: "Offers",
      value: 2,
      color: "text-green-600",
    },
  ];

  const recentJobs = [
    {
      company: "Google",
      position: "Frontend Developer",
      status: "Applied",
      date: "Today",
    },
    {
      company: "Amazon",
      position: "Backend Developer",
      status: "Interview",
      date: "Yesterday",
    },
    {
      company: "Microsoft",
      position: "Software Engineer",
      status: "Rejected",
      date: "2 Days Ago",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome back 👋 Manage your job applications here.
          </p>
        </div>

        <Link
          href="/jobs"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          + Add Job
        </Link>

      </div>

      {/* Stats */}

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-white p-6 shadow"
          >
            <p className="text-gray-500">
              {item.title}
            </p>

            <h2
              className={`mt-3 text-4xl font-bold ${item.color}`}
            >
              {item.value}
            </h2>
          </div>
        ))}

      </section>

      {/* Recent Jobs */}

      <section className="mt-12 rounded-xl bg-white p-6 shadow">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Recent Applications
          </h2>

          <Link
            href="/jobs"
            className="text-blue-600"
          >
            View All
          </Link>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-left">

                <th className="py-3">Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              {recentJobs.map((job, index) => (

                <tr
                  key={index}
                  className="border-b"
                >

                  <td className="py-4">
                    {job.company}
                  </td>

                  <td>{job.position}</td>

                  <td>

                    <span className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      {job.status}
                    </span>

                  </td>

                  <td>{job.date}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

      {/* Quick Actions */}

      <section className="mt-12">

        <h2 className="mb-5 text-2xl font-bold">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-5">

          <Link
            href="/jobs"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            View Jobs
          </Link>

          <Link
            href="/jobs"
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            Add Job
          </Link>

          <Link
            href="/profile"
            className="rounded-lg bg-gray-800 px-6 py-3 text-white hover:bg-black"
          >
            Profile
          </Link>

        </div>

      </section>

    </main>
  );
}