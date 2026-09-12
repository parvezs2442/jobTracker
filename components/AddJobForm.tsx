"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Loader2, FileText, Upload } from "lucide-react";
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

  const [resumeMode, setResumeMode] = useState<"NONE" | "LINK" | "PDF">("NONE");
  const [resumeLink, setResumeLink] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    fileKey: string;
    originalFilename: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
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

  function handleResumeModeChange(mode: "NONE" | "LINK" | "PDF") {
    setResumeMode(mode);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Please upload a PDF document (.pdf only)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit. Please choose a smaller PDF.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/resume", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to upload resume PDF");
        return;
      }

      setUploadedFile({
        fileKey: data.fileKey,
        originalFilename: data.originalFilename,
        size: data.size,
      });
      toast.success("Resume PDF attached!");
    } catch (err) {
      console.error(err);
      toast.error("Error uploading resume. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeUploadedFile() {
    setUploadedFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.company?.trim() || !form.position?.trim()) {
      toast.error("Company and Position are required fields.");
      return;
    }

    if (resumeMode === "LINK" && !resumeLink.trim()) {
      toast.error("Please provide a valid resume URL or select None.");
      return;
    }

    if (resumeMode === "PDF" && !uploadedFile) {
      toast.error("Please upload a resume PDF or select None.");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        ...form,
      };

      if (resumeMode === "LINK" && resumeLink.trim()) {
        payload.resumeType = "LINK";
        payload.resumeUrl = resumeLink.trim();
        payload.resumeFilename = "Resume Link";
      } else if (resumeMode === "PDF" && uploadedFile) {
        payload.resumeType = "PDF";
        payload.resumeUrl = uploadedFile.fileKey;
        payload.resumeFilename = uploadedFile.originalFilename;
      } else {
        payload.resumeType = null;
        payload.resumeUrl = null;
        payload.resumeFilename = null;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

        {/* Resume Section */}
        <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-[#0E121B] p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-200">
                Resume Submitted
              </label>
              <p className="text-[11px] text-zinc-500">
                Track the exact resume version submitted for this role.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-[#0B0D12] p-1 rounded-lg border border-white/[0.06] text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleResumeModeChange("NONE")}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
                  resumeMode === "NONE"
                    ? "bg-white/[0.1] text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => handleResumeModeChange("LINK")}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
                  resumeMode === "LINK"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Resume Link
              </button>
              <button
                type="button"
                onClick={() => handleResumeModeChange("PDF")}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
                  resumeMode === "PDF"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Upload PDF
              </button>
            </div>
          </div>

          {/* Option A: Link */}
          {resumeMode === "LINK" && (
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Resume URL (Google Drive, Notion, Portfolio, etc.)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/... or https://example.com/resume.pdf"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          )}

          {/* Option B: PDF Upload */}
          {resumeMode === "PDF" && (
            <div className="pt-1">
              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white truncate max-w-[220px] sm:max-w-md">
                        {uploadedFile.originalFilename}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        PDF • {(uploadedFile.size / 1024).toFixed(0)} KB • Attached
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/[0.12] rounded-xl hover:border-blue-500/40 hover:bg-white/[0.02] transition cursor-pointer">
                    <Upload className="h-5 w-5 text-zinc-400 mb-1" />
                    <span className="text-xs font-medium text-zinc-300">
                      {uploading ? "Uploading PDF..." : "Click to select or drop Resume PDF"}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">
                      PDF format only (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-[#0E121B]/80 flex items-center justify-center rounded-xl">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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