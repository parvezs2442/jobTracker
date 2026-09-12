"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { updateJob } from "@/lib/jobs";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const { id } = use(params);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Please log in to continue");
            router.push("/login");
            return;
          }
          if (res.status === 403) {
            toast.error("Forbidden: You do not have permission to view this job");
            router.push("/jobs");
            return;
          }
          toast.error(data.message || "Failed to fetch job details");
          router.push("/jobs");
          return;
        }

        if (data.job) {
          setForm({
            company: data.job.company || "",
            position: data.job.position || "",
            location: data.job.location || "",
            status: data.job.status || "APPLIED",
            jobType: data.job.jobType || "FULL_TIME",
            workMode: data.job.workMode || "ONSITE",
            salary: data.job.salary || "",
            jobUrl: data.job.jobUrl || "",
            notes: data.job.notes || "",
          });
        }
      } catch (error) {
        toast.error("An error occurred while fetching job details");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id, router]);

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
      setSaving(true);

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
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
        if (res.status === 403) {
          toast.error("Forbidden: You do not have permission to edit this job");
          router.push("/jobs");
          return;
        }
        toast.error(data.message || "Failed to update job application");
        return;
      }

      toast.success("Job application updated successfully!");
      router.push("/jobs");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-zinc-500">Loading job details...</p>
      </div>
    );
  }

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
          Edit Application
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update the status or log details for your application at {form.company}.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              name="company"
              placeholder="Google, Stripe, etc."
              value={form.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
              required
            />
          </div>

          {/* Position */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Job Position <span className="text-rose-500">*</span>
            </label>
            <input
              name="position"
              placeholder="Software Engineer, Frontend Developer, etc."
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
              placeholder="San Francisco, Remote, Hybrid"
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
              placeholder="e.g. $120,000/yr"
              value={form.salary}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Status
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
              value={form.workMode || "ONSITE"}
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
              Job URL
            </label>
            <input
              name="jobUrl"
              placeholder="https://company.com/careers/job"
              value={form.jobUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Application Notes
            </label>
            <textarea
              name="notes"
              placeholder="Record interviewer names, questions asked, next steps, or general feedback here..."
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
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
