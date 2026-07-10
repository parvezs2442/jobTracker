import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-blue-600 py-20 text-center text-white">

      <h2 className="text-4xl font-bold">
        Ready to Land Your Dream Job?
      </h2>

      <p className="mt-4">
        Start managing your applications today.
      </p>

      <Link
        href="/register"
        className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-blue-600 font-semibold"
      >
        Start Tracking
      </Link>

    </section>
  );
}