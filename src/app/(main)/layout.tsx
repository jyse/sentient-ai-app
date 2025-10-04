"use client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-gray-800">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
