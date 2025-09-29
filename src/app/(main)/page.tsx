"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Middleware will handle redirect to login
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Welcome to <span className="text-primary">Sentient</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Your emotionally intelligent meditation companion
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="space-y-4">
                <p className="text-lg">
                  Hello, <span className="font-medium">{user.email}</span>!
                </p>
                <p className="text-muted-foreground">
                  Ready to begin your emotional wellness journey?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button size="lg" className="h-16">
                    Start Meditation
                  </Button>
                  <Button variant="outline" size="lg" className="h-16">
                    View Profile
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-16"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">No sessions yet</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Emotional Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Track your progress
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
