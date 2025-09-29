"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const MOODS = [
  {
    id: "calm",
    label: "Calm",
    description: "Feeling peaceful and centered",
    emoji: "😌",
    color: "bg-teal-600"
  },
  {
    id: "happy",
    label: "Happy",
    description: "Joyful and optimistic",
    emoji: "😊",
    color: "bg-orange-600"
  },
  {
    id: "anxious",
    label: "Anxious",
    description: "Worried or restless",
    emoji: "😟",
    color: "bg-green-600"
  },
  {
    id: "sad",
    label: "Sad",
    description: "Feeling down or melancholy",
    emoji: "😢",
    color: "bg-indigo-600"
  },
  {
    id: "frustrated",
    label: "Frustrated",
    description: "Annoyed or stressed",
    emoji: "😤",
    color: "bg-yellow-600"
  },
  {
    id: "confused",
    label: "Confused",
    description: "Uncertain or overwhelmed",
    emoji: "😕",
    color: "bg-pink-600"
  }
];

export default function CheckInPage() {
  const router = useRouter();

  const handleMoodSelect = (moodId: string) => {
    // Navigate directly to details page with selected mood
    router.push(`/check-in/details?mood=${moodId}`);
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating orbs - same as welcome page */}
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
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
        </div>

        {/* Header with icon */}
        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">❤️</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2 text-center">
          Hello, beautiful soul 🌸
        </h1>

        <p className="text-gray-300 text-center max-w-lg mb-8">
          I am Tomo, your meditation companion. Let s start by understanding how
          you are feeling right now.
        </p>

        {/* Question */}
        <h2 className="text-2xl font-semibold mb-2">
          How are you feeling today?
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          Choose the mood that resonates most with you right now
        </p>

        {/* Mood grid */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl w-full mb-12">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                bg-gray-900/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600 hover:scale-105
              `}
            >
              {/* Icon circle */}
              <div
                className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center mb-3 mx-auto`}
              >
                <span className="text-xl">🎵</span>
              </div>

              {/* Emoji */}
              <div className="text-3xl mb-2">{mood.emoji}</div>

              {/* Label and description */}
              <h3 className="font-semibold mb-1">{mood.label}</h3>
              <p className="text-xs text-gray-400">{mood.description}</p>
            </button>
          ))}
        </div>

        {/* Back button */}
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
