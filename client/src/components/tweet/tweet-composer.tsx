import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, FileImage, BarChart3, Smile } from "lucide-react";

interface TweetComposerProps {
  replyToId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export default function TweetComposer({ 
  replyToId, 
  placeholder = "What's happening?",
  onSuccess,
  autoFocus = false
}: TweetComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const createTweetMutation = useMutation({
    mutationFn: async (data: { content: string; replyToId?: string }) => {
      return await apiRequest("POST", "/api/tweets", data);
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
      if (replyToId) {
        queryClient.invalidateQueries({ queryKey: ["/api/tweets", replyToId, "replies"] });
      }
      toast({
        title: "Tweet posted!",
        description: "Your tweet has been published successfully.",
      });
      onSuccess?.();
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
        description: "Failed to post tweet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    createTweetMutation.mutate({
      content: content.trim(),
      replyToId,
    });
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20;

  if (!user) return null;

  return (
    <div className="border-b border-twitter-border p-4">
      <div className="flex space-x-3">
        <img
          src={user.profileImageUrl || `https://i.pravatar.cc/48?u=${user.id}`}
          alt="Your avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="resize-none border-none outline-none text-xl placeholder-gray-500 bg-transparent p-0 min-h-[120px] focus-visible:ring-0"
            autoFocus={autoFocus}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4 text-twitter-blue">
              <button className="hover:bg-blue-50 p-2 rounded-full transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="hover:bg-blue-50 p-2 rounded-full transition-colors">
                <FileImage className="w-5 h-5" />
              </button>
              <button className="hover:bg-blue-50 p-2 rounded-full transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="hover:bg-blue-50 p-2 rounded-full transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span 
                className={`text-sm ${
                  isOverLimit 
                    ? "text-red-500" 
                    : isNearLimit 
                    ? "text-yellow-500" 
                    : "text-gray-500"
                }`}
              >
                {remainingChars}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || createTweetMutation.isPending}
                className="bg-twitter-blue text-white px-6 py-2 rounded-full font-bold hover:bg-twitter-dark-blue transition-colors disabled:opacity-50"
              >
                {createTweetMutation.isPending ? "Posting..." : replyToId ? "Reply" : "Tweet"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
