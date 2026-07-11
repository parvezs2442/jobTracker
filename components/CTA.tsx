import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-20 text-center text-white shadow-xl sm:px-12">
        
        {/* Abstract decorative elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_40rem_at_top,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to Land Your Dream Job?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100 leading-relaxed">
          Join thousands of applicants who have streamlined their job hunt, organized their pipelines, and accelerated their hiring journey.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:bg-zinc-50 hover:shadow"
          >
            <span>Start Tracking Now</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}