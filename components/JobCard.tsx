"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Briefcase 
} from "lucide-react";
import { deleteJob } from "@/lib/jobs";
import { toast } from "sonner";

interface JobCardProps {
  job: {
    id: string;
    company: string;
    position: string;
    location?: string | null;
    salary?: string | null;
    status: string;
    jobType: string;
    workMode?: string | null;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPLIED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "INTERVIEW":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "OFFER":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "HIRED":
        return "bg-teal-50 text-teal-700 border-teal-100";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-100";
    }
  };

  const getWorkModeLabel = (mode?: string | null) => {
    if (!mode) return "";
    return mode.charAt(0) + mode.slice(1).toLowerCase();
  };

  async function handleDelete() {
    const confirmed = window.confirm(`Are you sure you want to delete the job application for ${job.company}?`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await deleteJob(job.id);
      
      if (res.success) {
        toast.success("Application deleted successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete application.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="hover-card-effect flex flex-col justify-between rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 text-base font-extrabold text-zinc-600">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-zinc-950" title={job.company}>
                {job.company}
              </h2>
              <p className="truncate text-sm text-zinc-500 font-medium" title={job.position}>
                {job.position}
              </p>
            </div>
          </div>

          <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(job.status)}`}>
            {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Info Rows */}
        <div className="space-y-2 pt-2 border-t border-zinc-50">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="truncate">{job.location || "Not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <DollarSign className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="truncate">{job.salary || "Not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Briefcase className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="truncate">
              {job.jobType.replace("_", " ").toLowerCase()}
              {job.workMode ? ` • ${getWorkModeLabel(job.workMode)}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-50">
        <Link
          href={`/jobs/${job.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/50 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100/70 hover:text-rose-700 disabled:opacity-50 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </button>
      </div>
    </div>
  );
}