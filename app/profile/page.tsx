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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account profile details and authentication state.
        </p>
      </div>

      {/* Profile Card Container */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 md:p-8 shadow-sm space-y-8">
        
        {/* User Large Avatar Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100 text-center sm:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-md shadow-blue-500/10">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-zinc-950">
              {user.name}
            </h2>
            <p className="text-sm font-medium text-zinc-500">
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Account</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Full Name block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Full Name
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900">
                {user.name}
              </h3>
            </div>
          </div>

          {/* Email block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Email Address
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900 truncate">
                {user.email}
              </h3>
            </div>
          </div>

          {/* Member Since block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Member Since
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900">
                {memberSince}
              </h3>
            </div>
          </div>

          {/* Applications Logged block */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 flex gap-4 items-start">
            <div className="rounded-lg bg-white border border-zinc-100 p-2 text-zinc-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Applications Tracked
              </p>
              <h3 className="mt-1.5 text-base font-semibold text-zinc-900">
                {totalApplications} {totalApplications === 1 ? "Job" : "Jobs"}
              </h3>
            </div>
          </div>
        </div>

        {/* Security / Isolation note */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 flex gap-3 text-sm text-blue-900">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">User Data Protection:</span> Your job records and application statistics are isolated to your account and protected by JWT authentication.
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-6 border-t border-zinc-100 flex items-center justify-end">
          <div className="w-full sm:w-auto">
            <LogoutButton />
          </div>
        </div>

      </div>
    </div>
  );
}