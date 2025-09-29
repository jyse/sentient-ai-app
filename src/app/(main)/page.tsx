"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const PHASES = [
  { id: "awareness", label: "Awareness", subtitle: "Tune In" },
  { id: "acceptance", label: "Acceptance", subtitle: "Embrace" },
  { id: "processing", label: "Processing", subtitle: "Explore" },
  { id: "reframing", label: "Reframing", subtitle: "Transform" },
  { id: "integration", label: "Integration", subtitle: "Unify" },
  { id: "maintenance", label: "Maintenance", subtitle: "Sustain" }
];

const FALLBACK_NAMES = ["Explorer", "Seeker", "Traveler", "Wanderer", "Friend"];

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Try to get name from user metadata or generate fallback
        const name =
          user.user_metadata?.name ||
          FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];
        setUserName(name);
      }

      setLoading(false);
    };

    initUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
      {/* Floating orbs - positioned absolutely for background effect */}
      <div className="absolute top-20 left-20 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-10 right-32 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-teal-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-orange-600 rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/2 left-10 w-40 h-40 bg-green-600 rounded-full blur-3xl opacity-40" />

      {/* Decorative circles - outline only */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 border border-white/10 rounded-full" />
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 border border-white/10 rounded-full" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Badge */}
        <div className="mb-6 px-4 py-2 bg-purple-800/50 rounded-full border border-purple-400/30 text-sm">
          ✨ Emotional Wellness Journey
        </div>

        {/* Welcome text */}
        <h1 className="text-5xl font-bold mb-4 text-center">
          Welcome back, <span className="text-purple-300">{userName}</span>
        </h1>

        <p className="text-gray-300 text-center max-w-xl mb-12">
          Ready to explore your inner landscape? Let Sentient guide you through
          a personalized meditation crafted just for your emotional state.
        </p>

        {/* Phase buttons */}
        <div className="flex gap-4 mb-12 flex-wrap justify-center max-w-3xl">
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-purple-800/30 border border-purple-400/40 hover:bg-purple-700/40 hover:scale-110 transition-all duration-300"
            >
              <span className="text-xs font-medium">{phase.label}</span>
              <span className="text-xs text-gray-400">{phase.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Main CTA */}
        <Button
          onClick={() => router.push("/check-in")}
          size="lg"
          className="bg-purple-600 hover:bg-purple-500 text-white px-12 py-6 text-lg rounded-full mb-8"
        >
          ❤️ Begin Your Journey
        </Button>

        <p className="text-sm text-gray-400 text-center max-w-md mb-8">
          Each journey is unique. Sentient will personalize your experience
          based on how you are feeling today.
        </p>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
