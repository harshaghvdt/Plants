import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MessageSquare, Repeat, Heart, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { TweetWithAuthor } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TweetCardProps {
  tweet: TweetWithAuthor;
  showThread?: boolean;
}

export default function TweetCard({ tweet, showThread = false }: TweetCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted || false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweetsCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/tweets/${tweet.id}/like`);
      } else {
        await apiRequest("POST", `/api/tweets/${tweet.id}/like`);
      }
    },
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert optimistic update
      setIsLiked(isLiked);
      setLikesCount(tweet.likesCount);
      
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
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
    },
  });

  const retweetMutation = useMutation({
    mutationFn: async () => {
      if (isRetweeted) {
        await apiRequest("DELETE", `/api/tweets/${tweet.id}/retweet`);
      } else {
        await apiRequest("POST", `/api/tweets/${tweet.id}/retweet`);
      }
    },
    onMutate: () => {
      // Optimistic update
      setIsRetweeted(!isRetweeted);
      setRetweetsCount(prev => isRetweeted ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert optimistic update
      setIsRetweeted(isRetweeted);
      setRetweetsCount(tweet.retweetsCount);
      
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
        description: "Failed to update retweet status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tweets/${tweet.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", tweet.author.username, "tweets"] });
      toast({
        title: "Tweet deleted",
        description: "Your tweet has been deleted successfully.",
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
        description: "Failed to delete tweet",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Tweet by @${tweet.author.username}`,
          text: tweet.content,
          url: `/tweet/${tweet.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/tweet/${tweet.id}`);
        toast({
          title: "Link copied",
          description: "Tweet link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const isOwnTweet = user?.id === tweet.author.id;
  const timeAgo = formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true });

  return (
    <article className="tweet-card p-4 cursor-pointer hover:bg-twitter-light-gray transition-colors">
      <div className="flex space-x-3">
        <Link href={`/${tweet.author.username}`}>
          <img
            src={tweet.author.profileImageUrl || `https://i.pravatar.cc/48?u=${tweet.author.id}`}
            alt="User avatar"
            className="w-12 h-12 rounded-full object-cover hover:opacity-90"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm">
            <Link href={`/${tweet.author.username}`}>
              <span className="font-bold hover:underline">
                {tweet.author.firstName} {tweet.author.lastName}
              </span>
            </Link>
            <Link href={`/${tweet.author.username}`}>
              <span className="text-gray-500 hover:underline">@{tweet.author.username}</span>
            </Link>
            <span className="text-gray-500">·</span>
            <Link href={`/tweet/${tweet.id}`}>
              <span className="text-gray-500 hover:underline">{timeAgo}</span>
            </Link>
            {isOwnTweet && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full p-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="text-red-600"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Tweet"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          <Link href={showThread ? undefined : `/tweet/${tweet.id}`}>
            <p className="mt-2 text-base leading-relaxed">
              {tweet.content}
            </p>
          </Link>
          
          {tweet.imageUrl && (
            <img
              src={tweet.imageUrl}
              alt="Tweet image"
              className="mt-3 rounded-2xl w-full object-cover max-h-80"
            />
          )}
          
          <div className="flex items-center justify-between max-w-md mt-4 text-gray-500">
            <Link href={`/tweet/${tweet.id}`}>
              <button className="flex items-center space-x-2 hover:text-blue-500 group">
                <div className="p-2 rounded-full group-hover:bg-blue-50">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-sm">{tweet.repliesCount}</span>
              </button>
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                retweetMutation.mutate();
              }}
              disabled={retweetMutation.isPending}
              className={`flex items-center space-x-2 hover:text-green-500 group ${
                isRetweeted ? "text-green-500" : ""
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <Repeat className="w-5 h-5" />
              </div>
              <span className="text-sm">{retweetsCount}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                likeMutation.mutate();
              }}
              disabled={likeMutation.isPending}
              className={`flex items-center space-x-2 hover:text-red-500 group ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50">
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </div>
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                handleShare();
              }}
              className="hover:text-blue-500 group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <Share className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
