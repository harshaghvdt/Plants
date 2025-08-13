import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TweetCard from "@/components/tweet/tweet-card";
import TweetComposer from "@/components/tweet/tweet-composer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { TweetWithAuthor } from "@shared/schema";

export default function Tweet() {
  const { id } = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: tweet, isLoading: tweetLoading, error: tweetError } = useQuery<TweetWithAuthor>({
    queryKey: ["/api/tweets", id],
    enabled: isAuthenticated && !!id,
  });

  const { data: replies = [], isLoading: repliesLoading, error: repliesError } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/tweets", id, "replies"],
    enabled: isAuthenticated && !!tweet,
  });

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (tweetError && isUnauthorizedError(tweetError as Error)) {
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

  if (tweetLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <div className="max-w-2xl mx-auto border-r border-twitter-border">
              <div className="p-4">
                <Skeleton className="w-full h-32" />
              </div>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <div className="max-w-2xl mx-auto border-r border-twitter-border">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tweet not found</h2>
                <p className="text-gray-600">This tweet may have been deleted or you don't have permission to view it.</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64">
          <div className="max-w-2xl mx-auto border-r border-twitter-border">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-twitter-border px-4 py-3 z-10">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="rounded-full p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Tweet</h1>
              </div>
            </div>

            {/* Main Tweet */}
            <div className="border-b border-twitter-border">
              <TweetCard tweet={tweet} showThread={true} />
            </div>

            {/* Reply Composer */}
            <div className="border-b border-twitter-border">
              <TweetComposer replyToId={tweet.id} placeholder={`Reply to @${tweet.author.username}`} />
            </div>

            {/* Replies */}
            <div>
              {repliesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border-b border-twitter-border">
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
              ) : replies.length === 0 ? (
                <div className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No replies yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to reply to this tweet!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-twitter-border">
                  {replies.map((reply) => (
                    <TweetCard key={reply.id} tweet={reply} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
