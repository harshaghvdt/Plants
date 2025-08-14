import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Home, 
  User, 
  Search, 
  Plus, 
  Shield, 
  UserCheck, 
  Settings,
  MessageCircle,
  Users,
  PenTool
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import TweetComposer from "@/components/tweet/tweet-composer";

const navigationItems = [
  { 
    href: "/create", 
    icon: PenTool, 
    label: "Create", 
    active: false,
    requiresAuth: true,
    action: "compose"
  },
  { 
    href: "/network", 
    icon: Users, 
    label: "Network", 
    active: false,
    requiresAuth: true,
    action: "navigate"
  },
  { 
    href: "/", 
    icon: Home, 
    label: "Home", 
    active: true,
    requiresAuth: false,
    action: "navigate"
  },
  { 
    href: "/interact", 
    icon: MessageCircle, 
    label: "Interact", 
    active: false,
    requiresAuth: true,
    action: "navigate"
  },
  { 
    href: "/profile", 
    icon: User, 
    label: "Profile", 
    active: false,
    requiresAuth: true,
    action: "navigate"
  },
];

export default function MobileNav() {
  const { isMobile } = useIsMobile();
  const { user } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const isAdmin = user?.phone === '+917753889327';

  if (!isMobile) return null;

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.action === "compose") {
      setIsComposeOpen(true);
    } else if (item.action === "navigate") {
      setActiveTab(item.label);
      window.location.href = item.href;
    }
  };

  const getActiveState = (label: string) => {
    return activeTab === label;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            // Skip auth-required items if user not logged in
            if (item.requiresAuth && !user) return null;
            
            const Icon = item.icon;
            const isActive = getActiveState(item.label);
            
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center p-3 min-w-[60px] min-h-[60px] rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                onClick={() => handleNavigation(item)}
                title={item.label}
              >
                <Icon className={`text-xl mb-1 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Create Post Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <TweetComposer onSuccess={() => setIsComposeOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Quick Actions Menu */}
      <div className="fixed bottom-20 left-4 z-50">
        <div className="space-y-2">
          {/* Verification Quick Action */}
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
              onClick={() => window.location.href = "/verification"}
              title="Verification"
            >
              <UserCheck className="h-5 w-5" />
            </Button>
          )}

          {/* Admin Quick Action (Admin only) */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
              onClick={() => window.location.href = "/admin"}
              title="Admin Dashboard"
            >
              <Shield className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
