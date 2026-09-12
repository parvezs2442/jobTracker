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
      <div className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0D1017] px-5 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-base tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Compass className="h-4 w-4" />
          </div>
          <span>JobTracker</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-[#0D1017] transition-all duration-200 md:sticky md:top-0 md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-xs">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">JobTracker</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="px-3 py-3.5">
          <Link
            href="/jobs/new"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-500 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Application</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-0.5 px-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-white/[0.07] text-white shadow-xs"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Actions */}
        <div className="border-t border-white/[0.06] p-3 flex flex-col gap-2.5 bg-[#0A0D14]/60">
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition group"
          >
            {loading ? (
              <div className="flex items-center gap-2.5 w-full animate-pulse">
                <div className="h-8 w-8 rounded-full bg-white/[0.08]" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-white/[0.08] rounded w-20" />
                  <div className="h-2 bg-white/[0.08] rounded w-28" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs border border-white/10 shadow-xs">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">{user?.name || "My Account"}</p>
                  <p className="truncate text-[11px] text-zinc-500">{user?.email || "Signed in"}</p>
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
