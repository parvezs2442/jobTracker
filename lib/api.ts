// lib/api.ts

const BASE_URL = "http://localhost:3000";

export async function apiRequest(
  endpoint: string,
  options: RequestInit
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}