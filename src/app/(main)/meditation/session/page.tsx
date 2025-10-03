"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward } from "lucide-react";

// 🎨 Emotion color mapping
const EMOTION_COLORS: Record<
  string,
  { hue: number; sat: number; light: number }
> = {
  sad: { hue: 210, sat: 60, light: 40 },
  anxious: { hue: 150, sat: 50, light: 45 },
  angry: { hue: 0, sat: 70, light: 50 },
  frustrated: { hue: 30, sat: 65, light: 48 },
  confused: { hue: 280, sat: 45, light: 50 },
  calm: { hue: 180, sat: 50, light: 55 },
  content: { hue: 45, sat: 70, light: 60 },
  peaceful: { hue: 240, sat: 40, light: 50 },
  grateful: { hue: 270, sat: 55, light: 58 },
  happy: { hue: 50, sat: 80, light: 65 }
};

// 📝 Types
type MoodEntry = {
  id: string;
  current_emotion: string;
  target_emotion: string;
  note: string | null;
};

export type MeditationTheme = {
  duration?: number; // seconds
  color?: string;
  [key: string]: string | number | undefined;
};

export type MeditationPhase = {
  phase: string;
  text: string;
  theme?: MeditationTheme;
};

// 🎨 Helpers
function interpolateColor(
  from: { hue: number; sat: number; light: number },
  to: { hue: number; sat: number; light: number },
  progress: number
) {
  return {
    hue: from.hue + (to.hue - from.hue) * progress,
    sat: from.sat + (to.sat - from.sat) * progress,
    light: from.light + (to.light - from.light) * progress
  };
}

function toHSL(color: { hue: number; sat: number; light: number }) {
  return `hsl(${color.hue}, ${color.sat}%, ${color.light}%)`;
}

