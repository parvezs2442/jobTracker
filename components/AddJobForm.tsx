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

    if (!form.company || !form.position) {
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
      className="rounded-2xl border border-zinc-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            name="company"
            placeholder="Google, Stripe, Vercel, etc."
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
            required
          />
        </div>

        {/* Job Position */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Job Position <span className="text-rose-500">*</span>
          </label>
          <input
            name="position"
            placeholder="Software Engineer, Product Designer, etc."
            value={form.position}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Location
          </label>
          <input
            name="location"
            placeholder="San Francisco, CA or Remote"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Salary
          </label>
          <input
            name="salary"
            placeholder="e.g. $120k - $140k"
            value={form.salary}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Application Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none cursor-pointer"
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIRED">Hired</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Job Type
          </label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none cursor-pointer"
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
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Work Mode
          </label>
          <select
            name="workMode"
            value={form.workMode}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none cursor-pointer"
          >
            <option value="ONSITE">On Site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Job Posting URL
          </label>
          <input
            name="jobUrl"
            placeholder="https://jobs.lever.co/company/role"
            value={form.jobUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
            Notes & Details
          </label>
          <textarea
            name="notes"
            placeholder="Record notes on interviewers, follow-ups, requirements, or resume tweaks..."
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <Link
          href="/jobs"
          className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding Application...</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              <span>Add Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}