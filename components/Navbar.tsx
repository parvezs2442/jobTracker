"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
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

        <nav className="flex items-center gap-3 sm:gap-8">
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
            href="/profile"
            className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
          >
            Profile
          </Link>

          <div className="flex items-center shrink-0">
            {/* The LogoutButton has custom styling, scaling it slightly on mobile header */}
            <div className="scale-90 sm:scale-100 origin-right">
              <LogoutButton />
            </div>
          </div>
        </nav>

      </div>
    </header>
  );
}