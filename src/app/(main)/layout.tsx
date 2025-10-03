"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-purple-950 text-white shadow-md">
        <Link href="/" className="font-bold text-lg">
          SentientAI
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/privacy" className="text-sm hover:text-purple-300">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm hover:text-purple-300">
            Terms
          </Link>

          {userEmail ? (
            <Link
              href="/profile"
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm"
            >
              {userEmail.split("@")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm"
            >
              Login
            </Link>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        <p>© {new Date().getFullYear()} SentientAI</p>
      </footer>
    </div>
  );
}
