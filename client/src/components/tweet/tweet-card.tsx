import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Heart, Share2, MessageCircle, MoreHorizontal, User, Calendar, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { PostWithAuthor } from "@shared/schema";

interface TweetCardProps {
  tweet: PostWithAuthor;
  showThread?: boolean;
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onReply?: (postId: string) => void;
}

export default function TweetCard({ tweet, showThread = false, onLike, onShare, onReply }: TweetCardProps) {
  const { isMobile } = useIsMobile();
  
  // Initialize state with safe defaults
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isRetweeted, setIsRetweeted] = useState(tweet.isShared || false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);
  const [retweetsCount, setRetweetsCount] = useState(tweet.sharesCount || 0);

  const handleLike = async () => {
    if (!onLike) return;
    
    try {
      await onLike(tweet.id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? (prev as number) - 1 : (prev as number) + 1);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert state on error
      setLikesCount(tweet.likesCount || 0);
    }
  };

  const handleRetweet = async () => {
    if (!onShare) return;
    
    try {
      await onShare(tweet.id);
      setIsRetweeted(!isRetweeted);
      setRetweetsCount(prev => isRetweeted ? (prev as number) - 1 : (prev as number) + 1);
    } catch (error) {
      console.error('Error sharing post:', error);
      // Revert state on error
      setRetweetsCount(tweet.sharesCount || 0);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(tweet.id);
    }
  };

  // Safe date handling
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Unknown date';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const timeAgo = formatDate(tweet.createdAt);

  // Safe navigation
  const handleNavigation = () => {
    if (!showThread) {
      // Navigate to tweet detail
      window.location.href = `/tweet/${tweet.id}`;
    }
  };

  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}>
            <AvatarImage src={tweet.author?.profileImageUrl || ''} alt={tweet.author?.firstName || 'User'} />
            <AvatarFallback>
              {tweet.author?.firstName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                {tweet.author?.firstName} {tweet.author?.lastName}
              </span>
              {tweet.author?.isVerified && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{timeAgo}</span>
          </div>

          {/* Username */}
          <div className="text-gray-500 text-sm mb-2">
            @{tweet.author?.username}
          </div>

          {/* Tweet Content */}
          <div className="text-gray-900 mb-3 leading-relaxed">
            {showThread ? (
              <div>{tweet.content}</div>
            ) : (
              <Link href={`/tweet/${tweet.id}`}>
                <div className="cursor-pointer" onClick={handleNavigation}>
                  {tweet.content}
                </div>
              </Link>
            )}
          </div>

          {/* Image (if any) */}
          {tweet.metadata && (
            <div className="mb-3">
              <img
                src={tweet.metadata}
                alt="Post content"
                className="rounded-lg max-h-96 w-full object-cover"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-md">
            {/* Reply */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReply}
              className={`flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
            >
              <MessageCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span className="text-sm">{tweet.repliesCount || 0}</span>}
            </Button>

            {/* Retweet */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className={`flex items-center space-x-2 text-gray-500 hover:text-green-500 hover:bg-green-50 ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
            >
              <Share2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span className="text-sm">{retweetsCount}</span>}
            </Button>

            {/* Like */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 text-gray-500 hover:text-red-500 hover:bg-red-50 ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
            >
              <Heart className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span className="text-sm">{likesCount}</span>}
            </Button>

            {/* More Options */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-500 hover:text-gray-700 hover:bg-gray-100 ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
            >
              <MoreHorizontal className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
          </div>

          {/* Mobile: Show counts below actions */}
          {isMobile && (
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>{tweet.repliesCount || 0} replies</span>
              <span>{retweetsCount} shares</span>
              <span>{likesCount} likes</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
