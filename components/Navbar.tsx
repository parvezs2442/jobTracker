"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
        >
          JobTracker
        </Link>

        <div className="flex items-center gap-8">

          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/jobs"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Jobs
          </Link>

          <Link
            href="/profile"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Profile
          </Link>

          <LogoutButton/>

        </div>

      </div>
    </nav>
  );
}