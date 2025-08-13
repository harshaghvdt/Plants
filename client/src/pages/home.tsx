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
import type { TweetWithAuthor } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tweets = [], isLoading: tweetsLoading, error } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/tweets/timeline"],
    enabled: isAuthenticated,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto flex">
            {/* Timeline */}
            <div className="flex-1 max-w-2xl border-r border-twitter-border">
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-twitter-border px-4 py-3 z-10">
                <h1 className="text-xl font-bold">Home</h1>
              </div>

              {/* Tweet Composer */}
              <TweetComposer />

              {/* Tweet Feed */}
              <div className="divide-y divide-twitter-border">
                {tweetsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex space-x-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="flex space-x-8">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : tweets.length === 0 ? (
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome to Twitter Clone!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your timeline is empty. Follow some users or create your first tweet to get started.
                    </p>
                  </div>
                ) : (
                  tweets.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 p-4 hidden xl:block">
              <SearchBar />
              <TrendingSidebar />
              <WhoToFollow />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
