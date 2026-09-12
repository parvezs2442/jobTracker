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
  ExternalLink,
  ChevronRight,
  MoveRight
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
          return format(new Date(job.appliedAt), "MMM d, yyyy");
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
      className={`group relative rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40 scale-[0.98] border-dashed border-blue-400" : ""
      } ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
    >
      {/* Top Header: Company & Drag Indicator */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-bold text-xs text-zinc-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-zinc-950 group-hover:text-blue-600 transition-colors" title={job.company}>
              {job.company}
            </h4>
            <p className="truncate text-xs text-zinc-500 font-medium" title={job.position}>
              {job.position}
            </p>
          </div>
        </div>

        <div className="text-zinc-300 group-hover:text-zinc-400 shrink-0 p-0.5">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600">
        {job.location && (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 border border-zinc-100 px-2 py-0.5 font-medium">
            <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
            <span className="truncate max-w-[110px]">{job.location}</span>
          </span>
        )}

        {job.salary && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 font-medium">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[90px]">{job.salary}</span>
          </span>
        )}

        {job.workMode && (
          <span className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
            {job.workMode.charAt(0) + job.workMode.slice(1).toLowerCase()}
          </span>
        )}
      </div>

      {/* Applied Date / Footer */}
      <div className="mt-3.5 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-xs text-zinc-400">
        {formattedDate ? (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <span />
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Quick Move Status for Mobile / Keyboard */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(!showMoveMenu);
              }}
              title="Quick Move"
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition cursor-pointer"
            >
              <MoveRight className="h-3.5 w-3.5" />
            </button>

            {showMoveMenu && (
              <div 
                className="absolute right-0 bottom-full mb-1 z-30 w-36 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                  Move to
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
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    >
                      <span>{s.label}</span>
                      <ChevronRight className="h-3 w-3 text-zinc-400" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <Link
            href={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            title="Edit Application"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-blue-600 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete Application"
            className="rounded-md p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
