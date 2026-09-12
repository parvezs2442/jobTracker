"use client";

import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-base sm:text-xl font-bold text-zinc-900 tracking-tight transition hover:opacity-90"
        >
          <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <span className="truncate">JobTracker</span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          {loading ? (
            <div className="h-8 w-24 rounded-lg bg-zinc-100 animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
              >
                Dashboard
              </Link>

              <Link
                href="/jobs"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
              >
                Jobs
              </Link>

              <Link
                href="/kanban"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
              >
                Kanban
              </Link>

              <Link
                href="/profile"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
              >
                Profile
              </Link>

              <div className="flex items-center shrink-0">
                <div className="scale-90 sm:scale-100 origin-right">
                  <LogoutButton />
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 transition px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}