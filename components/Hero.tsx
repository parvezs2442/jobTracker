import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B0D12] py-24 sm:py-32 px-6">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        
        {/* Subtle Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-400 backdrop-blur-xs">
          <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Interactive Kanban & Pipeline Tracker</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Track Every
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent"> Job Application</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
          Organize your applications, interviews, offers, and rejections with an intuitive Linear-grade Kanban board and real-time dashboard analytics.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </section>
  );
}