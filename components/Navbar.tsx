"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-zinc-900 tracking-tight transition hover:opacity-90"
        >
          <Compass className="h-6 w-6 text-blue-600 animate-pulse" />
          <span>JobTracker</span>
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
          >
            Dashboard
          </Link>

          <Link
            href="/jobs"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
          >
            Jobs
          </Link>

          <Link
            href="/profile"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-all-300"
          >
            Profile
          </Link>

          <div className="flex items-center">
            <LogoutButton />
          </div>
        </nav>

      </div>
    </header>
  );
}