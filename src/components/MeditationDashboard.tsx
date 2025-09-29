import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  User, 
  ArrowLeft,
  Clock,
  Heart,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FloatingBackground from './FloatingBackground';
import MeditationPlayer from './MeditationPlayer';
import UserProfile from './UserProfile';

interface MeditationDashboardProps {
  onBackToWelcome: () => void;
}

const phases = [
  { 
    name: 'Awareness', 
    duration: '3 min',
    description: 'Tune into your present moment',
    color: 'bg-gradient-awareness'
  },
  { 
    name: 'Acceptance', 
    duration: '2 min',
    description: 'Embrace what you discover',
    color: 'bg-gradient-acceptance'
  },
  { 
    name: 'Processing', 
    duration: '4 min',
    description: 'Explore your emotions deeply',
    color: 'bg-gradient-processing'
  },
  { 
    name: 'Reframing', 
    duration: '3 min',
    description: 'Transform your perspective',
    color: 'bg-gradient-reframing'
  },
  { 
    name: 'Integration', 
    duration: '2 min',
    description: 'Unify your insights',
    color: 'bg-gradient-integration'
  },
  { 
    name: 'Maintenance', 
    duration: '2 min',
    description: 'Sustain your peace',
    color: 'bg-gradient-maintenance'
  },
];

const MeditationDashboard = ({ onBackToWelcome }: MeditationDashboardProps) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [recentMood, setRecentMood] = useState<any>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get most recent mood entry
      const { data: moodData } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (moodData) setRecentMood(moodData);

      // Get session count
      const { count } = await supabase
        .from('meditation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setSessionCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

  const startMeditation = () => {
    setShowPlayer(true);
    toast({
      title: "Welcome to your journey ✨",
      description: "Tomo will guide you through each phase with care and wisdom.",
    });
  };

  const handleMeditationComplete = () => {
    setShowPlayer(false);
    fetchUserData(); // Refresh data
    toast({
      title: "Beautiful work! 🌟",
      description: "You've completed another step in your wellness journey.",
    });
  };

  if (showProfile) {
    return (
      <UserProfile 
        onBack={() => setShowProfile(false)}
        onBackToWelcome={onBackToWelcome}
      />
    );
  }

  if (showPlayer) {
    return (
      <MeditationPlayer 
        recentMood={recentMood}
        onComplete={handleMeditationComplete}
        onBack={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ambient relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBackToWelcome}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Welcome
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => setShowProfile(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-awareness/20 border border-awareness/30 text-awareness-bright">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Ready for Meditation</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-shadow-soft">
              Your Meditation is{' '}
              <span className="bg-gradient-awareness bg-clip-text text-transparent">
                Ready
              </span>
            </h1>
            
            {recentMood && (
              <p className="text-xl text-muted-foreground">
                Tomo has prepared a special journey for your{' '}
                <span className="text-foreground font-medium">
                  {recentMood.mood_text || 'current state'}
                </span>
              </p>
            )}
          </div>

          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-zen text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-awareness rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Total Duration</h3>
                <p className="text-2xl font-bold text-awareness-bright">16 min</p>
              </CardContent>
            </Card>
            
            <Card className="card-zen text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-integration rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Sessions Completed</h3>
                <p className="text-2xl font-bold text-integration-bright">{sessionCount}</p>
              </CardContent>
            </Card>
            
            <Card className="card-zen text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-maintenance rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">Emotional Phases</h3>
                <p className="text-2xl font-bold text-maintenance-bright">6</p>
              </CardContent>
            </Card>
          </div>

          {/* Meditation Phases */}
          <Card className="card-meditation">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Your Emotional Journey</CardTitle>
              <p className="text-center text-muted-foreground">
                Six carefully crafted phases to guide your emotional exploration
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                {phases.map((phase, index) => (
                  <div key={phase.name} className="text-center space-y-3">
                    <div className={`w-16 h-16 ${phase.color} rounded-full mx-auto flex items-center justify-center shadow-soft`}>
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{phase.name}</h3>
                      <Badge variant="secondary" className="text-xs bg-white/10 mt-1">
                        {phase.duration}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={startMeditation}
                  size="lg"
                  className="btn-zen text-lg px-12 py-6 animate-pulse-glow group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Begin Meditation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tomo Message */}
          <Card className="card-zen bg-gradient-awareness/10 border-awareness/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-awareness rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-awareness-bright">Message from Tomo</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    I've sensed your emotional state and crafted this meditation specifically for you. 
                    Each phase will honor where you are while gently guiding you toward deeper awareness 
                    and peace. Remember, there's no wrong way to feel - only opportunities to grow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeditationDashboard;