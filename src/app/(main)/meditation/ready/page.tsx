"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type MoodEntry = {
  id: string;
  current_emotion: string;
  target_emotion: string | null;
  note: string | null;
};

export type MeditationTheme = {
  duration?: number;
  color?: string;
  [key: string]: string | number | undefined;
};

export type MeditationPhase = {
  phase: string;
  text: string;
  theme?: MeditationTheme;
};

// [
// { "phase": "Awareness", "text": "Notice how you're feeling...", "theme": { "duration": 90 } },
// { "phase": "Acceptance", "text": "Allow this feeling to be here...", "theme": { "duration": 90 } },
// { "phase": "Processing", "text": "Take a slow breath in...", "theme": { "duration": 90 } },
// { "phase": "Reframing", "text": "Notice new possibilities emerging...", "theme": { "duration": 90 } },
// { "phase": "Integration", "text": "Feel this new calm settling in...", "theme": { "duration": 90 } },
// { "phase": "Maintenance", "text": "Remember you can return here anytime...", "theme": { "duration": 90 } }
// ]

export default function MeditationReadyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");

  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [meditation, setMeditation] = useState<MeditationPhase[] | null>(null);

  // Fetch entry
  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) return;

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase
        .from("mood_entries")
        .select("id, current_emotion, target_emotion, note")
        .eq("id", entryId)
        .single();

      if (data) {
        // Inside fetchEntry, after `if (data) { ... }`:
        setEntry(data);
        // 👇 New: call /api/generate with this entry
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentEmotion: data.current_emotion,
            targetEmotion: data.target_emotion,
            note: data.note
          })
        });

        const meditationJson: MeditationPhase[] = await response.json();
        setMeditation(meditationJson);
        localStorage.setItem(
          "currentMeditation",
          JSON.stringify(meditationJson)
        );

        startPreparation();
      }
    };

    fetchEntry();
  }, [entryId, router]);

  const startPreparation = () => {
    // Simulate AI generation with loading steps
    // 🎯 TODO: Replace with actual AI calls

    setTimeout(() => setLoadingStep(1), 1000); // Understanding...
    setTimeout(() => setLoadingStep(2), 2500); // Selecting phases...
    setTimeout(() => setLoadingStep(3), 4000); // Ready!
    setTimeout(() => setCountdown(3), 5000); // Start countdown
  };

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      router.push(`/meditation/session?entry_id=${entryId}`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, entryId, router]);

  if (!entry) {
    return (
      <div className="min-h-screen bg-purple-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const loadingSteps = [
    { label: "Understanding your emotional state", complete: loadingStep >= 1 },
    { label: "Selecting guidance phases", complete: loadingStep >= 2 },
    { label: "Preparing your session", complete: loadingStep >= 3 }
  ];

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden flex flex-col items-center justify-center p-8">
      {/* Floating background shapes */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-32 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 text-center max-w-lg">
        {countdown !== null ? (
          // Countdown state
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Your Journey Awaits</h1>
            <p className="text-gray-300">
              You are feeling{" "}
              <span className="font-semibold text-purple-200">
                {entry.current_emotion}
              </span>
              <br />
              Let s guide you toward{" "}
              <span className="font-semibold text-orange-200">
                {entry.target_emotion}
              </span>
            </p>
            {entry.note && (
              <p className="text-sm text-purple-200 italic max-w-md mx-auto">
                {entry.note}
              </p>
            )}
            <div className="text-6xl font-bold mt-8">{countdown}</div>
            <p className="text-sm text-gray-400">Starting meditation...</p>
          </div>
        ) : (
          // Loading state
          <div className="space-y-6">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-semibold">Crafting your meditation</h2>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      step.complete
                        ? "bg-purple-500 border-purple-500"
                        : "border-gray-600"
                    }`}
                  >
                    {step.complete && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <p
                    className={`text-sm transition-opacity ${
                      step.complete ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional: Skip button during countdown */}
        {countdown !== null && (
          <button
            onClick={() =>
              router.push(`/meditation/session?entry_id=${entryId}`)
            }
            className="mt-6 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Start now
          </button>
        )}
      </div>
    </div>
  );
}
