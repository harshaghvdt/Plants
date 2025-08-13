import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TweetComposer from "@/components/tweet/tweet-composer";
import TweetCard from "@/components/tweet/tweet-card";
import SearchBar from "@/components/ui/search-bar";
import TrendingSidebar from "@/components/ui/trending-sidebar";
import WhoToFollow from "@/components/ui/who-to-follow";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Sprout, Sun, Droplets, TreePine } from "lucide-react";
import type { PostWithAuthor } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your plant garden...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: posts = [], isLoading: postsLoading, error } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/timeline"],
    enabled: isAuthenticated,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Session Expired",
      description: "Your garden session has expired. Please sign in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="botanical-bloom">
            <Leaf className="h-16 w-16 text-leaf-primary mx-auto" />
          </div>
          <p className="text-muted-foreground text-botanical">Growing your plant community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto flex">
            {/* Plant Feed Timeline */}
            <div className="flex-1 max-w-2xl border-r border-border">
              {/* Header */}
              <div className="sticky top-0 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4 z-10">
                <div className="flex items-center space-x-3">
                  <Sprout className="h-6 w-6 text-leaf-primary botanical-sway" />
                  <h1 className="text-xl font-bold heading-organic text-foreground">Your Garden</h1>
                </div>
                <p className="text-sm text-muted-foreground text-botanical mt-1">
                  Share and discover plant care stories
                </p>
              </div>

              {/* Plant Care Composer */}
              <div className="border-b border-border bg-card/30">
                <TweetComposer />
              </div>

              {/* Daily Plant Tips */}
              <div className="p-6 border-b border-border bg-gradient-to-r from-leaf-secondary/20 to-sun-yellow/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Sun className="h-5 w-5 text-sun-yellow" />
                  <span className="font-semibold text-sm heading-organic text-foreground">Today's Plant Tip</span>
                </div>
                <p className="text-sm text-muted-foreground text-botanical">
                  Most houseplants prefer bright, indirect light. Place them near a window with sheer curtains for optimal growth! 🌱
                </p>
              </div>

              {/* Plant Care Feed */}
              <div className="space-y-0">
                {postsLoading ? (
                  // Loading skeleton with botanical theme
                  <div className="space-y-4 p-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-3 botanical-grow" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex space-x-3">
                          <Skeleton className="h-12 w-12 rounded-full bg-leaf-secondary/20" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32 bg-leaf-secondary/20" />
                            <Skeleton className="h-3 w-24 bg-muted/50" />
                          </div>
                        </div>
                        <Skeleton className="h-20 w-full bg-accent/30" />
                        <div className="flex space-x-6">
                          <Skeleton className="h-4 w-16 bg-muted/50" />
                          <Skeleton className="h-4 w-16 bg-muted/50" />
                          <Skeleton className="h-4 w-16 bg-muted/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <TweetCard key={post.id} tweet={post} />
                  ))
                ) : (
                  <div className="p-12 text-center space-y-6">
                    <div className="botanical-bloom">
                      <TreePine className="h-20 w-20 text-leaf-secondary mx-auto" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold heading-organic text-foreground">
                        Your Garden is Ready to Grow!
                      </h3>
                      <p className="text-muted-foreground text-botanical max-w-md mx-auto">
                        Start sharing your plant journey. Post care tips, progress photos, 
                        or ask the community for advice on your green companions.
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-4 w-4 text-leaf-primary" />
                        <span className="text-botanical">Share experiences</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-sky-blue" />
                        <span className="text-botanical">Get care advice</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-sun-yellow" />
                        <span className="text-botanical">Track growth</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Plant Discovery */}
            <div className="hidden xl:block w-80 p-6 space-y-6">
              <SearchBar placeholder="Search plants, care tips..." />
              
              {/* Plant Care Reminders */}
              <div className="post-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Droplets className="h-5 w-5 text-sky-blue" />
                  <h3 className="font-semibold heading-organic text-foreground">Care Reminders</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-botanical">Water Pothos</span>
                    <span className="text-muted-foreground">Today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-botanical">Fertilize Monstera</span>
                    <span className="text-muted-foreground">Tomorrow</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-botanical">Repot Snake Plant</span>
                    <span className="text-muted-foreground">This week</span>
                  </div>
                </div>
              </div>

              <TrendingSidebar />
              <WhoToFollow />
              
              {/* Plant ID Help */}
              <div className="post-card">
                <div className="flex items-center space-x-2 mb-4">
                  <Leaf className="h-5 w-5 text-leaf-primary" />
                  <h3 className="font-semibold heading-organic text-foreground">Need Plant ID?</h3>
                </div>
                <p className="text-sm text-muted-foreground text-botanical mb-4">
                  Can't identify a plant? Share a photo and our community will help!
                </p>
                <button className="text-sm text-primary font-medium hover:underline text-botanical">
                  Ask the Community →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}