"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
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
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return router.push("/login");
    }

    // Insert mood entry and get the ID back
    const { data, error } = await supabase
      .from("mood_entries")
      .insert([
        {
          user_id: user.id,
          current_emotion: selectedMood,
          note: note || null
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setTimeout(() => {
        router.push(`/meditation/intention?entry_id=${data.id}`);
      }, 800);
    }
    if (error) {
      console.log("👹👹👹FULL ERROR:", error);
      setFeedback("Something went wrong. Please try again.");
      return;
    }

    if (data) {
      setFeedback("Got it, moving forward...");
      setTimeout(() => {
        router.push(`/meditation/intention?entry_id=${data.id}`);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
          <div className="w-2 h-2 bg-purple-800 rounded-full" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center">
          How are you feeling right now?
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Pick the mood that feels strongest right now.
        </p>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl w-full mb-8">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                ${
                  selectedMood === mood.id
                    ? "bg-gray-800 border-purple-500 scale-105"
                    : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center mb-3 mx-auto`}
              >
                <span className="text-xl">{mood.emoji}</span>
              </div>
              <h3 className="font-semibold mb-1">{mood.label}</h3>
              <p className="text-xs text-gray-400">{mood.description}</p>
            </button>
          ))}
        </div>

        {/* Note Field */}
        <div className="w-full max-w-2xl mb-6">
          <label className="block text-sm mb-2">
            (Optional) Share more about what’s on your heart
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Only you can see this. It’s stored privately in your account to help
            guide your meditation.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/40 resize-none"
            rows={3}
            placeholder="Write freely here..."
          />
        </div>

        {/* Feedback */}
        {feedback && <p className="text-sm text-purple-300 mb-4">{feedback}</p>}

        {/* Continue Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMood || loading}
          className="w-full max-w-xs"
        >
          {loading ? "Saving..." : "Continue"}
        </Button>

        {/* Back */}
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
