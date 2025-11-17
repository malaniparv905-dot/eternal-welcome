import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, ShoppingBag, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Shopping = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
    });

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

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data: items } = await supabase
        .from("wardrobe_items")
        .select("*");

      // Mock shopping suggestions based on wardrobe analysis
      const mockSuggestions = [
        {
          id: 1,
          name: "Classic White Sneakers",
          category: "Shoes",
          reason: "Perfect match for your casual wardrobe",
          price: "$79.99",
          link: "https://example.com"
        },
        {
          id: 2,
          name: "Leather Belt",
          category: "Accessories",
          reason: "Complete your formal outfits",
          price: "$45.00",
          link: "https://example.com"
        },
        {
          id: 3,
          name: "Denim Jacket",
          category: "Outerwear",
          reason: "Versatile piece for layering",
          price: "$89.99",
          link: "https://example.com"
        }
      ];

      setSuggestions(mockSuggestions);
      toast({ title: "Suggestions generated!" });
    } catch (error: any) {
      toast({
        title: "Failed to generate suggestions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateSuggestions();
    }
  }, [user]);

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
      
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-[var(--shadow-elegant)] border-border/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <ShoppingBag className="h-8 w-8" />
                  Shopping Suggestions
                </CardTitle>
                <CardDescription>Personalized recommendations based on your wardrobe</CardDescription>
              </div>
              <Button 
                onClick={generateSuggestions}
                disabled={loadingSuggestions}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {loadingSuggestions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSuggestions ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                      <p className="text-sm mb-3 italic">"{item.reason}"</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">{item.price}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            View <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shopping;
