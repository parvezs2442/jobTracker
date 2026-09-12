"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { CreateJobPayload } from "@/lib/jobs";

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

  const [resumeMode, setResumeMode] = useState<"NONE" | "LINK" | "PDF">("NONE");
  const [resumeLink, setResumeLink] = useState("");
  const [existingResume, setExistingResume] = useState<{
    type: string;
    url: string;
    filename: string;
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    fileKey: string;
    originalFilename: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isReplacingResume, setIsReplacingResume] = useState(false);

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

          if (data.job.resumeType && data.job.resumeUrl) {
            setExistingResume({
              type: data.job.resumeType,
              url: data.job.resumeUrl,
              filename: data.job.resumeFilename || (data.job.resumeType === "PDF" ? "resume.pdf" : "Resume Link"),
            });
            setResumeMode(data.job.resumeType as "LINK" | "PDF");
            if (data.job.resumeType === "LINK") {
              setResumeLink(data.job.resumeUrl);
            }
          }
        }
      } catch {
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
      setExistingResume(null); // Marked as replaced
      toast.success("New resume PDF attached!");
    } catch (err) {
      console.error(err);
      toast.error("Error uploading resume. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveResume() {
    setExistingResume(null);
    setUploadedFile(null);
    setResumeLink("");
    setResumeMode("NONE");
    setIsReplacingResume(false);
    toast.info("Resume marked for removal. Save changes to update.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.company?.trim() || !form.position?.trim()) {
      toast.error("Company and Position are required fields.");
      return;
    }

    if (resumeMode === "LINK" && !resumeLink.trim() && !existingResume) {
      toast.error("Please provide a valid resume URL or select None.");
      return;
    }

    if (resumeMode === "PDF" && !uploadedFile && !existingResume) {
      toast.error("Please upload a resume PDF or select None.");
      return;
    }

    try {
      setSaving(true);

      const payload: CreateJobPayload = {
        ...form,
      };

      if (existingResume) {
        // Keep existing resume
        payload.resumeType = existingResume.type;
        payload.resumeUrl = existingResume.url;
        payload.resumeFilename = existingResume.filename;
      } else if (resumeMode === "LINK" && resumeLink.trim()) {
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

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        <p className="text-xs font-semibold text-zinc-400 tracking-wide">
          Loading job details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header Link */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Edit Application
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Update the status, log details, or manage the resume attached to{" "}
          <span className="text-zinc-200 font-medium">{form.company || "the company"}</span>.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/[0.08] bg-[#12151E] p-5 sm:p-7 shadow-xs space-y-5"
      >
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {/* Company */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              name="company"
              placeholder="Google, Stripe, etc."
              value={form.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
              required
            />
          </div>

          {/* Position */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Job Position <span className="text-rose-500">*</span>
            </label>
            <input
              name="position"
              placeholder="Software Engineer, Frontend Developer, etc."
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
              placeholder="San Francisco, Remote, Hybrid"
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Salary
            </label>
            <input
              name="salary"
              placeholder="e.g. $120,000/yr"
              value={form.salary}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Status
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
              value={form.workMode || "ONSITE"}
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
              Job URL
            </label>
            <input
              name="jobUrl"
              placeholder="https://company.com/careers/job"
              value={form.jobUrl}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B0D12] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          {/* Resume Submitted Section */}
          <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-[#0E121B] p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-200">
                  Resume Submitted
                </label>
                <p className="text-[11px] text-zinc-500">
                  View, replace, or remove the exact resume submitted for this application.
                </p>
              </div>

              {/* Mode Switcher if replacing or no resume */}
              {(isReplacingResume || (!existingResume && !uploadedFile)) && (
                <div className="flex items-center gap-1.5 bg-[#0B0D12] p-1 rounded-lg border border-white/[0.06] text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setResumeMode("NONE");
                      setExistingResume(null);
                      setUploadedFile(null);
                    }}
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
                    onClick={() => setResumeMode("LINK")}
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
                    onClick={() => setResumeMode("PDF")}
                    className={`px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
                      resumeMode === "PDF"
                        ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Upload PDF
                  </button>
                </div>
              )}
            </div>

            {/* Display Active / Existing Resume Card */}
            {existingResume && !isReplacingResume ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate max-w-[240px] sm:max-w-md">
                      {existingResume.filename}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {existingResume.type === "PDF" ? "PDF Document • Submitted" : "External URL Link • Submitted"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={`/api/jobs/${id}/resume`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition shadow-xs"
                  >
                    <span>{existingResume.type === "PDF" ? "View Resume" : "Open Link"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsReplacingResume(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1.5 rounded-lg border border-white/[0.08] transition cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 text-zinc-400" />
                    <span>Replace</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1.5 rounded-lg transition cursor-pointer"
                    title="Remove attached resume"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : uploadedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white truncate max-w-[220px] sm:max-w-md">
                      {uploadedFile.originalFilename}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      New PDF • {(uploadedFile.size / 1024).toFixed(0)} KB • Ready to save
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
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

                {resumeMode === "PDF" && (
                  <div className="relative pt-1">
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

                {resumeMode === "NONE" && (
                  <p className="text-xs text-zinc-500 py-1">
                    No resume currently attached to this application.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Application Notes
            </label>
            <textarea
              name="notes"
              placeholder="Record interviewer names, questions asked, next steps, or general feedback here..."
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
            disabled={saving}
            className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
