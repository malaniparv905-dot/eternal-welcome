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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar user={user} profile={profile} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-700">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || "User"}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Style Smarter with Your Virtual Wardrobe
          </p>
          <p className="text-lg text-muted-foreground">
            Upload your clothes, create outfits, and get AI-powered suggestions for every occasion.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-8">
        <Card className="shadow-[var(--shadow-elegant)] border-border/50 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump right into your wardrobe management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link to="/wardrobe">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Upload Items</span>
                </Button>
              </Link>
              <Link to="/outfit-generator?occasion=casual">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <Shirt className="h-6 w-6" />
                  <span className="text-xs">Casual Outfit</span>
                </Button>
              </Link>
              <Link to="/outfit-generator?occasion=business">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <span className="text-2xl">💼</span>
                  <span className="text-xs">Business</span>
                </Button>
              </Link>
              <Link to="/outfit-generator?occasion=date">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <span className="text-2xl">💑</span>
                  <span className="text-xs">Date Night</span>
                </Button>
              </Link>
              <Link to="/calendar">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-xs">Plan Outfit</span>
                </Button>
              </Link>
              <Link to="/shopping">
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <ShoppingBag className="h-6 w-6" />
                  <span className="text-xs">Shopping</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Shirt className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Wardrobe Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Organize and categorize your clothes with ease. Upload photos, add tags, and keep track of your entire wardrobe.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 hover:border-secondary/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-secondary">AI Outfit Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Get personalized outfit suggestions powered by AI. Perfect combinations for any occasion or weather.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 hover:border-accent/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-accent">Calendar Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Plan your outfits in advance. Schedule looks for upcoming events and never repeat the same outfit.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
