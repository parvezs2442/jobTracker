export interface CreateJobPayload {
  company: string;
  position: string;
  location: string;
  salary: string;
  status: string;
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