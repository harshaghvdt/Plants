import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Leaf, Sun, Droplets, Sprout, User } from "lucide-react";

interface TweetComposerProps {
  replyToId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export default function TweetComposer({ 
  replyToId, 
  placeholder = "Share your plant care experience...",
  onSuccess,
  autoFocus = false
}: TweetComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; replyToId?: string }) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts/timeline"] });
      if (replyToId) {
        queryClient.invalidateQueries({ queryKey: ["/api/posts", replyToId, "replies"] });
      }
      toast({
        title: "Plant post shared!",
        description: "Your plant care story has been shared with the community.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to share your plant story...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Sharing Failed",
        description: "Unable to share your plant story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    createPostMutation.mutate({
      content: content.trim(),
      replyToId,
    });
  };

  const remainingChars = 500 - content.length; // Increased for plant care posts
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 50;

  return (
    <div className="p-6 border-b border-border bg-card/50">
      <div className="flex space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Your profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-botanical-gradient flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="flex-1">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus={autoFocus}
            className="min-h-[120px] text-lg border-none p-0 resize-none focus:outline-none focus:ring-0 bg-transparent text-botanical placeholder:text-muted-foreground/60"
            style={{ fontSize: '18px' }}
          />

          {/* Plant Care Suggestions */}
          {!content && (
            <div className="mt-4 p-4 bg-accent/30 rounded-xl border border-accent/40">
              <div className="flex items-center space-x-2 mb-3">
                <Leaf className="h-4 w-4 text-leaf-primary" />
                <span className="text-sm font-medium text-muted-foreground heading-organic">Plant Care Ideas</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button 
                  onClick={() => setContent("Just repotted my monstera! The new pot gives it room to grow. Any tips for post-repot care? 🌱")}
                  className="text-left p-2 rounded-lg hover:bg-accent/50 transition-colors text-botanical"
                >
                  Share repotting updates
                </button>
                <button 
                  onClick={() => setContent("My snake plant is thriving in low light! Perfect for beginners who want resilient plants. 🐍🌿")}
                  className="text-left p-2 rounded-lg hover:bg-accent/50 transition-colors text-botanical"
                >
                  Recommend easy plants
                </button>
                <button 
                  onClick={() => setContent("Noticed some brown tips on my pothos leaves. Could it be overwatering or low humidity? Need advice! 💧")}
                  className="text-left p-2 rounded-lg hover:bg-accent/50 transition-colors text-botanical"
                >
                  Ask for help
                </button>
                <button 
                  onClick={() => setContent("Weekly plant check: watered the philodendron, rotated the fiddle leaf fig, and added humidity for the prayer plant! ✅")}
                  className="text-left p-2 rounded-lg hover:bg-accent/50 transition-colors text-botanical"
                >
                  Share care routine
                </button>
              </div>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between mt-4">
            {/* Media and Tools */}
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 hover:bg-accent/50 rounded-full transition-colors group"
                title="Add plant photo"
              >
                <Camera className="w-5 h-5 text-muted-foreground group-hover:text-leaf-primary transition-colors" />
              </button>
              <button 
                className="p-2 hover:bg-accent/50 rounded-full transition-colors group"
                title="Add care tip"
              >
                <Droplets className="w-5 h-5 text-muted-foreground group-hover:text-sky-blue transition-colors" />
              </button>
              <button 
                className="p-2 hover:bg-accent/50 rounded-full transition-colors group"
                title="Track growth"
              >
                <Sun className="w-5 h-5 text-muted-foreground group-hover:text-sun-yellow transition-colors" />
              </button>
            </div>

            {/* Character Count and Post Button */}
            <div className="flex items-center space-x-3">
              {content && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`text-sm ${
                      isOverLimit
                        ? "text-destructive"
                        : isNearLimit
                        ? "text-sun-yellow"
                        : "text-muted-foreground"
                    }`}
                  >
                    {remainingChars}
                  </div>
                  <div className="w-8 h-8 relative">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-border"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="none"
                        strokeWidth="2"
                        strokeDasharray={`${Math.PI * 28}`}
                        strokeDashoffset={`${Math.PI * 28 * (remainingChars / 500)}`}
                        strokeLinecap="round"
                        className={
                          isOverLimit
                            ? "stroke-destructive"
                            : isNearLimit
                            ? "stroke-sun-yellow"
                            : "stroke-primary"
                        }
                      />
                    </svg>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || createPostMutation.isPending}
                className="nature-button"
              >
                {createPostMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4 mr-2" />
                    {replyToId ? "Reply" : "Share"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}