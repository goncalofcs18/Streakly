"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.auth.login(username, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-coal-800 rounded-2xl border border-coal-700 shadow-xl">
        <h1 className="text-3xl font-display font-bold mb-6 text-center">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coal-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-coal-900 border border-coal-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-flame-500 transition-all"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coal-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-coal-900 border border-coal-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-flame-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-flame-500/20"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-coal-400 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-flame-400 hover:underline font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
