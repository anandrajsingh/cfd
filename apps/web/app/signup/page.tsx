"use client";
import { useState } from "react";

type SignupPayload = {
    email: string,
    password: string,
    name: string
}

export default function SignupPage() {
    const [form, setForm] = useState<SignupPayload>({
        email: "",
        password: "",
        name: ""
    })
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3001/api/v1/signup", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(form)
            })

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Signup failed")
            }
            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h1 className="mb-6 text-2xl text-center font-semibold text-white">
                    Create your account
                </h1>

                {success ? (
                    <div className="rounded bg-green-500/10 p-4 text-green-400">
                        Account created successfully. You can now log in.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full rounded bg-zinc-800 px-3 py-2 text-white outline-none ring-1 ring-zinc-700 focus:ring-green-400"
                        />

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

                        <button
                            disabled={loading}
                            className="w-full rounded bg-green-500 py-2 font-medium text-black hover:bg-green-400 disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Sign up"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
