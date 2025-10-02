"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  getTargetEmotions,
  getEmotionDisplay
} from "@/lib/emotionProgressions";

export default function MeditationIntentionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");

  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [fetchingMood, setFetchingMood] = useState(true);

  // Fetch current mood from DB
  useEffect(() => {
    const fetchCurrentMood = async () => {
      if (!entryId) {
        setFeedback("Missing entry information. Please start over.");
        setFetchingMood(false);
        return;
      }

      const { data, error } = await supabase
        .from("mood_entries")
        .select("current_emotion, target_emotion")
        .eq("id", entryId)
        .single();

      if (error) {
        console.error("Error fetching mood entry:", error);
        setFeedback("Couldn't load your check-in. Please try again.");
      } else if (data) {
        setCurrentMood(data.current_emotion);
        if (data.target_emotion) {
          setSelectedTarget(data.target_emotion); // pre-fill if user already chose
        }
      }

      setFetchingMood(false);
    };

    fetchCurrentMood();
  }, [entryId]);

  const targetEmotionIds = getTargetEmotions(currentMood);

  const handleSubmit = async () => {
    if (!selectedTarget || !entryId) return;
    setLoading(true);

    const { error } = await supabase
      .from("mood_entries")
      .update({ target_emotion: selectedTarget })
      .eq("id", entryId);

    setLoading(false);

    if (error) {
      console.log("👹Error updating target emotion:", error);
      setFeedback("Something went wrong. Please try again.");
    } else {
      setFeedback("Got it. Preparing your meditation...");
      setTimeout(() => {
        router.push(`/meditation/ready?entry_id=${entryId}`);
      }, 800);
    }
  };

  // Loading
  if (fetchingMood) {
    return (
      <div className="min-h-screen bg-purple-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Error
  if (!entryId || !currentMood) {
    return (
      <div className="min-h-screen bg-purple-950 text-white flex flex-col items-center justify-center gap-4">
        <p>We could not find your check-in.</p>
        <Button onClick={() => router.push("/check-in")}>Start Over</Button>
      </div>
    );
  }

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
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Set your intention
        </h2>
        <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
          We guide you step by step — for example, from sadness toward calmness,
          not all the way to joy in one leap.
        </p>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
          You are feeling{" "}
          <span className="text-white font-medium">{currentMood}</span>. Where
          would you like this meditation to guide you?
        </p>

        {/* Mood Transition Visual */}
        <div className="flex items-center gap-2 mb-8 text-lg">
          <span>{getEmotionDisplay(currentMood)?.emoji}</span>
          <span className="text-gray-400">→</span>
          {selectedTarget ? (
            <span>{getEmotionDisplay(selectedTarget)?.emoji}</span>
          ) : (
            <span className="text-gray-600">?</span>
          )}
        </div>

        {/* Target Options */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center max-w-2xl">
          {targetEmotionIds.map((emotionId) => {
            const display = getEmotionDisplay(emotionId);
            return (
              <button
                key={emotionId}
                onClick={() => setSelectedTarget(emotionId)}
                aria-pressed={selectedTarget === emotionId}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 min-w-[140px]
                  ${
                    selectedTarget === emotionId
                      ? "bg-gray-800 border-purple-500 scale-105"
                      : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600"
                  }
                `}
              >
                <div
                  className={`w-12 h-12 ${display.color} rounded-full flex items-center justify-center mb-3 mx-auto`}
                >
                  <span className="text-xl">{display.emoji}</span>
                </div>
                <h3 className="font-semibold mb-1">{display.label}</h3>
                <p className="text-xs text-gray-400">{display.description}</p>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && <p className="text-sm text-purple-300 mb-4">{feedback}</p>}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/check-in?entry_id=${entryId}`)}
          >
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedTarget || loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
