"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import Link from "next/link";
import { Compass, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);
      toast.success(res.message || "Logged in successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2 bg-white">
      {/* Left side: Branding & Hero Marketing (Desktop only) */}
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-12 text-white lg:flex auth-gradient">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight">
          <Compass className="h-6 w-6 text-blue-400 animate-pulse" />
          <span>JobTracker</span>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" />
            <span>Smart Pipeline Tracking</span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Take command of your career search.
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Stop losing track of positions. Monitor every status, record interviews, store notes, and log offers in one dashboard.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Pipeline analytics & dashboard insights</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Full job logging and custom application notes</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Encrypted JWT security and route protection</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © 2026 JobTracker. Designed for modern job seekers.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-zinc-50/50">
        <div className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm">
          
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 lg:hidden mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
                required
              />
            </div>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Logging in..." : "Login"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?
            <Link
              href="/register"
              className="ml-1.5 font-semibold text-blue-600 hover:text-blue-700"
            >
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}