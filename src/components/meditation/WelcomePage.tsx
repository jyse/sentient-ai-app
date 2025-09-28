import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
import FloatingBackground from './FloatingBackground';

interface WelcomePageProps {
  user: User;
  onStartJourney: () => void;
}

const WelcomePage = ({ user, onStartJourney }: WelcomePageProps) => {
  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'Friend';

  return (
    <div className="min-h-screen bg-gradient-ambient relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-awareness/20 border border-awareness/30 text-awareness-bright">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Emotional Wellness Journey</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-shadow-soft">
              Welcome back,{' '}
              <span className="bg-gradient-awareness bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ready to explore your inner landscape? Let Tomo guide you through 
              a personalized meditation crafted just for your emotional state.
            </p>
          </div>

          {/* Emotional Journey Preview */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'Awareness', color: 'bg-gradient-awareness', description: 'Tune in' },
              { name: 'Acceptance', color: 'bg-gradient-acceptance', description: 'Embrace' },
              { name: 'Processing', color: 'bg-gradient-processing', description: 'Explore' },
              { name: 'Reframing', color: 'bg-gradient-reframing', description: 'Transform' },
              { name: 'Integration', color: 'bg-gradient-integration', description: 'Unify' },
              { name: 'Maintenance', color: 'bg-gradient-maintenance', description: 'Sustain' },
            ].map((phase, index) => (
              <div 
                key={phase.name}
                className="card-zen p-4 text-center transform hover:scale-105 transition-zen"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 ${phase.color} rounded-full mx-auto mb-3 shadow-soft`}></div>
                <h3 className="font-semibold text-sm">{phase.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <Button 
              onClick={onStartJourney}
              size="lg"
              className="btn-zen text-lg px-12 py-6 animate-pulse-glow group"
            >
              <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Begin Your Journey
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Each journey is unique. Tomo will personalize your experience based on how you're feeling today.
            </p>
          </div>
        </div>

        {/* Ambient Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/20 rounded-full animate-float`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;