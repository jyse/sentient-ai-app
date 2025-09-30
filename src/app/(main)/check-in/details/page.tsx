"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const TARGET_OPTIONS = [
  {
    id: "calm",
    label: "Calm",
    description: "Peace and serenity",
    emoji: "🌿",
    color: "bg-teal-600"
  },
  {
    id: "content",
    label: "Content",
    description: "Gentle satisfaction",
    emoji: "😊",
    color: "bg-orange-600"
  },
  {
    id: "grateful",
    label: "Grateful",
    description: "Appreciative and warm",
    emoji: "🙏",
    color: "bg-purple-600"
  }
];

export default function TargetEmotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMood = searchParams.get("mood");

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!currentMood || !selectedTarget) return;
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    // Find the latest mood entry for this user
    const { data: latestEntry, error: fetchError } = await supabase
      .from("mood_entries")
      .select("id")
      .eq("user_id", user.id)
      .eq("current_emotion", currentMood)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !latestEntry) {
      console.error(fetchError);
      setFeedback("Could not find your mood entry 💔");
      setLoading(false);
      return;
    }

    // Update the same entry with target emotion
    const { error: updateError } = await supabase
      .from("mood_entries")
      .update({ target_emotion: selectedTarget })
      .eq("id", latestEntry.id);

    setLoading(false);

    if (updateError) {
      console.error(updateError);
      setFeedback("Something went wrong. Try again 💔");
    } else {
      setFeedback("Got it. Preparing your meditation ✨");
      setTimeout(() => {
        router.push("/meditation/ready");
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
        </div>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Let’s find your next step.
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Based on how you’re feeling, here are some moods you could aim for.
        </p>

        {/* Target Options */}
        <div className="flex gap-4 mb-8">
          {TARGET_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTarget(option.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 min-w-[140px]
                ${
                  selectedTarget === option.id
                    ? "bg-gray-800 border-purple-500 scale-105"
                    : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600"
                }
              `}
            >
              <div
                className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center mb-3 mx-auto`}
              >
                <span className="text-xl">{option.emoji}</span>
              </div>
              <h3 className="font-semibold mb-1">{option.label}</h3>
              <p className="text-xs text-gray-400">{option.description}</p>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && <p className="text-sm text-purple-300 mb-4">{feedback}</p>}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedTarget || loading}>
            {loading ? "Saving..." : "Create my meditation"}
          </Button>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>←</span> Back to Welcome
        </button>
      </div>
    </div>
  );
}
