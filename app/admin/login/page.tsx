// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Wrong password.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
