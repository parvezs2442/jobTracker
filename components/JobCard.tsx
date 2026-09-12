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
  Briefcase,
  FileText
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
    resumeType?: string | null;
    resumeFilename?: string | null;
  };
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPLIED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "INTERVIEW":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "HIRED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/[0.04] text-zinc-400 border-white/[0.06]";
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
    <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#141824] p-5 shadow-xs transition-all duration-150 hover:bg-[#181D2A] hover:border-white/[0.14] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-bold text-white shadow-xs">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white" title={job.company}>
                {job.company}
              </h3>
              <p className="truncate text-xs text-zinc-400 font-medium" title={job.position}>
                {job.position}
              </p>
            </div>
          </div>

          <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(job.status)}`}>
            {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Info Rows */}
        <div className="space-y-2 pt-2.5 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{job.location || "Not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <DollarSign className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{job.salary || "Not specified"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Briefcase className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">
              {job.jobType.replace("_", " ").toLowerCase()}
              {job.workMode ? ` • ${getWorkModeLabel(job.workMode)}` : ""}
            </span>
          </div>

          {job.resumeType && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="truncate">
                {job.resumeType === "PDF" ? (job.resumeFilename || "Resume attached (PDF)") : "Resume Link attached"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-end gap-2 pt-3.5 border-t border-white/[0.05]">
        <Link
          href={`/jobs/${job.id}`}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50 transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </button>
      </div>
    </div>
  );
}