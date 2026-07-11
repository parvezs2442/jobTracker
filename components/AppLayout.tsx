"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Auth pages have no default header/footer/sidebar
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Dashboard pages have sidebar on the left and content on the right
  const isDashboardPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/profile");

  if (isAuthPage) {
    return <div className="min-h-screen bg-zinc-50">{children}</div>;
  }

  if (isDashboardPage) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
      </div>
    );
  }

  // Public Landing Page (Homepage)
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
