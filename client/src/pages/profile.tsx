import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TweetCard from "@/components/tweet/tweet-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Link as LinkIcon, Calendar, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { User, TweetWithAuthor } from "@shared/schema";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
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

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/users", username],
    enabled: isAuthenticated && !!username,
  });

  const { data: tweets = [], isLoading: tweetsLoading, error: tweetsError } = useQuery<TweetWithAuthor[]>({
    queryKey: ["/api/users", username, "tweets"],
    enabled: isAuthenticated && !!user,
  });

  const { data: followingStatus, isLoading: followingLoading } = useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/users", user?.id, "following-status"],
    enabled: isAuthenticated && !!user && user.id !== currentUser?.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not found");
      
      if (followingStatus?.isFollowing) {
        await apiRequest("DELETE", `/api/users/${user.id}/follow`);
      } else {
        await apiRequest("POST", `/api/users/${user.id}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "following-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", username] });
      toast({
        title: followingStatus?.isFollowing ? "Unfollowed" : "Followed",
        description: `You ${followingStatus?.isFollowing ? "unfollowed" : "followed"} @${user?.username}`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (userError && isUnauthorizedError(userError as Error)) {
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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <div className="max-w-2xl mx-auto">
              <div className="p-4">
                <Skeleton className="w-full h-48" />
              </div>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64">
            <div className="max-w-2xl mx-auto">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
                <p className="text-gray-600">The user @{username} does not exist.</p>
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

  const isOwnProfile = currentUser?.id === user.id;

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
                <div>
                  <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
                  <p className="text-sm text-gray-500">{user.tweetsCount} tweets</p>
                </div>
              </div>
            </div>

            {/* Profile Header */}
            <div className="relative">
              {/* Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-twitter-blue to-blue-600"></div>
              
              {/* Profile Info */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-16 mb-4">
                  <img
                    src={user.profileImageUrl || `https://i.pravatar.cc/128?u=${user.id}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                  
                  {!isOwnProfile && (
                    <Button
                      onClick={() => followMutation.mutate()}
                      disabled={followingLoading || followMutation.isPending}
                      className={
                        followingStatus?.isFollowing
                          ? "bg-white text-twitter-blue border border-twitter-blue hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                          : "bg-twitter-blue text-white hover:bg-twitter-dark-blue"
                      }
                    >
                      {followMutation.isPending
                        ? "Loading..."
                        : followingStatus?.isFollowing
                        ? "Following"
                        : "Follow"}
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-500">@{user.username}</p>
                  
                  {user.bio && (
                    <p className="text-gray-900">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {user.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-twitter-blue hover:underline"
                        >
                          {user.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex space-x-6 text-sm">
                    <div>
                      <span className="font-bold text-gray-900">{user.followingCount}</span>
                      <span className="text-gray-500 ml-1">Following</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">{user.followersCount}</span>
                      <span className="text-gray-500 ml-1">Followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tweets */}
            <div className="border-t border-twitter-border">
              <div className="divide-y divide-twitter-border">
                {tweetsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
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
                      {isOwnProfile ? "You haven't tweeted yet" : `@${user.username} hasn't tweeted yet`}
                    </h3>
                    <p className="text-gray-600">
                      {isOwnProfile
                        ? "Share your first thought with the world!"
                        : "When they do, their tweets will appear here."}
                    </p>
                  </div>
                ) : (
                  tweets.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
