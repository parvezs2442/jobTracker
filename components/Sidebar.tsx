"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Kanban,
  User, 
  Menu, 
  X, 
  Plus,
  Compass
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: Briefcase,
    },
    {
      name: "Kanban Board",
      href: "/kanban",
      icon: Kanban,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/jobs") {
      return pathname.startsWith("/jobs");
    }
    if (path === "/kanban") {
      return pathname.startsWith("/kanban");
    }
    return pathname === path;
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* Mobile Toggle Header */}
      <div className="flex h-16 items-center justify-between border-b bg-white px-6 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-xl tracking-tight">
          <Compass className="h-6 w-6" />
          <span>JobTracker</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-all-300 md:sticky md:top-0 md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-600 text-2xl tracking-tight">
            <Compass className="h-7 w-7" />
            <span>JobTracker</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="px-4 py-4">
          <Link
            href="/jobs/new"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all-300 ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-blue-700" : "text-zinc-400 group-hover:text-zinc-900"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Actions */}
        <div className="border-t p-4 flex flex-col gap-3">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-zinc-50 transition"
          >
            {loading ? (
              <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="h-9 w-9 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-zinc-200 rounded w-24" />
                  <div className="h-2.5 bg-zinc-200 rounded w-32" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-semibold text-white text-sm shadow-sm">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{user?.name || "My Account"}</p>
                  <p className="truncate text-xs text-zinc-500">{user?.email || "Signed in"}</p>
                </div>
              </>
            )}
          </Link>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

