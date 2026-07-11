import AddJobForm from "@/components/AddJobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddJobPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Link */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Add New Application
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Log details for a job you have applied to or are interviewing for.
        </p>
      </div>

      <AddJobForm />
    </div>
  );
}