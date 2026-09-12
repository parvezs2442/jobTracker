export interface CreateJobPayload {
  company: string;
  position: string;
  location?: string;
  salary?: string;
  status?: string;
  jobType?: string;
  workMode?: string;
  jobUrl?: string;
  notes?: string;
}

export interface JobItem {
  id: string;
  userId: string;
  company: string;
  position: string;
  location?: string | null;
  salary?: string | null;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED" | string;
  jobType?: string | null;
  workMode?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JobApiResponse {
  success?: boolean;
  message?: string;
  job?: JobItem;
  jobs?: JobItem[];
}

export async function getAllJobs() {
  const res = await fetch("/api/jobs", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return res.json();
}

export async function createJob(data: CreateJobPayload) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create job");
  }

  return res.json();
}

export async function deleteJob(id: string) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return res.json();
}

export async function updateJob(
  id: string,
  data: CreateJobPayload
) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateJobStatus(id: string, status: string) {
  const res = await fetch(`/api/jobs/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update status");
  }

  return data;
}