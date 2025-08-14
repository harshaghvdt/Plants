import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Smile, 
  MapPin, 
  Calendar, 
  Send,
  AlertTriangle,
  CheckCircle,
  Leaf,
  Globe,
  Info
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import ContentModeration from "@/components/content/content-moderation";
import { validateContent, getContentCategoryDisplay } from "@/utils/content-moderation";

interface TweetComposerProps {
  onSuccess?: () => void;
  replyTo?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export default function TweetComposer({ onSuccess, replyTo, autoFocus = false, placeholder = "What's happening in your garden today?" }: TweetComposerProps) {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [contentValidation, setContentValidation] = useState({
    isValid: false,
    category: 'unrelated' as 'agriculture' | 'environment' | 'unrelated'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate content before submission
    const validation = validateContent(content);
    if (!validation.isValid) {
      toast({
        title: "Content Not Allowed",
        description: validation.reason || "Please ensure your post is related to agriculture or environment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content,
          replyTo,
          category: validation.category,
          metadata: {
            characterCount: content.length,
            hasImages: false,
            isReply: !!replyTo,
            validationScore: validation.confidence
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      toast({
        title: "Post Created!",
        description: `Your ${validation.category} post has been shared successfully.`,
      });

      setContent("");
      setShowModeration(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Post Failed",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Show moderation after user starts typing
    if (newContent.trim().length > 10) {
      setShowModeration(true);
    } else {
      setShowModeration(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent(suggestion);
    setShowModeration(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getCharacterCountColor = () => {
    const count = content.length;
    if (count > 280) return "text-red-500";
    if (count > 250) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const getCategoryIcon = () => {
    switch (contentValidation.category) {
      case 'agriculture':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'environment':
        return <Globe className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Please sign in to create posts.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <Badge variant="outline" className="text-xs">
                  @{user.username}
                </Badge>
                {user.isVerified && (
                  <Badge variant="default" className="text-xs bg-blue-500">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              
              {/* Content Input */}
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={content}
                onChange={handleContentChange}
                className={`min-h-[120px] resize-none border-0 p-0 text-base focus:ring-0 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}
                autoFocus={autoFocus}
                maxLength={280}
              />
            </div>
          </div>

          {/* Content Moderation */}
          {showModeration && (
            <ContentModeration
              content={content}
              onValidationChange={(isValid) => {
                setContentValidation(prev => ({ ...prev, isValid }));
              }}
              showSuggestions={true}
            />
          )}

          {/* Plant Care Suggestions */}
          <div className={`grid gap-2 text-sm ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            <button
              type="button"
              onClick={() => handleSuggestionClick("Just repotted my monstera! The new pot gives it room to grow. Any tips for post-repot care? 🌱")}
              className="text-left p-3 rounded-lg hover:bg-accent/50 transition-colors text-botanical border border-accent/40 hover:border-accent/60"
            >
              Share repotting updates
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick("My tomato plants are flowering! Should I remove the first flowers for better growth? 🍅")}
              className="text-left p-3 rounded-lg hover:bg-accent/50 transition-colors text-botanical border border-accent/40 hover:border-accent/60"
            >
              Ask gardening questions
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick("Started composting kitchen waste. The soil quality improvement is amazing! ♻️")}
              className="text-left p-3 rounded-lg hover:bg-accent/50 transition-colors text-botanical border border-accent/40 hover:border-accent/60"
            >
              Share sustainability wins
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick("The bees are loving my wildflower garden! Supporting pollinators one flower at a time 🐝")}
              className="text-left p-3 rounded-lg hover:bg-accent/50 transition-colors text-botanical border border-accent/40 hover:border-accent/60"
            >
              Celebrate wildlife success
            </button>
          </div>

          {/* Actions Row */}
          <div className={`flex items-center justify-between ${
            isMobile ? 'flex-col space-y-3' : 'flex-row'
          }`}>
            {/* Media Tools */}
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 hover:bg-accent/50 ${
                  isMobile ? 'p-3' : 'p-2'
                }`}
              >
                <Image className="w-5 h-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  // Handle image upload
                  console.log('Images selected:', e.target.files);
                }}
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-accent/50 ${
                  isMobile ? 'p-3' : 'p-2'
                }`}
              >
                <Smile className="w-5 h-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-accent/50 ${
                  isMobile ? 'p-3' : 'p-2'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-accent/50 ${
                  isMobile ? 'p-3' : 'p-2'
                }`}
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </div>

            {/* Submit Section */}
            <div className={`flex items-center space-x-3 ${
              isMobile ? 'w-full' : ''
            }`}>
              {/* Character Count */}
              <div className="flex items-center space-x-2 text-sm">
                <span className={getCharacterCountColor()}>
                  {content.length}/280
                </span>
                {contentValidation.category !== 'unrelated' && (
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon()}
                    <span className="text-xs text-muted-foreground">
                      {getContentCategoryDisplay(contentValidation.category)}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim() || !contentValidation.isValid}
                className={`bg-primary hover:bg-primary/90 ${
                  isMobile ? 'w-full' : ''
                }`}
              >
                {isSubmitting ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {replyTo ? "Reply" : "Post"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Guidelines Reminder */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Remember: Keep posts focused on agriculture and environment!</p>
                <p>Share your plant care experiences, gardening tips, environmental thoughts, or sustainability practices. Avoid unrelated topics like politics, entertainment, or personal drama.</p>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}