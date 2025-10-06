"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { getTargetEmotions, getEmotionDisplay } from "@/lib/emotionMap";
import PlanetBackground from "@/components/visuals/PlanetBackground";
import NavigationButtons from "@/components/ui/NavigationButtons";

export default function MeditationDirectionPage() {
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [fetchingMood, setFetchingMood] = useState(true);

  useEffect(() => {
    const fetchCurrentMood = async () => {
      if (!entryId) {
        console.log("👹 Missing entry information. Please start over");
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
        console.error("👹 Error fetching mood entry:", error);
        setFeedback("Couldn't load your check-in. Please try again.");
      } else if (data) {
        setCurrentMood(data.current_emotion);
        if (data.target_emotion) {
          setSelectedTarget(data.target_emotion);
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
      console.log("💫 Your meditation is being prepared!");
      setFeedback("Got it. Preparing your meditation...");
      setTimeout(() => {
        router.push(`/meditation/ready?entry_id=${entryId}`);
      }, 800);
    }
  };

  if (fetchingMood) {
    return (
      <div className="min-h-screen bg-purple-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!entryId || !currentMood) {
    return (
      <div className="min-h-screen bg-purple-950 text-white flex flex-col items-center justify-center gap-4">
        <p>We could not find your check-in.</p>
        <Button onClick={() => router.push("/check-in")}>Start Over</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand text-white relative overflow-hidden">
      <PlanetBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Choose Your Direction
        </h2>
        <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
          We’ll guide you gently, helping you shift from your current mood
          toward a calmer, lighter state.
        </p>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
          You are feeling{" "}
          <span className="text-white font-medium">{currentMood}</span> right
          now. Choose the feeling you’d like this meditation to guide you
          toward.
        </p>
        <div className="flex items-center gap-2 mb-8 text-lg">
          <span>{getEmotionDisplay(currentMood)?.emoji}</span>
          <span className="text-gray-400">→</span>
          {selectedTarget ? (
            <span>{getEmotionDisplay(selectedTarget)?.emoji}</span>
          ) : (
            <span className="text-gray-600">?</span>
          )}
        </div>
        <div className="flex gap-4 mb-8 flex-wrap justify-center max-w-2xl">
          {targetEmotionIds.map((targetEmotion) => {
            const display = getEmotionDisplay(targetEmotion);
            return (
              <button
                key={targetEmotion}
                onClick={() => setSelectedTarget(targetEmotion)}
                aria-pressed={selectedTarget === targetEmotion}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 min-w-[140px]
                  ${
                    selectedTarget === targetEmotion
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
          {feedback && (
            <p className="text-sm text-purple-300 mb-4">{feedback}</p>
          )}
          <div className="min-w-[490px] mt-6">
            <NavigationButtons
              onBack={() => router.push(`/check-in?entry_id=${entryId}`)}
              onNext={handleSubmit}
              nextLabel="Guide Me"
              backLabel="Back"
              disabled={!selectedTarget || loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
