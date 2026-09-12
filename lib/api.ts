// lib/api.ts

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    : "";

  const response = await fetch(`${baseUrl}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}