// src/components/Header.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-white border-b p-4 shadow-sm flex justify-between items-center">
      <div className="font-bold text-lg">🧘‍♀️ Sentient AI</div>
      <nav className="space-x-4">
        <button onClick={() => router.push("/meditation")}>Meditate</button>
        <button onClick={() => router.push("/profile")}>Profile</button>
      </nav>
    </header>
  );
}
