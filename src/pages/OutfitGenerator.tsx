import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const OutfitGenerator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState("Casual");
  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
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

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*");

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const generateOutfit = async () => {
    if (items.length < 3) {
      toast({
        title: "Not enough items",
        description: "Add at least 3 items to your wardrobe first",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-outfit', {
        body: { items, occasion: selectedOccasion }
      });

      if (error) throw error;

      setGeneratedOutfit(data);
      
      // Save outfit to database
      await supabase.from('outfits').insert({
        user_id: user?.id,
        name: `${selectedOccasion} Outfit`,
        occasion: selectedOccasion,
        items: data.outfit,
        ai_generated: true
      });

      toast({ title: "Outfit generated successfully!" });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
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
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-secondary" />
              AI Outfit Generator
            </CardTitle>
            <CardDescription>Get personalized outfit suggestions powered by AI</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length < 3 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Upload More Items</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  You need at least 3 items in your wardrobe to generate outfits
                </p>
                <Button 
                  onClick={() => navigate("/wardrobe")}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  Go to Wardrobe
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-w-md mx-auto">
                  <Label htmlFor="occasion">Select Occasion</Label>
                  <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Party">Party</SelectItem>
                      <SelectItem value="Athletic">Athletic</SelectItem>
                      <SelectItem value="Date Night">Date Night</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={generateOutfit}
                    disabled={generating}
                    className="w-full mt-4 bg-gradient-to-r from-primary to-secondary"
                  >
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {generating ? "Generating..." : "Generate Outfit"}
                  </Button>
                </div>

                {generatedOutfit && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">Your Perfect Outfit</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {generatedOutfit.outfit.map((itemId: string) => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) return null;
                        return (
                          <Card key={item.id} className="overflow-hidden">
                            <div className="aspect-square">
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Why This Works</h4>
                          <p className="text-sm text-muted-foreground">{generatedOutfit.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Styling Tips</h4>
                          <p className="text-sm text-muted-foreground">{generatedOutfit.styling_tips}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={generateOutfit}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Another Outfit
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OutfitGenerator;
