"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        alert(data.message);
        return;
      }

      alert("Job Added Successfully");

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-8 shadow"
    >
      <input
        name="company"
        placeholder="Company Name"
        value={form.company}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
        required
      />

      <input
        name="position"
        placeholder="Job Position"
        value={form.position}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
        required
      />

      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      >
        <option value="APPLIED">Applied</option>
        <option value="INTERVIEW">Interview</option>
        <option value="OFFER">Offer</option>
        <option value="REJECTED">Rejected</option>
        <option value="HIRED">Hired</option>
      </select>

      <select
        name="jobType"
        value={form.jobType}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      >
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="INTERNSHIP">Internship</option>
        <option value="CONTRACT">Contract</option>
        <option value="FREELANCE">Freelance</option>
      </select>

      <select
        name="workMode"
        value={form.workMode}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      >
        <option value="ONSITE">On Site</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
      </select>

      <input
        name="salary"
        placeholder="Salary"
        value={form.salary}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      />

      <input
        name="jobUrl"
        placeholder="Job URL"
        value={form.jobUrl}
        onChange={handleChange}
        className="w-full rounded-lg border p-3"
      />

      <textarea
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
        rows={4}
        className="w-full rounded-lg border p-3"
      />

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Adding Job..." : "Add Job"}
      </button>
    </form>
  );
}