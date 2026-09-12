"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ArrowRight } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useAuth();

  const isNavLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0B0D12]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm sm:text-base font-bold text-white tracking-tight transition hover:opacity-90"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400">
            <Compass className="h-4 w-4" />
          </div>
          <span>JobTracker</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          {loading ? (
            <div className="h-7 w-20 rounded-md bg-white/[0.06] animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                  isNavLinkActive("/dashboard")
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/jobs"
                className={`text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                  isNavLinkActive("/jobs")
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Jobs
              </Link>

              <Link
                href="/kanban"
                className={`text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                  isNavLinkActive("/kanban")
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Kanban
              </Link>

              <Link
                href="/profile"
                className={`text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                  isNavLinkActive("/profile")
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Profile
              </Link>

              <div className="hidden sm:flex items-center shrink-0 pl-2 border-l border-white/[0.06]">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}