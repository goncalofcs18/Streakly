"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await api.auth.register(username, password);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-coal-800 rounded-2xl border border-coal-700 shadow-xl">
        <h1 className="text-3xl font-display font-bold mb-6 text-center">Join Streakly</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg mb-6 text-sm text-center">
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coal-300 mb-1">Username</label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-coal-900 border border-coal-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-flame-500 transition-all"
              placeholder="At least 3 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coal-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-coal-900 border border-coal-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-flame-500 transition-all"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coal-300 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-coal-900 border border-coal-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-flame-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-flame-500 hover:bg-flame-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-flame-500/20"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-coal-400 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-flame-400 hover:underline font-medium">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
