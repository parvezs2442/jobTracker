import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#141824] to-[#0E121B] px-6 py-16 text-center text-white shadow-2xl sm:px-12">
        
        {/* Abstract decorative elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(35rem_35rem_at_top,rgba(59,130,246,0.12),transparent)] pointer-events-none" />

        <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ready to Land Your Dream Job?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Join modern professionals streamlining their pipelines, organizing stages, and accelerating their hiring journey.
        </p>

        <div className="mt-7 flex justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <span>Start Tracking Now</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}