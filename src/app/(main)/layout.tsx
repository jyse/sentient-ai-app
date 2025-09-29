// src/app/(main)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-gray-800">
      {/* //Header */}
      <main className="flex-1 p-4">{children}</main>
      {/* Footer */}
    </div>
  );
}
