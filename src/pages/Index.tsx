import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, Shirt, Sparkles, Calendar, ShoppingBag, Camera, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch profile when user logs in
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        navigate("/auth");
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen wardrobe-bg wardrobe-texture">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Shirt className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Your Personal Style Assistant</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
            Welcome back, {profile?.full_name || "User"}! 👋
          </h1>
          <p className="text-2xl font-medium text-foreground/80">
            Style Smarter with Your Virtual Wardrobe
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your clothes, create stunning outfits, and get AI-powered suggestions for every occasion. Your digital closet awaits!
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-8">
        <Card className="glass-card shadow-[var(--shadow-elegant)] border-primary/10 animate-in fade-in-50 slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-serif flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-base">Jump right into your wardrobe management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link to="/wardrobe" className="group">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary hover:shadow-[var(--shadow-card)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Upload Items</span>
                </Button>
              </Link>
              <Link to="/outfit-generator?occasion=casual" className="group">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary hover:shadow-[var(--shadow-card)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Shirt className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Casual Outfit</span>
                </Button>
              </Link>
              <Link to="/calendar" className="group">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary hover:shadow-[var(--shadow-card)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Calendar className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Plan Outfit</span>
                </Button>
              </Link>
              <Link to="/shopping" className="group">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary hover:shadow-[var(--shadow-card)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ShoppingBag className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">Shopping</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold font-serif">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">Powerful features to manage your style effortlessly</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card text-center p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-2 group">
            <CardHeader>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shirt className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">Wardrobe Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                Organize your entire wardrobe digitally. Upload photos, categorize items by dress code, season, and color for easy access.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-2 group">
            <CardHeader>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl font-serif">AI Outfit Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                Get personalized outfit suggestions powered by AI. Perfect combinations for any occasion, weather, or mood instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center p-8 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-2 group">
            <CardHeader>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-10 w-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-serif">Calendar Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                Plan your outfits ahead of time. Schedule looks for important events and never repeat the same outfit unnecessarily.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
