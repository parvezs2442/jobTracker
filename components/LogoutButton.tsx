"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Logged out successfully");
        router.push("/login");
        router.refresh();
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong during logout.");
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