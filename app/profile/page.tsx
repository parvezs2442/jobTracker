import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { User, Mail, Calendar, Briefcase, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface JwtPayload {
  userId: string;
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalApplications = await prisma.job.count({
    where: {
      userId: user.id,
    },
  });

  const memberSince = user.createdAt
    ? format(new Date(user.createdAt), "MMMM d, yyyy")
    : "Recently";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Account Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Manage your account profile details and authentication state.
        </p>
      </div>

      {/* Profile Card Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* User Large Avatar Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-white/[0.06] text-center sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-bold text-white shadow-md shadow-blue-500/15 border border-white/10">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {user.name}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-400">
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Account</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {/* Full Name block */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3.5 items-start">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-2 text-zinc-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Full Name
              </p>
              <h3 className="mt-1 text-sm font-medium text-zinc-200">
                {user.name}
              </h3>
            </div>
          </div>

          {/* Email block */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3.5 items-start">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-2 text-zinc-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Email Address
              </p>
              <h3 className="mt-1 text-sm font-medium text-zinc-200 truncate">
                {user.email}
              </h3>
            </div>
          </div>

          {/* Member Since block */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3.5 items-start">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-2 text-zinc-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Member Since
              </p>
              <h3 className="mt-1 text-sm font-medium text-zinc-200">
                {memberSince}
              </h3>
            </div>
          </div>

          {/* Applications Logged block */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3.5 items-start">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-2 text-zinc-400">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Applications Tracked
              </p>
              <h3 className="mt-1 text-sm font-medium text-zinc-200">
                {totalApplications} {totalApplications === 1 ? "Job" : "Jobs"}
              </h3>
            </div>
          </div>
        </div>

        {/* Security / Isolation note */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex gap-3 text-xs text-blue-300">
          <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-blue-200">User Data Protection:</span> Your job records and application statistics are isolated to your account and protected by JWT authentication.
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end">
          <div className="w-full sm:w-auto">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}