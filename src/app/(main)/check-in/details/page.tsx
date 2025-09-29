"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MoodDetailsPage() {
  const [details, setDetails] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get selected mood from URL params
  const selectedMood = searchParams.get("mood") || "anxious";

  const handleBack = () => {
    router.back();
  };

  const handleCreateMeditation = () => {
    // TODO: Store mood details and navigate to meditation
    console.log("Mood:", selectedMood, "Details:", details);
    router.push(`/meditation/ready?mood=${selectedMood}`);
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-10 w-40 h-40 bg-green-600 rounded-full blur-3xl opacity-40" />

      {/* Decorative circles */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 border border-white/10 rounded-full" />
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 border border-white/10 rounded-full" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
        </div>

        {/* Icon circle */}
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl">≋</span>
        </div>

        {/* Title with dynamic mood */}
        <h1 className="text-3xl font-bold mb-2 text-center">
          I hear you feeling{" "}
          <span className="text-green-400">{selectedMood}</span>
        </h1>

        <p className="text-gray-300 text-center max-w-lg mb-8">
          Would you like to share more about what is on your heart?
        </p>

        {/* Text input card */}
        <div className="w-full max-w-2xl bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-6">
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell me more about how you're feeling... (optional)"
            className="w-full h-40 bg-transparent border-none outline-none text-white placeholder-gray-500 resize-none"
          />
        </div>

        {/* Selected mood badge */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
          <span className="text-sm">Selected:</span>
          <span className="text-sm font-medium text-green-400">
            😟 {selectedMood}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 text-white px-8 py-6 rounded-full"
          >
            ← Back
          </Button>

          <Button
            onClick={handleCreateMeditation}
            size="lg"
            className="bg-purple-600 hover:bg-purple-500 text-white px-12 py-6 rounded-full"
          >
            Create My Meditation →
          </Button>
        </div>

        {/* Back to welcome link */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>←</span> Back to Welcome
        </button>
      </div>
    </div>
  );
}
