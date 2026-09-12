import AddJobForm from "@/components/AddJobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

interface JwtPayload {
  userId: string;
}

export default async function AddJobPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Link */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Add New Application
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Log details for a job you have applied to or are interviewing for.
        </p>
      </div>

      <AddJobForm />
    </div>
  );
}