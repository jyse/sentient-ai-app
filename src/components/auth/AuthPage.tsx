import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Sparkles, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import FloatingBackground from '@/components/meditation/FloatingBackground';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (
    event: React.FormEvent<HTMLFormElement>, 
    isSignUp: boolean
  ) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const validationData = isSignUp 
        ? { email, password, name }
        : { email, password };
      
      authSchema.parse(validationData);

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Welcome to your meditation journey! 🌸",
          description: "Your account has been created. You can now begin exploring your inner landscape with Tomo.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back! ✨",
          description: "Ready to continue your emotional wellness journey?",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.name === 'ZodError') {
        toast({
          title: "Please check your input",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? "Signup failed" : "Login failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ambient relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-awareness/20 border border-awareness/30 text-awareness-bright mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Mindful Meditation</span>
            </div>
            
            <h1 className="text-4xl font-bold text-shadow-soft mb-2">
              Welcome to{' '}
              <span className="bg-gradient-awareness bg-clip-text text-transparent">
                Serenity
              </span>
            </h1>
            
            <p className="text-muted-foreground">
              Your personal AI companion for emotional wellness
            </p>
          </div>

          {/* Auth Form */}
          <Card className="card-zen border-white/10">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-awareness rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-awareness/20">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-awareness/20">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="bg-card/50 border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          className="bg-card/50 border-white/10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full btn-zen mt-6" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        required
                        className="bg-card/50 border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="bg-card/50 border-white/10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a secure password"
                          required
                          className="bg-card/50 border-white/10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full btn-zen mt-6" 
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Begin Journey"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to embark on a journey of self-discovery and emotional wellness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;