import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Leaf, Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Sprout, TreePine, Flower2, Sun, Camera, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TweetComposer from "@/components/tweet/tweet-composer";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Garden", href: "/", description: "Your plant feed" },
    { icon: Search, label: "Discover", href: "/explore", description: "Find new plants" },
    { icon: TreePine, label: "My Plants", href: "/plants", description: "Your collection" },
    { icon: Bell, label: "Updates", href: "/notifications", description: "Care reminders" },
    { icon: Heart, label: "Favorites", href: "/favorites", description: "Loved posts" },
    { icon: User, label: "Profile", href: user?.id ? `/${user.id}` : "/profile", description: "Your garden profile" },
    { icon: MoreHorizontal, label: "More", href: "/more", description: "Additional options" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <div className="w-64 fixed h-full bg-card border-r border-border px-6 py-6 hidden lg:block">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="plant-icon">
              <Leaf className="h-8 w-8 group-hover:botanical-sway" />
            </div>
            <span className="text-2xl font-bold heading-organic text-foreground">PlantLife</span>
          </div>
        </Link>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center space-x-4 px-4 py-3 rounded-2xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer group ${
                active ? "bg-secondary text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}>
                <Icon className={`w-6 h-6 transition-all duration-200 ${
                  active ? "plant-icon" : "group-hover:text-primary group-hover:scale-110"
                }`} />
                <div className="flex flex-col">
                  <span className="font-medium text-botanical">{item.label}</span>
                  {!active && (
                    <span className="text-xs text-muted-foreground/70 text-botanical">{item.description}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Compose Button */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogTrigger asChild>
          <Button className="w-full nature-button mt-8 py-4 text-lg font-semibold">
            <Sprout className="w-5 h-5 mr-2" />
            Share Plant Care
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-0 bg-card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold heading-organic text-foreground">Share Your Plant Journey</h2>
          </div>
          <div className="p-6">
            <TweetComposer 
              onSuccess={() => setIsComposeOpen(false)}
              autoFocus={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* User Profile Section */}
      {user && (
        <div className="absolute bottom-6 left-6 right-6">
          <Link href={user.id ? `/${user.id}` : "/profile"}>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-secondary/50 transition-all duration-200 cursor-pointer group">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-botanical-gradient flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate heading-organic">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || "Plant Parent"}
                </p>
                <p className="text-xs text-muted-foreground truncate text-botanical">
                  @{user.id || "gardener"}
                </p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="absolute bottom-24 left-6 right-6 space-y-2">
        <div className="text-xs text-muted-foreground mb-3 heading-organic font-medium">Quick Actions</div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl p-2 h-auto hover:bg-leaf-secondary/20 hover:border-leaf-primary/30 transition-all"
            title="Plant ID Help"
          >
            <Camera className="w-4 h-4 text-leaf-primary" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl p-2 h-auto hover:bg-sun-yellow/20 hover:border-sun-yellow/50 transition-all"
            title="Growth Tracker"
          >
            <Sun className="w-4 h-4 text-sun-yellow" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl p-2 h-auto hover:bg-flower-purple/20 hover:border-flower-purple/50 transition-all"
            title="Care Calendar"
          >
            <Flower2 className="w-4 h-4 text-flower-purple" />
          </Button>
        </div>
      </div>
    </div>
  );
}