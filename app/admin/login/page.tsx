"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-dark flex flex-col items-center justify-center px-6">
      {/* Card */}
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top band */}
          <div className="bg-primary-soft px-8 py-8 text-center border-b border-primary-soft">
            <Logo className="justify-center mb-4" />
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to view feedback responses</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-muted focus:border-primary focus:outline-none transition-colors text-base"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-muted focus:border-primary focus:outline-none transition-colors text-base"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          Credentials are set in the <code className="bg-white/20 px-1.5 py-0.5 rounded text-white">.env.local</code> file
        </p>
      </div>
    </div>
  );
}
