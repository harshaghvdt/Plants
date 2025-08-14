import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  PenTool,
  Leaf,
  Globe,
  Lightbulb,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import TweetComposer from "@/components/tweet/tweet-composer";

export default function CreatePage() {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const [showComposer, setShowComposer] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to create new posts.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showComposer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComposer(false)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <h1 className="text-lg font-semibold">Create Post</h1>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        <div className="p-4">
          <TweetComposer onSuccess={() => setShowComposer(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-semibold">Create</h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Share Your Story</CardTitle>
            <CardDescription>
              Create engaging posts about agriculture, gardening, or environmental topics
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4">
          <Button
            size="lg"
            onClick={() => setShowComposer(true)}
            className="h-16 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Start Writing
          </Button>
        </div>

        {/* Content Ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Content Ideas</span>
            </CardTitle>
            <CardDescription>
              Get inspired with these agriculture and environment topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Plant Care Tips</h4>
                <p className="text-sm text-green-700">Share your gardening knowledge and experiences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Environmental Updates</h4>
                <p className="text-sm text-blue-700">Discuss climate, sustainability, and conservation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <PenTool className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-purple-800">Farming Stories</h4>
                <p className="text-sm text-purple-700">Share your agricultural journey and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Content Guidelines</CardTitle>
            <CardDescription className="text-blue-700">
              Keep your posts focused and engaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">✅</span>
              <span>Focus on agriculture, gardening, or environmental topics</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">✅</span>
              <span>Share personal experiences and practical tips</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">✅</span>
              <span>Include photos when possible to make posts engaging</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">✅</span>
              <span>Ask questions to encourage community interaction</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
