"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward } from "lucide-react";

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

type MeditationPhase = {
  phase: string;
  text: string;
  theme?: {
    duration?: number;
    [key: string]: any;
  };
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

function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState<string>("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
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
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);
  const ttsCacheRef = useRef<Record<number, string>>({});

  // Voice narration uses a ref (single source of truth)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const currentPhaseRef = useRef(0);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  const phase = meditation[currentPhase];
  const displayedText = useTypewriter(phase?.text ?? "");

  // Fade text in on phase change
  useEffect(() => {
    setTextVisible(false);
    const t = setTimeout(() => setTextVisible(true), 200);
    return () => clearTimeout(t);
  }, [currentPhase]);

  // Fetch entry and meditation
  useEffect(() => {
    const fetchData = async () => {
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

        // 🐲 check things now maybe not in localstorage
        const stored = localStorage.getItem("currentMeditation");
        if (stored) {
          try {
            setMeditation(JSON.parse(stored));
          } catch {
            console.error("Failed to parse meditation from localStorage");
          }
        }

        // Start background music for target emotion
        const music = new Audio(`/music/${data.target_emotion}.mp3`);
        music.loop = true;
        music.volume = 0.35;
        setBgAudio(music);
      }

      setLoading(false);
    };

    fetchData();
  }, [entryId, router]);

  useEffect(() => {
    return () => {
      try {
        bgAudio?.pause();
        if (voiceAudioRef.current) {
          voiceAudioRef.current.pause();
          voiceAudioRef.current.src = "";
          voiceAudioRef.current = null;
        }
        ttsAbortRef.current?.abort();
      } catch {}
    };
  }, [bgAudio]);

  // TTS for each phase when playing
  useEffect(() => {
    if (!isPlaying) return;
    const p = meditation[currentPhase];
    if (!p?.text) return;

    // stop previous voice
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.src = "";
      voiceAudioRef.current = null;
    }

    // abort previous fetch
    ttsAbortRef.current?.abort();
    const ctrl = new AbortController();
    ttsAbortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: p.text }),
          signal: ctrl.signal
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        voiceAudioRef.current = audio;

        // Revoke blob URL after playback ends to free memory
        const onEnded = () => {
          URL.revokeObjectURL(url);
          audio.removeEventListener("ended", onEnded);
        };
        audio.addEventListener("ended", onEnded);

        // Play (may require use gesture on first attempt)
        await audio.play().catch(() => {
          /* user must press play first */
        });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error(e);
        }
      }
    })();
    return () => {
      // leave controller to be aborted by next run or unmount
    };
  }, [isPlaying, currentPhase, meditation]);

  const completeMeditation = useCallback(async () => {
    setIsPlaying(false);
    setSessionComplete(true);

    try {
      bgAudio?.pause();
      voiceAudioRef.current?.pause?.();
    } catch {}

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user && entryId) {
      await supabase.from("meditation_sessions").insert([
        {
          user_id: user.id,
          mood_entry_id: entryId,
          completed: true,
          duration_seconds: totalTimeElapsed
        }
      ]);
    }

    setTimeout(() => router.push("/profile"), 2500);
  }, [entryId, totalTimeElapsed, router, bgAudio]);

  // Playback timer (stable: not stale state)
  useEffect(() => {
    if (!isPlaying || meditation.length === 0) return;

    const interval = setInterval(() => {
      setTotalTimeElapsed((prev) => prev + 1);

      setTimeInPhase((prev) => {
        const active = meditation[currentPhaseRef.current];
        const duration = active?.theme?.duration ?? 90;
        const next = prev + 1;

        if (next >= duration) {
          if (currentPhaseRef.current < meditation.length - 1) {
            setCurrentPhase((p) => {
              const n = p + 1;
              currentPhaseRef.current = n;
              return n;
            });
            return 0; // reset for next phase
          } else {
            clearInterval(interval);
            // call after state flush
            setTimeout(() => completeMeditation(), 0);
            return prev;
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, meditation, completeMeditation]);

  const togglePlayPause = () => {
    setIsPlaying((p) => {
      const next = !p;
      if (next) {
        bgAudio?.play().catch(() => {});
        voiceAudioRef.current?.play?.();
      } else {
        bgAudio?.pause();
        voiceAudioRef.current?.pause?.();
      }
      return next;
    });
  };

  const skipToNextPhase = () => {
    if (currentPhase < meditation.length - 1) {
      voiceAudioRef.current?.pause?.();
      voiceAudioRef.current = null;

      setCurrentPhase((p) => {
        const next = p + 1;
        currentPhaseRef.current = next;
        return next;
      });
      setTimeInPhase(0);
    } else {
      completeMeditation();
    }
  };

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
        <h2 className="text-4xl font-bold mb-4">Beautiful work</h2>
        <p className="text-gray-300">You completed your meditation.</p>
      </div>
    );
  }

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
  const phaseDuration = phase?.theme?.duration || 90;
  const phaseProgressPercent = (timeInPhase / phaseDuration) * 100;
  const totalProgress =
    ((currentPhase + timeInPhase / phaseDuration) / meditation.length) * 100;

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
          {/* Breathing circle */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none">
            <div className="relative w-56 h-56">
              <div
                className="absolute inset-0 rounded-full border-2 border-white/40"
                style={{ animation: "breathe 6s ease-in-out infinite" }}
              />
              <div
                className="absolute inset-8 rounded-full border-2 border-white/30"
                style={{ animation: "breathe 6s ease-in-out infinite 0.7s" }}
              />
              <div
                className="absolute inset-16 rounded-full border-2 border-white/20"
                style={{ animation: "breathe 6s ease-in-out infinite 1.4s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm"
                  style={{ boxShadow: "0 0 30px rgba(255, 255, 255, 0.6)" }}
                />
              </div>
            </div>
          </div>

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
            {textVisible ? displayedText : ""}
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
