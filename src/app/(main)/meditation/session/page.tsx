"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward } from "lucide-react";

// 🎯 TODO: Replace with RAG retrieval
const STATIC_PHASES = [
  {
    name: "Awareness",
    guidance:
      "Notice how you're feeling right now. There's no need to change anything. Just observe with gentle curiosity.",
    duration: 90 // seconds per phase
  },
  {
    name: "Acceptance",
    guidance:
      "Whatever you're feeling is okay. It belongs here. Let it exist without needing to fix or change it.",
    duration: 90
  },
  {
    name: "Processing",
    guidance:
      "Breathe into this feeling. With each breath, create a little more space around it. You're safe here.",
    duration: 90
  },
  {
    name: "Reframing",
    guidance:
      "Notice any shift, however small. You're beginning to move. There's movement even in stillness.",
    duration: 90
  },
  {
    name: "Integration",
    guidance:
      "Feel yourself here, grounded and present. This new feeling is becoming part of you now.",
    duration: 90
  },
  {
    name: "Maintenance",
    guidance:
      "Carry this with you. You can return to this place whenever you need. It's always here for you.",
    duration: 90
  }
];

// Emotion color mapping
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

type MoodEntry = {
  id: string;
  current_emotion: string;
  target_emotion: string;
  note: string | null;
};

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
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch mood entry
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

      if (data) {
        setEntry(data);
      }
      setLoading(false);
    };

    fetchEntry();
  }, [entryId, router]);

  // Text fade in when phase changes
  useEffect(() => {
    setTextVisible(false);
    setTimeInPhase(0);
    const timer = setTimeout(() => {
      setTextVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPhase]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeInPhase((prev) => {
        const phase = STATIC_PHASES[currentPhase];
        const newTime = prev + 1;

        // Auto-advance to next phase when time runs out
        if (newTime >= phase.duration) {
          if (currentPhase < STATIC_PHASES.length - 1) {
            setCurrentPhase(currentPhase + 1);
            return 0;
          } else {
            completeMeditation();
            return prev;
          }
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPhase]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skipToNextPhase = () => {
    if (currentPhase < STATIC_PHASES.length - 1) {
      setCurrentPhase(currentPhase + 1);
      setTimeInPhase(0);
    } else {
      completeMeditation();
    }
  };

  const completeMeditation = async () => {
    setIsPlaying(false);
    setSessionComplete(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user && entryId) {
      await supabase.from("meditation_sessions").insert([
        {
          user_id: user.id,
          mood_entry_id: entryId,
          completed: true,
          duration_seconds: currentPhase * 90 + timeInPhase
        }
      ]);
    }

    setTimeout(() => {
      router.push("/profile");
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">
        <p>Loading your meditation...</p>
      </div>
    );
  }

  if (!entry || !entry.target_emotion) {
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
        <h2 className="text-4xl font-bold mb-4">Beautiful work</h2>
        <p className="text-gray-300">You completed your meditation.</p>
      </div>
    );
  }

  // Calculate colors
  const currentColor =
    EMOTION_COLORS[entry.current_emotion] || EMOTION_COLORS.calm;
  const targetColor =
    EMOTION_COLORS[entry.target_emotion] || EMOTION_COLORS.peaceful;
  const phaseProgress = currentPhase / (STATIC_PHASES.length - 1);
  const interpolated = interpolateColor(
    currentColor,
    targetColor,
    phaseProgress
  );
  const backgroundColor = toHSL(interpolated);

  const phase = STATIC_PHASES[currentPhase];
  const phaseProgressPercent = (timeInPhase / phase.duration) * 100;
  const totalProgress =
    ((currentPhase + timeInPhase / phase.duration) / STATIC_PHASES.length) *
    100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden transition-colors duration-2000"
      style={{ backgroundColor }}
    >
      {/* Floating orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-30 transition-all duration-2000"
        style={{ backgroundColor: toHSL(currentColor) }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 transition-all duration-2000"
        style={{ backgroundColor: toHSL(targetColor) }}
      />

      {/* Total progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
        <div
          className="h-full bg-white/60 transition-all duration-300"
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Phase indicator */}
      <div className="absolute top-8 text-sm opacity-60">
        Phase {currentPhase + 1} of {STATIC_PHASES.length}
      </div>

      {/* Main content */}
      <div className="max-w-2xl px-8 text-center space-y-8">
        <h2
          className={`text-3xl font-semibold transition-opacity duration-1000 ${
            textVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {phase.name}
        </h2>

        <p
          className={`text-xl leading-relaxed max-w-lg mx-auto transition-opacity duration-1500 delay-500 ${
            textVisible ? "opacity-90" : "opacity-0"
          }`}
        >
          {phase.guidance}
        </p>

        {/* Phase progress indicator */}
        <div className="pt-8">
          <div className="w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-white/60 transition-all duration-300"
              style={{ width: `${phaseProgressPercent}%` }}
            />
          </div>
          <p className="text-sm opacity-50 mt-2">
            {Math.floor(timeInPhase)}s / {phase.duration}s
          </p>
        </div>
      </div>

      {/* Player controls */}
      {/* <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/20">
        <button
          onClick={togglePlayPause}
          className="w-14 h-14 flex items-center justify-center bg-white text-black rounded-full hover:bg-white/90 transition-all"
        >
          {isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>

        <button
          onClick={skipToNextPhase}
          className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all"
        >
          <SkipForward size={20} />
        </button>

        <button
          onClick={completeMeditation}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          End Session
        </button>
      </div> */}

      {/* Player controls - Glassmorphic style */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 shadow-2xl">
        {/* Play/Pause - Main control */}
        <button
          onClick={togglePlayPause}
          className="relative w-16 h-16 flex items-center justify-center bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all active:scale-95"
          style={{
            boxShadow:
              "0 8px 32px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)"
          }}
        >
          {isPlaying ? (
            <Pause size={28} fill="currentColor" />
          ) : (
            <Play size={28} fill="currentColor" className="ml-1" />
          )}
        </button>

        {/* Skip button */}
        <button
          onClick={skipToNextPhase}
          className="w-12 h-12 flex items-center justify-center text-white bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all active:scale-95"
        >
          <SkipForward size={20} />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20" />

        {/* End session */}
        <button
          onClick={completeMeditation}
          className="px-4 py-2 text-sm text-white/80 hover:text-white bg-white/5 backdrop-blur-sm rounded-full hover:bg-white/10 transition-all"
        >
          End Session
        </button>
      </div>

      {/* Phase progress with glass effect */}
      <div className="pt-8">
        <div className="w-64 h-2 bg-white/10 backdrop-blur-sm rounded-full mx-auto overflow-hidden border border-white/20 shadow-inner">
          <div
            className="h-full bg-white/70 backdrop-blur-sm shadow-lg transition-all duration-300"
            style={{
              width: `${phaseProgressPercent}%`,
              boxShadow: "0 0 12px rgba(255, 255, 255, 0.5)"
            }}
          />
        </div>
        <p className="text-sm text-white/60 mt-3 font-light">
          {Math.floor(timeInPhase)}s / {phase.duration}s
        </p>
      </div>

      {/* 🎯 TODO: Add audio element here for voice playback */}
    </div>
  );
}
