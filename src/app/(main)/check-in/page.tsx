"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PlanetBackground from "@/components/visuals/PlanetBackground";
import NavigationButtons from "@/components/ui/NavigationButtons";

const MOODS = [
  {
    id: "calm",
    label: "Calm",
    emoji: "🧘‍♀️",
    description: "Feeling peaceful and centered",
    color: "bg-teal-500",
    glowFrom: "rgba(56,189,248,0.3)",
    glowTo: "rgba(17,94,89,0.1)"
  },
  {
    id: "happy",
    label: "Happy",
    emoji: "😊",
    description: "Joyful and optimistic",
    color: "bg-yellow-400",
    glowFrom: "rgba(251,191,36,0.3)",
    glowTo: "rgba(245,158,11,0.1)"
  },
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😬",
    description: "Worried or restless",
    color: "bg-orange-500",
    glowFrom: "rgba(253,186,116,0.3)",
    glowTo: "rgba(234,88,12,0.1)"
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😢",
    description: "Feeling down or melancholy",
    color: "bg-blue-400",
    glowFrom: "rgba(147,197,253,0.3)",
    glowTo: "rgba(37,99,235,0.1)"
  },
  {
    id: "frustrated",
    label: "Frustrated",
    emoji: "😤",
    description: "Annoyed or stressed",
    color: "bg-red-500",
    glowFrom: "rgba(248,113,113,0.3)",
    glowTo: "rgba(185,28,28,0.1)"
  },
  {
    id: "confused",
    label: "Confused",
    emoji: "😕",
    description: "Uncertain or overwhelmed",
    color: "bg-purple-500",
    glowFrom: "rgba(196,181,253,0.3)",
    glowTo: "rgba(126,34,206,0.1)"
  }
];
export default function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");

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

    const moodData = {
      current_emotion: selectedMood,
      note: note || null
    };

    let result;
    if (entryId) {
      // Update existing entry
      result = await supabase
        .from("mood_entries")
        .update(moodData)
        .eq("id", entryId)
        .select()
        .single();
    } else {
      // Create new entry
      result = await supabase
        .from("mood_entries")
        .insert([{ ...moodData, user_id: user.id }])
        .select()
        .single();
    }

    const { data, error } = result;
    setLoading(false);

    if (error || !data) {
      console.error("Mood save error:", error);
      setFeedback("Something went wrong saving your mood. Please try again 💔");
      return;
    }

    setFeedback("Mood saved! Redirectin...");
    console.log("✅ Mood saved");
    setTimeout(() => {
      router.push(`/meditation/direction?entry_id=${data.id}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand text-white relative overflow-hidden">
      <PlanetBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8 ">
        {/* Title */}
        <div className="p-6 rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            How are you feeling right now?
          </h2>
          <h3 className="text-gray-300 text-sm mb-6">
            Pick the mood that feels strongest right now.
          </h3>

          {/* Mood Grid */}
          <div className="grid grid-cols-2 gap-5 max-w-2xl w-full mb-6">
            {MOODS.map((mood) => {
              const isActive = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
          relative p-6 rounded-2xl transition-all duration-300 group
          backdrop-blur-md
          ${
            isActive
              ? "bg-white/10 border border-purple-500 shadow-lg scale-[1.03]"
              : "bg-black/30 border border-white/10 hover:bg-white/5 hover:border-white/20"
          }
        `}
                >
                  {/* Floating glow behind icon */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-500
            ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}
          `}
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${mood.glowFrom}, ${mood.glowTo})`,
                      filter: "blur(60px)",
                      zIndex: 0
                    }}
                  />

                  {/* Content layer */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center mb-3 mx-auto shadow-inner`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{mood.label}</h3>
                    <p className="text-xs text-gray-300">{mood.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Note Section */}
          <div className="w-full max-w-2xl space-y-4">
            <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
              (Optional) Share what’s on your heart <span>💭</span>
            </p>

            <textarea
              placeholder="Write freely here..."
              className="w-full rounded-xl bg-white/10 border border-white/10 p-4 text-sm text-gray-300 
               focus:outline-none focus:ring-2 focus:ring-purple-500/70 
               focus:border-transparent resize-none backdrop-blur-md transition-all duration-300
               placeholder:text-gray-400"
              rows={3}
            />

            <p className="text-xs text-gray-300 leading-snug text-center">
              Only you can see this. It’s stored privately to guide your
              meditations.
            </p>
          </div>
        </div>

        <NavigationButtons
          onBack={() => router.back()}
          onNext={() => router.push("/check-in")}
          nextLabel="Begin Journey"
          backLabel="Back"
        />
      </div>
    </div>
  );
}