export default function MeditationSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");

  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [meditation, setMeditation] = useState<MeditationPhase[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Keep a ref with the latest currentPhase to avoid stale closures in setInterval
  const currentPhaseRef = useRef(0);
  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  // 🗂 Fetch mood entry + meditation JSON
  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) {
        router.push("/check-in");
        return;
      }

      const { data } = await supabase
        .from("mood_entries")
        .select("id, current_emotion, target_emotion, note")
        .eq("id", entryId)
        .single();

      if (data) setEntry(data);

      const stored = localStorage.getItem("currentMeditation");
      if (stored) {
        try {
          setMeditation(JSON.parse(stored));
        } catch {
          // if bad data, fall back to empty
          setMeditation([]);
        }
      }

      setLoading(false);
    };

    fetchEntry();
  }, [entryId, router]);

  // ✨ Fade-in effect when phase changes
  useEffect(() => {
    setTextVisible(false);
    setTimeInPhase(0);
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, [currentPhase]);

  // ⏱ Compute accurate elapsed time (sum of completed phases + current phase progress)
  const computeElapsedSeconds = useCallback(
    (phaseIndex: number, secondsInPhase: number) => {
      const sumBefore = meditation
        .slice(0, phaseIndex)
        .reduce((acc, p) => acc + (p.theme?.duration || 90), 0);
      return sumBefore + secondsInPhase;
    },
    [meditation]
  );

  // ✅ Complete meditation (save session + route)
  const completeMeditation = useCallback(async () => {
    setIsPlaying(false);
    setSessionComplete(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user && entryId) {
      const elapsed = computeElapsedSeconds(
        currentPhaseRef.current,
        timeInPhase
      );
      await supabase.from("meditation_sessions").insert([
        {
          user_id: user.id,
          mood_entry_id: entryId,
          completed: true,
          duration_seconds: elapsed
        }
      ]);
    }

    setTimeout(() => {
      router.push("/profile");
    }, 2500);
  }, [entryId, router, computeElapsedSeconds, timeInPhase]);

  // ⏱ Phase timer – single interval, no stale `currentPhase`
  useEffect(() => {
    if (!isPlaying || meditation.length === 0) return;

    const interval = setInterval(() => {
      setTimeInPhase((prev) => {
        const idx = currentPhaseRef.current;
        const phase = meditation[idx];
        const duration = phase?.theme?.duration || 90;
        const newTime = prev + 1;

        if (newTime >= duration) {
          // Advance to next phase or complete
          setCurrentPhase((prevPhase) => {
            const next = Math.min(prevPhase + 1, meditation.length - 1);
            currentPhaseRef.current = next;
            return next;
          });

          if (idx >= meditation.length - 1) {
            // finishing last phase
            // Use a microtask to avoid state updates inside state setter chain
            Promise.resolve().then(() => completeMeditation());
          }

          return 0; // reset timer for the new/current phase
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, meditation, completeMeditation]);

  const togglePlayPause = () => setIsPlaying((p) => !p);

  const skipToNextPhase = () => {
    setCurrentPhase((prev) => {
      const next = Math.min(prev + 1, meditation.length - 1);
      currentPhaseRef.current = next;
      return next;
    });
    setTimeInPhase(0);
  };

  // 🌀 States
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">
        <p>Loading your meditation...</p>
      </div>
    );
  }

  if (!entry || !entry.target_emotion || !meditation.length) {
    return (
      <div className="min-h-screen bg-purple-950 flex flex-col items-center justify-center text-white gap-4">
        <p>Something went wrong.</p>
        <Button onClick={() => router.push("/check-in")}>Start Over</Button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-purple-950 flex flex-col items-center justify-center text-white">
        <h2 className="text-4xl font-bold mb-4">Beautiful work ✨</h2>
        <p className="text-gray-300">You completed your meditation.</p>
      </div>
    );
  }

  // 🎨 Background interpolation
  const currentColor =
    EMOTION_COLORS[entry.current_emotion] || EMOTION_COLORS.calm;
  const targetColor =
    EMOTION_COLORS[entry.target_emotion] || EMOTION_COLORS.peaceful;
  const phaseProgress = currentPhase / Math.max(1, meditation.length - 1);
  const interpolated = interpolateColor(
    currentColor,
    targetColor,
    phaseProgress
  );
  const backgroundColor = toHSL(interpolated);

  const phase = meditation[currentPhase];
  const phaseDuration = phase?.theme?.duration || 90;
  const phaseProgressPercent = (timeInPhase / phaseDuration) * 100;
  const totalProgress =
    ((currentPhase + timeInPhase / phaseDuration) / meditation.length) * 100;

  // 🎭 UI
  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.5;
          }
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden transition-colors duration-2000"
        style={{ backgroundColor }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div
            className="h-full bg-white/60 transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Phase indicator */}
        <div className="absolute top-8 text-sm opacity-60">
          Phase {currentPhase + 1} of {meditation.length}
        </div>

        {/* Main content */}
        <div className="max-w-2xl px-8 text-center space-y-8 relative">
          <h2
            className={`text-3xl font-semibold transition-opacity duration-1000 relative mt-64 ${
              textVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {phase?.phase}
          </h2>
          <p
            className={`text-xl leading-relaxed max-w-lg mx-auto transition-opacity duration-1500 delay-500 relative ${
              textVisible ? "opacity-90" : "opacity-0"
            }`}
          >
            {phase?.text}
          </p>

          {/* Phase progress */}
          <div className="pt-8 relative">
            <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-white/70 transition-all duration-300"
                style={{ width: `${phaseProgressPercent}%` }}
              />
            </div>
            <p className="text-sm text-white/60 mt-3 font-light">
              {Math.floor(timeInPhase)}s / {phaseDuration}s
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl">
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 flex items-center justify-center bg-white/90 text-black rounded-full shadow-lg hover:scale-105 transition-all"
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={skipToNextPhase}
            className="w-12 h-12 flex items-center justify-center text-white bg-white/5 rounded-full border border-white/10 hover:bg-white/15 transition-all"
          >
            <SkipForward size={20} />
          </button>
          <div className="h-8 w-px bg-white/20" />
          <button
            onClick={completeMeditation}
            className="px-4 py-2 text-sm text-white/80 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-all"
          >
            End Session
          </button>
        </div>
      </div>
    </>
  );
}
