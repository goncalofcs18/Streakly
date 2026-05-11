"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = api.auth.getToken();
    setIsLoggedIn(!!token);
    
    // Simple redirect if not logged in and not on auth pages
    const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
    if (!token && !isAuthPage) {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    api.auth.logout();
  };

  if (!mounted) return null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <title>Streakly</title>
        <meta name="description" content="Track habits. Build streaks. Stay on fire." />
      </head>
      <body className="bg-coal-900 text-coal-50 font-body antialiased min-h-screen">
        <nav className="border-b border-coal-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-coal-900/80 backdrop-blur-sm">
          <a href="/" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="text-flame-400">🔥</span>
            <span>Streakly</span>
          </a>
          
          {isLoggedIn && (
            <div className="flex items-center gap-1">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/log">Log</NavLink>
              <NavLink href="/habits">Habits</NavLink>
              <NavLink href="/analytics">Analytics</NavLink>
              <button 
                onClick={handleLogout}
                className="ml-4 px-3 py-1.5 rounded-lg text-sm font-medium text-coal-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {!isLoggedIn && (
            <div className="flex items-center gap-1">
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            </div>
          )}
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-coal-200 hover:text-white hover:bg-coal-700 transition-colors"
    >
      {children}
    </a>
  );
}
