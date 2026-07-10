import Link from "next/link";

export default function JobCard({
  job,
}: {
  job: any;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="text-2xl font-bold">
        {job.company}
      </h2>

      <p className="mt-2 text-gray-600">
        {job.position}
      </p>

      <p className="mt-2">
        📍 {job.location}
      </p>

      <p className="mt-2">
        💰 {job.salary}
      </p>

      <span className="mt-4 inline-block rounded bg-blue-100 px-3 py-1 text-blue-700">
        {job.status}
      </span>

      <div className="mt-6 flex gap-3">

        <Link
          href={`/jobs/${job.id}`}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Edit
        </Link>

        <button className="rounded bg-red-600 px-4 py-2 text-white">
          Delete
        </button>

      </div>

    </div>
  );
}