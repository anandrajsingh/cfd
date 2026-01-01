"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SignInPayload = {
    email: string,
    password: string
}

export default function SignInPage() {
    const [form, setForm] = useState<SignInPayload>({
        email: "",
        password: ""
    })

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("http://localhost:3001/api/v1/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(form)
            })
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Signin failed.");
            }
        } catch (err) {
            console.log("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h1 className="mb-6 text-2xl font-semibold text-white">
                    Sign in to you account
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-zinc-700 focus:ring-green-400"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-zinc-700 focus:ring-green-400"
                    />

                    <button disabled={loading} className="w-full rounded bg-green-500 py-2 font-medium text-black hover:bg-green-400 disabled:opacity-50">
                        {loading? "Creating Account...": "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    )
}