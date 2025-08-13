import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { User } from "@shared/schema";

export default function WhoToFollow() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: suggestions = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/suggestions"],
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/suggestions"] });
      toast({
        title: "Followed",
        description: "You are now following this user",
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
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <Card className="bg-twitter-light-gray border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            ))
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No suggestions available</p>
            </div>
          ) : (
            suggestions.map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center justify-between p-4 hover:bg-gray-200 transition-colors">
                <div className="flex items-center space-x-3">
                  <Link href={`/${suggestedUser.username}`}>
                    <img
                      src={suggestedUser.profileImageUrl || `https://i.pravatar.cc/40?u=${suggestedUser.id}`}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover hover:opacity-90"
                    />
                  </Link>
                  <div>
                    <Link href={`/${suggestedUser.username}`}>
                      <p className="font-bold text-sm hover:underline cursor-pointer">
                        {suggestedUser.firstName} {suggestedUser.lastName}
                      </p>
                    </Link>
                    <p className="text-gray-500 text-sm">@{suggestedUser.username}</p>
                  </div>
                </div>
                <Button
                  onClick={() => followMutation.mutate(suggestedUser.id)}
                  disabled={followMutation.isPending}
                  className="bg-twitter-dark-gray text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                  {followMutation.isPending ? "..." : "Follow"}
                </Button>
              </div>
            ))
          )}
          {suggestions.length > 0 && (
            <div className="p-4">
              <button className="text-twitter-blue hover:underline text-sm">
                Show more
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
