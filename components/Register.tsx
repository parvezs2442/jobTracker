"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterForm() {

  const router = useRouter();

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [loading,setLoading]=useState(false);

  const handleSubmit=async(
    e:React.FormEvent<HTMLFormElement>
  )=>{

    e.preventDefault();

    try{

      setLoading(true);

      const res=await registerUser(
        name,
        email,
        password
      );

      alert(res.message);

      router.push("/login");

    }catch(error:any){

      alert(error.message);

    }finally{

      setLoading(false);

    }

  }

  return (

    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">

      <h1 className="mb-6 text-3xl font-bold">
        Register
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="w-full rounded border p-3"
        />

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
          {loading ? "Creating..." : "Register"}
        </button>

      </form>

      <p className="mt-5 text-center">

        Already have an account?

        <Link
          href="/login"
          className="ml-2 text-blue-600"
        >
          Login
        </Link>

      </p>

    </div>

  );

}