import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden hero-gradient py-24 sm:py-32 px-6">
      <div className="mx-auto max-w-5xl text-center">
        
        {/* Subtle Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Now in Public Beta</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
          Track Every
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Job Application</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-500 leading-relaxed">
          Organize your job applications, interviews, offers, and rejections in one beautiful, unified dashboard. Stop using spreadsheets and start landing your dream job.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/dashboard"
            className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-200 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-950"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </section>
  );
}