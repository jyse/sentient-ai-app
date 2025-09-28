import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Heart, Zap, Leaf, Sun, Moon, Waves } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FloatingBackground from './FloatingBackground';

interface OnboardingFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

interface MoodOption {
  emoji: string;
  label: string;
  color: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const moodOptions: MoodOption[] = [
  { emoji: '😌', label: 'Calm', color: 'bg-acceptance', description: 'Feeling peaceful and centered', icon: Leaf },
  { emoji: '😊', label: 'Happy', color: 'bg-integration', description: 'Joyful and optimistic', icon: Sun },
  { emoji: '😟', label: 'Anxious', color: 'bg-processing', description: 'Worried or restless', icon: Waves },
  { emoji: '😔', label: 'Sad', color: 'bg-awareness', description: 'Feeling down or melancholy', icon: Moon },
  { emoji: '😤', label: 'Frustrated', color: 'bg-reframing', description: 'Annoyed or stressed', icon: Zap },
  { emoji: '🤔', label: 'Confused', color: 'bg-maintenance', description: 'Uncertain or overwhelmed', icon: Heart },
];

const OnboardingFlow = ({ onComplete, onBack }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [moodText, setMoodText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMoodSelection = (mood: MoodOption) => {
    setSelectedMood(mood);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save mood entry
      const { error: moodError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_text: moodText || selectedMood.description,
          mood_color: selectedMood.color,
          energy_level: 3, // Default to middle
        });

      if (moodError) throw moodError;

      toast({
        title: "Perfect! 🌟",
        description: "Tomo is now preparing a personalized meditation just for you.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving mood:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ambient relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-zen ${step >= 1 ? 'bg-awareness-bright' : 'bg-white/20'}`} />
              <div className={`w-8 h-1 rounded-full transition-zen ${step >= 2 ? 'bg-awareness-bright' : 'bg-white/20'}`} />
              <div className={`w-3 h-3 rounded-full transition-zen ${step >= 2 ? 'bg-awareness-bright' : 'bg-white/20'}`} />
            </div>
          </div>

          {step === 1 && (
            <Card className="card-meditation">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-awareness rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  Hello, beautiful soul 🌸
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  I'm Tomo, your meditation companion. Let's start by understanding how you're feeling right now.
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">How are you feeling today?</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the mood that resonates most with you right now
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.label}
                      variant="ghost"
                      className="h-auto p-6 flex flex-col items-center gap-3 btn-phase group hover:scale-105"
                      onClick={() => handleMoodSelection(mood)}
                    >
                      <div className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center group-hover:animate-pulse-glow transition-zen`}>
                        <mood.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">{mood.emoji}</div>
                        <div className="font-semibold">{mood.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {mood.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedMood && (
            <Card className="card-meditation">
              <CardHeader className="text-center pb-6">
                <div className={`w-20 h-20 ${selectedMood.color} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow`}>
                  <selectedMood.icon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  I hear you feeling{' '}
                  <span className={`bg-gradient-${selectedMood.color.replace('bg-', '')} bg-clip-text text-transparent`}>
                    {selectedMood.label.toLowerCase()}
                  </span>
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  Would you like to share more about what's on your heart?
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell me more about how you're feeling... (optional)"
                    value={moodText}
                    onChange={(e) => setMoodText(e.target.value)}
                    className="min-h-32 bg-card/50 border-white/10 resize-none"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/10">
                      Selected: {selectedMood.emoji} {selectedMood.label}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="btn-phase flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-zen flex-1"
                  >
                    {loading ? (
                      "Creating your meditation..."
                    ) : (
                      <>
                        Create My Meditation
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back Button */}
          <div className="flex justify-center mt-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Welcome
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;