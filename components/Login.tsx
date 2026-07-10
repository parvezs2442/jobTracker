"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await loginUser(email, password);

      alert(res.message);

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">

      <h1 className="mb-6 text-3xl font-bold">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full rounded border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full rounded border p-3"
        />

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 py-3 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p className="mt-5 text-center">

        Don't have an account?

        <Link
          href="/register"
          className="ml-2 text-blue-600"
        >
          Register
        </Link>

      </p>

    </div>
  );
}