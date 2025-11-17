import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, Calendar as CalendarIcon, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const CalendarPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledOutfits, setScheduledOutfits] = useState<any[]>([]);
  const navigate = useNavigate();

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

  const fetchScheduledOutfits = async () => {
    try {
      const { data, error } = await supabase
        .from("outfits")
        .select("*")
        .not("scheduled_date", "is", null)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setScheduledOutfits(data || []);
    } catch (error) {
      console.error("Error fetching outfits:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchScheduledOutfits();
    }
  }, [user]);

  const outfitsForSelectedDate = scheduledOutfits.filter(
    outfit => outfit.scheduled_date === format(selectedDate || new Date(), 'yyyy-MM-dd')
  );

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
            <CardTitle className="text-3xl flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Outfit Calendar
            </CardTitle>
            <CardDescription>Plan your outfits ahead of time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
                
                {outfitsForSelectedDate.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No outfits scheduled for this day</p>
                    <Button 
                      onClick={() => navigate("/outfit-generator")}
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Outfit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outfitsForSelectedDate.map((outfit) => (
                      <Card key={outfit.id}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold">{outfit.name}</h4>
                          <p className="text-sm text-muted-foreground">{outfit.occasion}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
