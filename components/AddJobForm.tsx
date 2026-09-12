"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddJobForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    company: "",
    position: "",
    location: "",
    status: "APPLIED",
    jobType: "FULL_TIME",
    workMode: "ONSITE",
    salary: "",
    jobUrl: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.company?.trim() || !form.position?.trim()) {
      toast.error("Company and Position are required fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/jobs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        toast.error(data.message || "Failed to add job application");
        return;
      }

      toast.success("Job application tracked successfully!");
      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.07] bg-[#12151E] p-6 md:p-8 shadow-xs space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Company Name <span className="text-rose-400">*</span>
          </label>
          <input
            name="company"
            placeholder="Google, Stripe, Vercel, etc."
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            required
          />
        </div>

        {/* Job Position */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Job Position <span className="text-rose-400">*</span>
          </label>
          <input
            name="position"
            placeholder="Software Engineer, Product Designer, etc."
            value={form.position}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Location
          </label>
          <input
            name="location"
            placeholder="San Francisco, CA or Remote"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Salary Range
          </label>
          <input
            name="salary"
            placeholder="e.g. $120k - $140k"
            value={form.salary}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Application Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white transition focus:border-blue-500/50 focus:outline-none cursor-pointer"
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Job Type
          </label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white transition focus:border-blue-500/50 focus:outline-none cursor-pointer"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Work Mode
          </label>
          <select
            name="workMode"
            value={form.workMode}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white transition focus:border-blue-500/50 focus:outline-none cursor-pointer"
          >
            <option value="ONSITE">On Site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Job Posting URL
          </label>
          <input
            name="jobUrl"
            placeholder="https://company.com/careers/job"
            value={form.jobUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Notes & Details
          </label>
          <textarea
            name="notes"
            placeholder="Record notes on interviewers, requirements, follow-ups, or questions..."
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-white/[0.06]">
        <Link
          href="/jobs"
          className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving Application...</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Save Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}