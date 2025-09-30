"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  voice_preference: string | null;
  session_duration: string | null;
};

type MoodEntry = {
  id: string;
  created_at: string;
  current_emotion: string;
  note: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setProfile(profileData);

        // Load recent mood entries
        const { data: moodData } = await supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7);

        setMoodEntries(moodData || []);
      }

      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-950 text-white relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-8">
        {/* Top navigation */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Profile header */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {profile?.name || user?.email?.split("@")[0] || "User"}
            </h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>

          {/* Stats and preferences grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Meditation Stats */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📊 Meditation Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sessions Complete</span>
                  <span className="text-2xl font-bold text-purple-400">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Minutes</span>
                  <span className="text-2xl font-bold text-orange-400">0</span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                ⚙️ Meditation Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Voice Style</p>
                  <div className="flex gap-2">
                    {["Gentle", "Warm", "Neutral"].map((voice) => (
                      <button
                        key={voice}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          profile?.voice_preference?.toLowerCase() ===
                          voice.toLowerCase()
                            ? "bg-purple-600"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                      >
                        {voice}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Session Duration</p>
                  <div className="flex gap-2">
                    {["10-15", "15-20", "20-25"].map((duration) => (
                      <button
                        key={duration}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          profile?.session_duration === duration
                            ? "bg-purple-600"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                      >
                        {duration} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent mood entries */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ❤️ Recent Emotional Check-ins
            </h2>
            {moodEntries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moodEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-800/50 rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-gray-400 mb-1">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </p>
                    <p className="font-medium capitalize">
                      {entry.current_emotion}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {entry.note.substring(0, 30)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No check-ins yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
