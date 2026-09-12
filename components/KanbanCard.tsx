"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  GripVertical, 
  Trash2, 
  Edit3, 
  ChevronRight,
  MoveRight,
  FileText
} from "lucide-react";
import { format } from "date-fns";

export interface KanbanJob {
  id: string;
  company: string;
  position: string;
  location?: string | null;
  salary?: string | null;
  status: string;
  jobType: string;
  workMode?: string | null;
  appliedAt?: string | Date;
  notes?: string | null;
  jobUrl?: string | null;
  resumeType?: string | null;
  resumeFilename?: string | null;
}

interface KanbanCardProps {
  job: KanbanJob;
  onDelete: (id: string, company: string) => Promise<void>;
  onMoveStatus: (id: string, targetStatus: string) => void;
  availableStatuses: { key: string; label: string }[];
}

export default function KanbanCard({
  job,
  onDelete,
  onMoveStatus,
  availableStatuses,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const formattedDate = job.appliedAt
    ? (() => {
        try {
          return format(new Date(job.appliedAt), "MMM d");
        } catch {
          return null;
        }
      })()
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ id: job.id, sourceStatus: job.status }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Delete application for ${job.company}?`)) {
      try {
        setIsDeleting(true);
        await onDelete(job.id, job.company);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative rounded-xl border border-white/[0.07] bg-[#141824] p-3.5 shadow-xs transition-all duration-150 hover:bg-[#181D2A] hover:border-white/[0.15] hover:shadow-[0_4px_20px_rgba(0,0,0,0.35)] cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-35 scale-[0.98] border-dashed border-blue-500/60 bg-blue-500/[0.04]" : ""
      } ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
    >
      {/* Top Header: Company Name & Grip Icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block truncate">
            {job.company}
          </span>
          <Link
            href={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 block text-sm font-semibold text-zinc-100 hover:text-blue-400 transition-colors leading-snug line-clamp-2"
          >
            {job.position}
          </Link>
        </div>

        <div className="text-zinc-600 group-hover:text-zinc-400 shrink-0 pt-0.5 transition-colors">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Metadata Tags */}
      {(job.location || job.salary || job.workMode || job.resumeType) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          {job.location && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-zinc-300">
              <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
              <span className="truncate max-w-[120px]">{job.location}</span>
            </span>
          )}

          {job.salary && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-medium">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[90px]">{job.salary}</span>
            </span>
          )}

          {job.workMode && (
            <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-zinc-400">
              {job.workMode.charAt(0) + job.workMode.slice(1).toLowerCase()}
            </span>
          )}

          {job.resumeType && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300" title={job.resumeFilename || "Resume attached"}>
              <FileText className="h-3 w-3 text-blue-400" />
              <span>Resume attached</span>
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Date & Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs text-zinc-500">
        {formattedDate ? (
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-zinc-600" />
            <span>Applied {formattedDate}</span>
          </span>
        ) : (
          <span />
        )}

        {/* Quick action buttons */}
        <div className="flex items-center gap-0.5">
          {/* Quick Move Status Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(!showMoveMenu);
              }}
              title="Quick Move"
              className="rounded-md p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition cursor-pointer"
            >
              <MoveRight className="h-3.5 w-3.5" />
            </button>

            {showMoveMenu && (
              <div 
                className="absolute right-0 bottom-full mb-1.5 z-40 w-40 rounded-xl border border-white/[0.1] bg-[#181D29] py-1 shadow-2xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/[0.06]">
                  Move status to
                </div>
                {availableStatuses
                  .filter((s) => s.key !== job.status)
                  .map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setShowMoveMenu(false);
                        onMoveStatus(job.id, s.key);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                    >
                      <span>{s.label}</span>
                      <ChevronRight className="h-3 w-3 text-zinc-500" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <Link
            href={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Edit Application"
            className="rounded-md p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete Application"
            className="rounded-md p-1 text-zinc-500 hover:bg-rose-500/15 hover:text-rose-400 transition disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
