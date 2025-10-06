"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PlanetBackground from "@/components/visuals/PlanetBackground";
import NavigationButtons from "@/components/ui/NavigationButtons";
import { CHECK_IN_MOODS } from "../../../lib/constants";

export default function CheckInPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry_id");
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
        .select("*")
        .maybeSingle();

      if (result.error) {
        console.error("❌ Supabase insert error:", result.error);
      } else {
        console.log("✅ You created a mood entry:", result.data);
      }
    }

    const { data, error } = result;
    setLoading(false);

    if (error || !data) {
      console.error("Mood save error:", error);
      setFeedback("Something went wrong saving your mood. Please try again 💔");
      return;
    }

    setFeedback("Mood saved! Redirecting...");
    console.log("✅ Mood saved");

    setTimeout(() => {
      router.push(`/meditation/direction?entry_id=${data.id}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-brand text-white relative overflow-hidden">
      <PlanetBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div
          className="w-full  max-w-lg bg-white/[0.05] border border-white/[0.08] 
                  backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)] mb-10"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              How are you feeling right now?
            </h2>
            <p className="text-gray-400 text-sm">
              Pick the mood that feels strongest right now.
            </p>
          </div>
          {/* Check-in Mood Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {CHECK_IN_MOODS.map((mood) => {
              const isActive = selectedMood === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`relative rounded-2xl p-5 transition-all duration-300 group overflow-hidden
              ${
                isActive
                  ? "bg-purple-600/20 border border-purple-400/40 scale-[1.03]"
                  : "bg-black/30 border border-white/10 hover:bg-white/[0.08]"
              }`}
                >
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`w-12 h-12 ${mood.color} rounded-full mb-3 flex items-center justify-center shadow-inner`}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{mood.label}</h3>
                    <p className="text-xs text-gray-400">{mood.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Note Section */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              (Optional) Share what’s on your heart 💭
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write freely here..."
              className="w-full rounded-xl bg-black/40 border border-white/[0.1] p-4 text-sm text-gray-300
                   focus:outline-none focus:ring-2 focus:ring-purple-500/70 resize-none transition-all"
              rows={3}
            />
            <p className="text-xs text-gray-500 text-center">
              Only you can see this. It’s stored privately to guide your
              meditations.
            </p>
          </div>
        </div>
        <div className="flex justify-between min-w-[520px]">
          <NavigationButtons
            onBack={() => router.back()}
            onNext={handleSubmit}
            nextLabel="Begin Journey"
            backLabel="Back"
            disabled={!selectedMood || loading}
          />
        </div>
      </div>
    </div>
  );
}
