"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = {
  id: string;
  user_id: string;
  name: string | null;
};

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackNames = [
    "Beautiful Soul",
    "Sentient Being",
    "Rockstar",
    "Cowboy",
    "Explorer"
  ];

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          // fallback: create profile row
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id
            })
            .select()
            .single();

          profile = newProfile;
        }

        setProfile(profile);
      }
      setLoading(false);
    };

    getUserAndProfile();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const displayName =
    profile?.name ||
    fallbackNames[Math.floor(Math.random() * fallbackNames.length)];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome back, {displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Choose your emotional journey to begin your meditation.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="h-20">
                Awareness
              </Button>
              <Button variant="outline" className="h-20">
                Acceptance
              </Button>
              <Button variant="outline" className="h-20">
                Release
              </Button>
              <Button variant="outline" className="h-20">
                Renewal
              </Button>
            </div>

            <Button className="w-full h-16">Begin Your Journey</Button>

            <div className="mt-8">
              <Button variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
