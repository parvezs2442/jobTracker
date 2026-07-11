import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-zinc-50">
        <AppLayout>{children}</AppLayout>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}