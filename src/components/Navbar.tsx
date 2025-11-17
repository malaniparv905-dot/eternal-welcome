import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
  profile: { full_name: string } | null;
}

const Navbar = ({ user, profile }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              Virtual<span className="text-primary">Wardrobe</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/wardrobe" className="text-sm font-medium transition-colors hover:text-primary">
              My Wardrobe
            </Link>
            <Link to="/outfit-generator" className="text-sm font-medium transition-colors hover:text-primary">
              Outfit Generator
            </Link>
            <Link to="/calendar" className="text-sm font-medium transition-colors hover:text-primary">
              Calendar
            </Link>
            <Link to="/shopping" className="text-sm font-medium transition-colors hover:text-primary">
              Shopping
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{profile?.full_name || user?.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
