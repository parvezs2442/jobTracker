"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    async function handleLogout() {

        try {

            setLoading(true);

            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            alert(data.message);

            router.push("/login");
            router.refresh();

        } catch (error) {

            alert("Something went wrong.");

        } finally {

            setLoading(false);

        }

    }

    return (

        <button
            onClick={handleLogout}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
            {loading ? "Logging Out..." : "Logout"}
        </button>

    );
}