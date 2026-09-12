"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  RotateCw, 
  LayoutList, 
  Kanban as KanbanIcon, 
  Filter, 
  Inbox,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import KanbanCard, { KanbanJob } from "./KanbanCard";
import { updateJobStatus, deleteJob } from "@/lib/jobs";

// Canonical Status definitions matching Prisma JobStatus enum
const COLUMNS: {
  key: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | "HIRED";
  label: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  dotColor: string;
}[] = [
  {
    key: "APPLIED",
    label: "Applied",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    accentBorder: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    key: "INTERVIEW",
    label: "Interview",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    accentBorder: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    key: "OFFER",
    label: "Offer",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  {
    key: "HIRED",
    label: "Hired",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    accentBorder: "border-teal-200",
    dotColor: "bg-teal-500",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    accentBorder: "border-rose-200",
    dotColor: "bg-rose-500",
  },
];

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<KanbanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState<string>("ALL");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Fetch jobs from database
  const fetchJobs = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      const res = await fetch("/api/jobs", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load jobs");
      }

      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load jobs from database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Core status update with Optimistic UI & Revert on Failure
  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob || targetJob.status === newStatus) return;

    const previousStatus = targetJob.status;
    const originalJobs = [...jobs];

    // 1. Optimistic update
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );

    const columnDef = COLUMNS.find((c) => c.key === newStatus);
    const targetLabel = columnDef ? columnDef.label : newStatus;

    try {
      // 2. Persist to database via PATCH
      await updateJobStatus(jobId, newStatus);
      toast.success(`Moved ${targetJob.company} to ${targetLabel}`);
    } catch (error: any) {
      // 3. Rollback on failure
      setJobs(originalJobs);
      toast.error(
        error.message || `Failed to update status. Reverted ${targetJob.company} to previous column.`
      );
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== statusKey) {
      setDragOverColumn(statusKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the target column area
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    const jobId = e.dataTransfer.getData("text/plain");
    if (!jobId) return;

    await handleStatusChange(jobId, targetStatus);
  };

  // Delete handler with optimistic removal
  const handleDeleteJob = async (id: string, company: string) => {
    const originalJobs = [...jobs];
    setJobs((prev) => prev.filter((j) => j.id !== id));

    try {
      const res = await deleteJob(id);
      if (res.success) {
        toast.success(`Deleted ${company} application`);
      } else {
        throw new Error(res.message || "Failed to delete");
      }
    } catch (error: any) {
      setJobs(originalJobs);
      toast.error(error.message || `Could not delete ${company}. Reverted.`);
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesWorkMode =
        workModeFilter === "ALL" ||
        job.workMode?.toUpperCase() === workModeFilter;

      return matchesSearch && matchesWorkMode;
    });
  }, [jobs, searchQuery, workModeFilter]);

  // Group jobs by column
  const jobsByStatus = useMemo(() => {
    const map: Record<string, KanbanJob[]> = {
      APPLIED: [],
      INTERVIEW: [],
      OFFER: [],
      HIRED: [],
      REJECTED: [],
    };

    filteredJobs.forEach((job) => {
      const statusKey = job.status?.toUpperCase() || "APPLIED";
      if (map[statusKey]) {
        map[statusKey].push(job);
      } else {
        map.APPLIED.push(job);
      }
    });

    return map;
  }, [filteredJobs]);

  const availableStatusOptions = useMemo(
    () => COLUMNS.map((c) => ({ key: c.key, label: c.label })),
    []
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Application Pipeline
            </h1>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
              {jobs.length} total
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Drag and drop applications across stages to update your pipeline in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-xs">
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>List</span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-900">
              <KanbanIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>Kanban</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            title="Refresh database records"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:text-zinc-950 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Job Button */}
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by company, position, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0 hidden sm:block" />
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs font-medium text-zinc-700 focus:border-blue-500 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote Only</option>
            <option value="HYBRID">Hybrid Only</option>
            <option value="ONSITE">On-Site Only</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 min-h-[500px] flex flex-col gap-3 animate-pulse"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60">
                <div className="h-4 bg-zinc-200 rounded w-20" />
                <div className="h-4 bg-zinc-200 rounded-full w-6" />
              </div>
              <div className="h-28 bg-white border border-zinc-200 rounded-xl" />
              <div className="h-28 bg-white border border-zinc-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-start">
          {COLUMNS.map((col) => {
            const columnJobs = jobsByStatus[col.key] || [];
            const isOver = dragOverColumn === col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[560px] bg-zinc-50/60 ${
                  isOver
                    ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md"
                    : "border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200/70 bg-white/80 rounded-t-2xl backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                      {col.label}
                    </h3>
                  </div>

                  {/* Column Job Count Badge */}
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${col.badgeBg} ${col.badgeText}`}
                  >
                    {columnJobs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {columnJobs.length === 0 ? (
                    /* Empty State for Column */
                    <div
                      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors min-h-[160px] ${
                        isOver
                          ? "border-blue-400 bg-blue-50/50 text-blue-600"
                          : "border-zinc-200 text-zinc-400"
                      }`}
                    >
                      <Inbox className="h-6 w-6 stroke-1 mb-2 opacity-60" />
                      <p className="text-xs font-medium text-zinc-500">
                        {isOver ? "Drop application here" : "No applications here yet"}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Drag cards here to update status
                      </p>
                    </div>
                  ) : (
                    columnJobs.map((job) => (
                      <KanbanCard
                        key={job.id}
                        job={job}
                        onDelete={handleDeleteJob}
                        onMoveStatus={handleStatusChange}
                        availableStatuses={availableStatusOptions}
                      />
                    ))
                  )}

                  {/* Visual Drop target indicator when dragging over */}
                  {isOver && columnJobs.length > 0 && (
                    <div className="rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/40 p-4 text-center text-xs font-semibold text-blue-600 animate-pulse">
                      Drop here to set as {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
