"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const PHASES = [
  {
    id: 1,
    name: "Awareness",
    duration: "3 min",
    description: "Tune into your present moment",
    color: "bg-purple-600"
  },
  {
    id: 2,
    name: "Acceptance",
    duration: "2 min",
    description: "Embrace what you discover",
    color: "bg-teal-600"
  },
  {
    id: 3,
    name: "Processing",
    duration: "4 min",
    description: "Explore your emotions deeply",
    color: "bg-green-600"
  },
  {
    id: 4,
    name: "Reframing",
    duration: "3 min",
    description: "Transform your perspective",
    color: "bg-yellow-600"
  },
  {
    id: 5,
    name: "Integration",
    duration: "2 min",
    description: "Unify your insights",
    color: "bg-orange-600"
  },
  {
    id: 6,
    name: "Maintenance",
    duration: "2 min",
    description: "Sustain your peace",
    color: "bg-pink-600"
  }
];

export default function MeditationReadyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mood = searchParams.get("mood") || "sad";
  const totalDuration = 16; // Sum of all phases
  const sessionsCompleted = 5; // TODO: Get from database
  const totalPhases = PHASES.length;

  const handleBeginMeditation = () => {
    // TODO: Navigate to actual meditation player
    console.log("Starting meditation for mood:", mood);
    // router.push('/meditation/play')
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-10 w-40 h-40 bg-green-600 rounded-full blur-3xl opacity-40" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-8">
        {/* Top navigation */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Welcome
          </button>
        </div>

        {/* Center content */}
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-purple-800/50 rounded-full border border-purple-400/30 text-sm">
              ✨ Ready for Meditation
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-center mb-4">
            Your Meditation is <span className="text-purple-400">Ready</span>
          </h1>

          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
            I have prepared a special journey for your{" "}
            <span className="font-medium">{mood}</span> feelings
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⏱</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Duration</p>
              <p className="text-2xl font-bold text-purple-400">
                {totalDuration} min
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🧡</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">Sessions Completed</p>
              <p className="text-2xl font-bold text-orange-400">
                {sessionsCompleted}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✧</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">Emotional Phases</p>
              <p className="text-2xl font-bold text-pink-400">{totalPhases}</p>
            </div>
          </div>

          {/* Journey overview */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Your Emotional Journey
            </h2>
            <p className="text-gray-400 text-sm text-center mb-8">
              Six carefully crafted phases to guide your emotional exploration
            </p>

            {/* Phase timeline */}
            <div className="flex justify-between items-start gap-4">
              {PHASES.map((phase) => (
                <div
                  key={phase.id}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-16 h-16 ${phase.color} rounded-full flex items-center justify-center mb-2`}
                  >
                    <span className="text-xl font-bold">{phase.id}</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{phase.name}</p>
                  <p className="text-xs text-purple-400 mb-2">
                    {phase.duration}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Begin button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleBeginMeditation}
              size="lg"
              className="bg-purple-600 hover:bg-purple-500 text-white px-16 py-6 text-lg rounded-full"
            >
              ▶ Begin Meditation
            </Button>
          </div>

          {/* Message from Tomo */}
          {/* 🐲 Where should this message be in the layout? */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">❤️</span>
              </div>
              <div>
                <p className="font-semibold mb-2">
                  Message from Sentient AI 🤖
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  I have sensed your emotional state and crafted this meditation
                  specifically for you. Each phase will honor where you are
                  while gently guiding you toward deeper awareness and peace.
                  Remember, there is no wrong way to feel - only opportunities
                  to grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
