import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Search,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  Leaf,
  Globe,
  Shield,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  accountType: string;
  isVerified: boolean;
  verificationType?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
}

interface Connection {
  id: string;
  user: User;
  status: 'pending' | 'connected' | 'requested';
  createdAt: Date;
}

export default function NetworkPage() {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading connections
    const mockConnections: Connection[] = [
      {
        id: "1",
        user: {
          id: "user1",
          username: "garden_guru",
          firstName: "Sarah",
          lastName: "Johnson",
          profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          bio: "Passionate about sustainable gardening and organic farming",
          location: "Portland, OR",
          accountType: "farmer",
          isVerified: true,
          verificationType: "farmer",
          followersCount: 1240,
          followingCount: 890,
          postsCount: 156,
          createdAt: new Date("2023-01-15")
        },
        status: "connected",
        createdAt: new Date("2024-01-20")
      },
      {
        id: "2",
        user: {
          id: "user2",
          username: "plant_scientist",
          firstName: "Dr. Michael",
          lastName: "Chen",
          profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          bio: "Research scientist specializing in plant genetics and climate adaptation",
          location: "Berkeley, CA",
          accountType: "professor_scientist",
          isVerified: true,
          verificationType: "professor_scientist",
          followersCount: 890,
          followingCount: 234,
          postsCount: 89,
          createdAt: new Date("2022-08-10")
        },
        status: "connected",
        createdAt: new Date("2024-02-15")
      }
    ];

    const mockPending: Connection[] = [
      {
        id: "3",
        user: {
          id: "user3",
          username: "eco_student",
          firstName: "Emma",
          lastName: "Rodriguez",
          profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          bio: "Environmental science student learning about sustainable agriculture",
          location: "Austin, TX",
          accountType: "student",
          isVerified: false,
          followersCount: 45,
          followingCount: 67,
          postsCount: 23,
          createdAt: new Date("2024-01-01")
        },
        status: "pending",
        createdAt: new Date("2024-03-01")
      }
    ];

    setConnections(mockConnections);
    setPendingRequests(mockPending);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults: User[] = [
        {
          id: "search1",
          username: "urban_farmer",
          firstName: "Alex",
          lastName: "Thompson",
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          bio: "Urban farming enthusiast growing food in small spaces",
          location: "New York, NY",
          accountType: "enthusiast",
          isVerified: false,
          followersCount: 234,
          followingCount: 189,
          postsCount: 67,
          createdAt: new Date("2023-06-20")
        },
        {
          id: "search2",
          username: "climate_researcher",
          firstName: "Dr. Lisa",
          lastName: "Wang",
          profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          bio: "Climate scientist researching agricultural adaptation strategies",
          location: "Seattle, WA",
          accountType: "professor_scientist",
          isVerified: true,
          verificationType: "professor_scientist",
          followersCount: 567,
          followingCount: 123,
          postsCount: 134,
          createdAt: new Date("2021-12-05")
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Unable to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Move from pending to connections
      const connection = pendingRequests.find(c => c.id === connectionId);
      if (connection) {
        setConnections(prev => [...prev, { ...connection, status: 'connected' as const }]);
        setPendingRequests(prev => prev.filter(c => c.id !== connectionId));
      }
      
      toast({
        title: "Connection Accepted",
        description: "You are now connected!",
      });
    } catch (error) {
      toast({
        title: "Accept Failed",
        description: "Unable to accept connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'farmer':
        return <Leaf className="h-4 w-4 text-green-500" />;
      case 'professor_scientist':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'student':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'enthusiast':
        return <Leaf className="h-4 w-4 text-orange-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccountTypeLabel = (accountType: string) => {
    switch (accountType) {
      case 'farmer':
        return 'Farmer';
      case 'professor_scientist':
        return 'Professor/Scientist';
      case 'student':
        return 'Student';
      case 'enthusiast':
        return 'Enthusiast';
      default:
        return 'User';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access the Network and connect with other users.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
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
          
          <h1 className="text-lg font-semibold">Network</h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex space-x-2">
          <Input
            placeholder="Search for people by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            size="sm"
          >
            {isSearching ? "..." : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="p-4 space-y-4">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          @{user.username}
                        </Badge>
                        {user.isVerified && (
                          <Badge variant="default" className="text-xs bg-blue-500">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        {getAccountTypeIcon(user.accountType)}
                        <span className="text-xs text-muted-foreground">
                          {getAccountTypeLabel(user.accountType)}
                        </span>
                      </div>
                      
                      {user.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                        {user.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {user.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{user.followersCount} followers</span>
                          <span>{user.followingCount} following</span>
                          <span>{user.postsCount} posts</span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleConnect(user.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Search for people to connect with.</p>
            </div>
          )}
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="p-4 space-y-4">
          {connections.length > 0 ? (
            connections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={connection.user.profileImageUrl} />
                      <AvatarFallback>
                        {connection.user.firstName[0]}{connection.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {connection.user.firstName} {connection.user.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          @{connection.user.username}
                        </Badge>
                        <Badge variant="default" className="text-xs bg-green-500">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      
                      {connection.user.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {connection.user.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/profile/${connection.user.username}`}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/interact?user=${connection.user.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/interact?user=${connection.user.id}&call=true`}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No connections yet. Start by searching for people!</p>
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="p-4 space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.user.profileImageUrl} />
                      <AvatarFallback>
                        {request.user.firstName[0]}{request.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          @{request.user.username}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                      
                      {request.user.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {request.user.bio}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/profile/${request.user.username}`}
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending connection requests.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
