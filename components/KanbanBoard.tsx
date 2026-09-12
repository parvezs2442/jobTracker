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
  Inbox
} from "lucide-react";
import { toast } from "sonner";
import KanbanCard, { KanbanJob } from "./KanbanCard";
import { updateJobStatus, deleteJob } from "@/lib/jobs";

// Canonical Status definitions matching Prisma JobStatus enum
const COLUMNS: {
  key: "APPLIED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}[] = [
  {
    key: "APPLIED",
    label: "Applied",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-400",
    badgeBorder: "border-blue-500/20",
    dotColor: "bg-blue-400",
  },
  {
    key: "INTERVIEW",
    label: "Interview",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-400",
    badgeBorder: "border-indigo-500/20",
    dotColor: "bg-indigo-400",
  },
  {
    key: "OFFER",
    label: "Offer",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/20",
    dotColor: "bg-emerald-400",
  },
  {
    key: "HIRED",
    label: "Hired",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/20",
    dotColor: "bg-cyan-400",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/20",
    dotColor: "bg-rose-400",
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load jobs from database";
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/jobs", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load jobs");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.jobs) {
          setJobs(data.jobs);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to load jobs from database";
          toast.error(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    } catch (error: unknown) {
      // 3. Rollback on failure
      setJobs(originalJobs);
      const message = error instanceof Error ? error.message : `Failed to update status. Reverted ${targetJob.company} to ${previousStatus}.`;
      toast.error(message);
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
    } catch (error: unknown) {
      setJobs(originalJobs);
      const message = error instanceof Error ? error.message : `Could not delete ${company}. Reverted.`;
      toast.error(message);
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
    <div className="space-y-6 max-w-[1700px] mx-auto pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Job Applications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Track and manage your entire job search pipeline across every stage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#12151E] p-1 shadow-xs">
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>List</span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
              <KanbanIcon className="h-3.5 w-3.5 text-blue-400" />
              <span>Board</span>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            title="Refresh pipeline"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#12151E] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.04] hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Job Button */}
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#12151E] p-2.5 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search applications by company, position, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-[#0B0D12] pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-zinc-500 shrink-0 hidden sm:block" />
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-white/[0.06] bg-[#0B0D12] px-3 py-1.5 text-xs font-medium text-zinc-300 focus:border-blue-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-Site</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="rounded-2xl border border-white/[0.05] bg-[#0E121A]/70 p-3.5 min-h-[520px] flex flex-col gap-3 animate-pulse"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="h-4 bg-white/[0.08] rounded w-20" />
                <div className="h-4 bg-white/[0.08] rounded-full w-8" />
              </div>
              <div className="h-24 bg-[#141824] border border-white/[0.05] rounded-xl" />
              <div className="h-24 bg-[#141824] border border-white/[0.05] rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        /* Kanban Columns Workspace Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnJobs = jobsByStatus[col.key] || [];
            const isOver = dragOverColumn === col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`flex flex-col rounded-2xl border transition-all duration-150 min-h-[560px] bg-[#0E121A]/70 backdrop-blur-xs ${
                  isOver
                    ? "border-blue-500/50 bg-blue-500/[0.03] ring-1 ring-blue-500/25 shadow-lg"
                    : "border-white/[0.06] hover:border-white/[0.1]"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-white/[0.06] bg-[#111520]/80 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>

                  {/* Column Job Count Badge */}
                  <span
                    className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${col.badgeBg} ${col.badgeText} ${col.badgeBorder}`}
                  >
                    {columnJobs.length} {columnJobs.length === 1 ? "app" : "apps"}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-270px)]">
                  {columnJobs.length === 0 ? (
                    /* Empty State for Column */
                    <div
                      className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors min-h-[140px] ${
                        isOver
                          ? "border-blue-500/40 bg-blue-500/[0.04] text-blue-400"
                          : "border-white/[0.06] text-zinc-600"
                      }`}
                    >
                      <Inbox className="h-5 w-5 stroke-1 mb-1.5 opacity-40" />
                      <p className="text-xs font-medium text-zinc-400">
                        {isOver ? "Release to drop" : "No applications"}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        Drag here to set as {col.label.toLowerCase()}
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
                    <div className="rounded-xl border border-dashed border-blue-500/40 bg-blue-500/[0.05] p-3 text-center text-xs font-semibold text-blue-400 animate-pulse">
                      Drop to move into {col.label}
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
