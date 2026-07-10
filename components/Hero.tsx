import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center py-28 text-center">

      <h1 className="text-6xl font-bold leading-tight">
        Track Every
        <span className="text-blue-600"> Job Application</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        Organize your job applications, interviews,
        offers and rejections in one place.
      </p>

      <div className="mt-10 flex gap-5">

        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
        >
          Get Started
        </Link>

        <Link
          href="/jobs"
          className="rounded-lg border px-8 py-3 hover:bg-gray-100"
        >
          View Jobs
        </Link>

      </div>

    </section>
  );
}