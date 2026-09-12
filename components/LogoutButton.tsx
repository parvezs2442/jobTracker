"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/50 bg-rose-50/50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100/70 disabled:opacity-50 cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      <span>{loading ? "Logging Out..." : "Logout"}</span>
    </button>
  );
}