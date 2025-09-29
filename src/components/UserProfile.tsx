import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User2, 
  Settings, 
  Heart, 
  Calendar, 
  TrendingUp,
  LogOut,
  Save,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FloatingBackground from './FloatingBackground';

interface UserProfileProps {
  onBack: () => void;
  onBackToWelcome: () => void;
}

const UserProfile = ({ onBack, onBackToWelcome }: UserProfileProps) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      setUser(authUser);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      setProfile(profileData);

      // Fetch preferences
      const { data: preferencesData } = await supabase
        .from('meditation_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      setPreferences(preferencesData);

      // Fetch recent sessions
      const { data: sessionsData } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setSessions(sessionsData || []);

      // Fetch recent moods
      const { data: moodsData } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(7);

      setMoods(moodsData || []);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('meditation_preferences')
        .update({
          voice_style: preferences.voice_style,
          color_tone: preferences.color_tone,
          music_preference: preferences.music_preference,
          meditation_type: preferences.meditation_type,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences saved! ✨",
        description: "Your meditation experience will be personalized accordingly.",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "May peace be with you until we meet again.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  return (
    <div className="min-h-screen bg-gradient-ambient relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-awareness rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
              <User2 className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-shadow-soft">
              {profile?.name || user?.email?.split('@')[0] || 'Mindful Soul'}
            </h1>
            
            <p className="text-muted-foreground">
              {user?.email}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meditation Stats */}
            <Card className="card-zen">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Meditation Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-awareness/10 rounded-xl">
                    <div className="text-2xl font-bold text-awareness-bright">
                      {sessions.filter(s => s.completed).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Sessions Complete</div>
                  </div>
                  
                  <div className="text-center p-4 bg-integration/10 rounded-xl">
                    <div className="text-2xl font-bold text-integration-bright">
                      {Math.round(sessions.reduce((sum, s) => sum + (s.session_duration || 0), 0) / 60)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Minutes</div>
                  </div>
                </div>
                
                {/* Recent Sessions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recent Sessions</h4>
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(session.created_at)}</span>
                      </div>
                      <Badge variant={session.completed ? "default" : "secondary"}>
                        {session.completed ? "Complete" : "Incomplete"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="card-zen">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Meditation Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="voice-style">Voice Style</Label>
                    <Select 
                      value={preferences?.voice_style || 'calm'} 
                      onValueChange={(value) => setPreferences({ ...preferences, voice_style: value })}
                    >
                      <SelectTrigger className="bg-card/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calm">Calm & Soothing</SelectItem>
                        <SelectItem value="energetic">Uplifting & Energetic</SelectItem>
                        <SelectItem value="neutral">Neutral & Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color-tone">Color Preference</Label>
                    <Select 
                      value={preferences?.color_tone || 'balanced'} 
                      onValueChange={(value) => setPreferences({ ...preferences, color_tone: value })}
                    >
                      <SelectTrigger className="bg-card/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cool">Cool Tones (Blues/Purples)</SelectItem>
                        <SelectItem value="warm">Warm Tones (Oranges/Yellows)</SelectItem>
                        <SelectItem value="balanced">Balanced Spectrum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="meditation-type">Meditation Style</Label>
                    <Select 
                      value={preferences?.meditation_type || 'neutral'} 
                      onValueChange={(value) => setPreferences({ ...preferences, meditation_type: value })}
                    >
                      <SelectTrigger className="bg-card/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calm">Calming & Relaxing</SelectItem>
                        <SelectItem value="neutral">Balanced & Centered</SelectItem>
                        <SelectItem value="energizing">Energizing & Uplifting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full btn-zen"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Moods */}
          <Card className="card-zen">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Recent Emotional Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {moods.map((mood) => (
                  <div key={mood.id} className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(mood.created_at)}
                    </div>
                    <div className="text-sm font-medium truncate">
                      {mood.mood_text || 'Reflection'}
                    </div>
                  </div>
                ))}
              </div>
              
              {moods.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Start your first meditation to begin tracking your emotional journey.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;