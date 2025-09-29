import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  ArrowLeft, 
  Volume2,
  Heart,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FloatingBackground from './FloatingBackground';

interface MeditationPlayerProps {
  recentMood: any;
  onComplete: () => void;
  onBack: () => void;
}

const phases = [
  { 
    name: 'Awareness', 
    duration: 180, // 3 minutes in seconds
    color: 'bg-gradient-awareness',
    accent: 'awareness-bright'
  },
  { 
    name: 'Acceptance', 
    duration: 120, 
    color: 'bg-gradient-acceptance',
    accent: 'acceptance-bright'
  },
  { 
    name: 'Processing', 
    duration: 240, 
    color: 'bg-gradient-processing',
    accent: 'processing-bright'
  },
  { 
    name: 'Reframing', 
    duration: 180, 
    color: 'bg-gradient-reframing',
    accent: 'reframing-bright'
  },
  { 
    name: 'Integration', 
    duration: 120, 
    color: 'bg-gradient-integration',
    accent: 'integration-bright'
  },
  { 
    name: 'Maintenance', 
    duration: 120, 
    color: 'bg-gradient-maintenance',
    accent: 'maintenance-bright'
  },
];

const MeditationPlayer = ({ recentMood, onComplete, onBack }: MeditationPlayerProps) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentScript, setCurrentScript] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const currentPhaseData = phases[currentPhase];
  const totalDuration = currentPhaseData.duration;
  const progress = (timeElapsed / totalDuration) * 100;

  useEffect(() => {
    initializeSession();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentPhase < phases.length) {
      fetchMeditationScript();
    }
  }, [currentPhase]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          mood_input: recentMood?.mood_text || 'Unknown',
          selected_phase: phases[currentPhase].name,
          session_duration: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error: any) {
      console.error('Error initializing session:', error);
    }
  };

  const fetchMeditationScript = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation', {
        body: {
          phase: phases[currentPhase].name,
          moodContext: recentMood?.mood_text || 'neutral',
          duration: phases[currentPhase].duration,
        },
      });

      if (error) throw error;

      setCurrentScript(data.script || `Welcome to the ${phases[currentPhase].name} phase. Take a deep breath and allow yourself to be present...`);
    } catch (error: any) {
      console.error('Error fetching meditation script:', error);
      // Fallback script
      setCurrentScript(`Welcome to the ${phases[currentPhase].name} phase. Take a deep breath and allow yourself to be present in this moment. Let Tomo guide you through this beautiful journey of self-discovery.`);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        if (newTime >= totalDuration) {
          // Phase complete
          if (currentPhase < phases.length - 1) {
            setCurrentPhase(currentPhase + 1);
            setTimeElapsed(0);
            return 0;
          } else {
            // Meditation complete
            completeSession();
            return newTime;
          }
        }
        
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopTimer();
      setIsPlaying(false);
    } else {
      startTimer();
      setIsPlaying(true);
    }
  };

  const completeSession = async () => {
    setIsPlaying(false);
    stopTimer();

    if (sessionId) {
      try {
        await supabase
          .from('meditation_sessions')
          .update({
            completed: true,
            session_duration: phases.reduce((sum, phase) => sum + phase.duration, 0),
          })
          .eq('id', sessionId);
      } catch (error: any) {
        console.error('Error updating session:', error);
      }
    }

    toast({
      title: "Meditation Complete! ✨",
      description: "You've successfully completed your emotional journey.",
    });

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetMeditation = () => {
    stopTimer();
    setIsPlaying(false);
    setTimeElapsed(0);
    setCurrentPhase(0);
  };

  return (
    <div className={`min-h-screen ${currentPhaseData.color} relative overflow-hidden transition-all duration-1000`}>
      <FloatingBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            
            <Badge className="bg-white/20 text-white border-white/30">
              Phase {currentPhase + 1} of {phases.length}
            </Badge>
          </div>

          {/* Main Player Card */}
          <Card className="card-meditation bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8 space-y-8">
              {/* Phase Info */}
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                
                <h1 className="text-4xl font-bold text-white text-shadow-soft">
                  {currentPhaseData.name}
                </h1>
                
                <p className="text-white/80 text-lg">
                  Phase {currentPhase + 1} • {formatTime(totalDuration - timeElapsed)} remaining
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <Progress 
                  value={progress} 
                  className="h-3 bg-white/20"
                />
                
                <div className="flex justify-between text-sm text-white/70">
                  <span>{formatTime(timeElapsed)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
              </div>

              {/* Meditation Script */}
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                ) : (
                  <p className="text-white/90 text-lg leading-relaxed meditation-text">
                    {currentScript}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={resetMeditation}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={togglePlayPause}
                  className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/30"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={completeSession}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Square className="w-6 h-6" />
                </Button>
              </div>

              {/* Phase Navigator */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  {phases.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentPhase
                          ? 'bg-white scale-125'
                          : index < currentPhase
                          ? 'bg-white/60'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tomo's Presence */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Tomo is with you</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationPlayer;