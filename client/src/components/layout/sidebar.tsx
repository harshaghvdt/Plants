import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Twitter, Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TweetComposer from "@/components/tweet/tweet-composer";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/explore" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Mail, label: "Messages", href: "/messages" },
    { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
    { icon: User, label: "Profile", href: user ? `/${user.username}` : "/profile" },
    { icon: MoreHorizontal, label: "More", href: "/more" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <div className="w-64 fixed h-full bg-white border-r border-twitter-border px-4 py-4 hidden lg:block">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <Twitter className="text-twitter-blue text-3xl cursor-pointer" />
        </Link>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-full hover:bg-twitter-light-gray transition-colors font-medium text-lg cursor-pointer ${
                active ? "font-bold" : ""
              }`}>
                <Icon className={`text-xl w-6 ${active ? "fill-current" : ""}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Tweet Button */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-twitter-blue text-white rounded-full py-3 mt-6 font-bold text-lg hover:bg-twitter-dark-blue transition-colors">
            Tweet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-0 bg-white">
          <div className="p-4 border-b border-twitter-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Compose Tweet</h2>
          </div>
          <div className="p-4">
            <TweetComposer 
              onSuccess={() => setIsComposeOpen(false)}
              autoFocus={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* User Profile at Bottom */}
      {user && (
        <div className="absolute bottom-4 left-4 right-4">
          <Link href={`/${user.username}`}>
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-twitter-light-gray transition-colors cursor-pointer">
              <img 
                src={user.profileImageUrl || `https://i.pravatar.cc/40?u=${user.id}`}
                alt="User avatar" 
                className="w-10 h-10 rounded-full object-cover" 
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-gray-500 text-sm truncate">@{user.username}</p>
              </div>
              <MoreHorizontal className="text-gray-500 w-5 h-5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
