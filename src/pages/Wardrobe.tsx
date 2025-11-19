import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Session } from "@supabase/supabase-js";
import { Loader2, Upload, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadItemDialog from "@/components/UploadItemDialog";
import { useToast } from "@/hooks/use-toast";
import WardrobeImage from "@/components/WardrobeImage";

const Wardrobe = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDressCode, setSelectedDressCode] = useState("All");
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

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleDelete = async (itemId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/wardrobe/');
      if (urlParts.length > 1) {
        await supabase.storage.from('wardrobe').remove([urlParts[1]]);
      }

      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      
      toast({ title: "Item deleted successfully" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
    }
  };

  const { toast } = useToast();

  const filteredItems = selectedDressCode === "All" 
    ? items 
    : items.filter(item => item.dress_code === selectedDressCode);

  const dressCodes = ["All", ...Array.from(new Set(items.map(item => item.dress_code)))];

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
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl">My Wardrobe</CardTitle>
                <CardDescription>Upload and manage your clothing items</CardDescription>
              </div>
              <Button 
                onClick={() => setUploadDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-6">Start building your virtual wardrobe</p>
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  Upload Your First Item
                </Button>
              </div>
            ) : (
              <Tabs value={selectedDressCode} onValueChange={setSelectedDressCode}>
                <TabsList className="mb-4">
                  {dressCodes.map((code) => (
                    <TabsTrigger key={code} value={code}>
                      {code}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={selectedDressCode}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden group relative">
                        <div className="aspect-square relative">
                          <WardrobeImage 
                            imagePath={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(item.id, item.image_url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-semibold truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {item.dress_code}
                            </span>
                            {item.color && (
                              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadItemDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={fetchItems}
      />
    </div>
  );
};

export default Wardrobe;
