import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import WelcomePage from '@/components/meditation/WelcomePage';
import OnboardingFlow from '@/components/meditation/OnboardingFlow';
import MeditationDashboard from '@/components/meditation/MeditationDashboard';
import AuthPage from '@/components/auth/AuthPage';
import FloatingBackground from '@/components/meditation/FloatingBackground';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartJourney = () => {
    if (user) {
      setShowOnboarding(true);
    }
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    setShowDashboard(true);
  };

  const handleBackToWelcome = () => {
    setShowOnboarding(false);
    setShowDashboard(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-ambient flex items-center justify-center">
        <FloatingBackground />
        <div className="card-zen p-8">
          <div className="animate-pulse-glow w-16 h-16 rounded-full bg-gradient-awareness mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (showDashboard) {
    return <MeditationDashboard onBackToWelcome={handleBackToWelcome} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleCompleteOnboarding}
        onBack={handleBackToWelcome}
      />
    );
  }

  return (
    <WelcomePage 
      user={user} 
      onStartJourney={handleStartJourney}
    />
  );
};

export default Index;