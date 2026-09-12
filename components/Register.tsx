"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function RegisterForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser(name, email, password);

      toast.success(res.message || "Account created successfully!");
      await refreshUser();
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2 bg-[#0B0D12]">
      {/* Left side: Branding & Hero Marketing (Desktop only) */}
      <div className="relative hidden flex-col justify-between bg-[#0E121B] p-12 text-white lg:flex border-r border-white/[0.06] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-white">JobTracker</span>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-xs mb-6">
            <Sparkles className="h-3 w-3" />
            <span>Create a Free Account</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white">
            Accelerate your search with better metrics.
          </h2>
          <p className="mt-3.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Stop losing track of positions. Monitor every status, record interviews, store notes, and log offers in one seamless workspace.
          </p>

          <ul className="mt-8 space-y-3.5">
            <li className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Pipeline analytics & dashboard insights</span>
            </li>
            <li className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Interactive drag-and-drop Kanban workflow</span>
            </li>
            <li className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Encrypted JWT security and route protection</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-500">
          © 2026 JobTracker. Designed for modern tech professionals.
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-[#0B0D12]">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#12151E] p-6 sm:p-8 shadow-2xl shadow-black/40">
          
          <div className="mb-7 text-center sm:text-left">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 lg:hidden mb-3">
              <Compass className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Create an account
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Get started tracking your applications today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                required
              />
            </div>

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs sm:text-sm font-medium text-white shadow-xs transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{loading ? "Creating..." : "Register"}</span>
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-zinc-400">
            Already have an account?
            <Link
              href="/login"
              className="ml-1.5 font-medium text-blue-400 hover:text-blue-300 transition"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}