import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Send,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  Users,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  MapPin,
  Calendar,
  Leaf,
  Globe,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
}

interface Chat {
  id: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    accountType: string;
    isVerified: boolean;
    verificationType?: string;
    location?: string;
    isOnline: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export default function InteractPage() {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: "chat1",
        user: {
          id: "user1",
          username: "garden_guru",
          firstName: "Sarah",
          lastName: "Johnson",
          profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          accountType: "farmer",
          isVerified: true,
          verificationType: "farmer",
          location: "Portland, OR",
          isOnline: true
        },
        lastMessage: {
          id: "msg1",
          content: "Thanks for the tomato growing tips!",
          senderId: "user1",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          type: 'text',
          isRead: false
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: "chat2",
        user: {
          id: "user2",
          username: "plant_scientist",
          firstName: "Dr. Michael",
          lastName: "Chen",
          profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          accountType: "professor_scientist",
          isVerified: true,
          verificationType: "professor_scientist",
          location: "Berkeley, CA",
          isOnline: false
        },
        lastMessage: {
          id: "msg2",
          content: "The research paper is ready for review.",
          senderId: "currentUser",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          type: 'text',
          isRead: true
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ];

    setChats(mockChats);
  }, []);

  // Mock messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      const mockMessages: Message[] = [
        {
          id: "msg1",
          content: "Hi! I have a question about my tomato plants.",
          senderId: "currentUser",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
          type: 'text',
          isRead: true
        },
        {
          id: "msg2",
          content: "Sure! What's the issue you're experiencing?",
          senderId: selectedChat.user.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          type: 'text',
          isRead: true
        },
        {
          id: "msg3",
          content: "The leaves are turning yellow and I'm not sure why.",
          senderId: "currentUser",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          isRead: true
        },
        {
          id: "msg4",
          content: "That sounds like overwatering. How often are you watering them?",
          senderId: selectedChat.user.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          type: 'text',
          isRead: true
        },
        {
          id: "msg5",
          content: "Thanks for the tomato growing tips!",
          senderId: selectedChat.user.id,
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text',
          isRead: false
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [selectedChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      content: messageInput.trim(),
      senderId: "currentUser",
      timestamp: new Date(),
      type: 'text',
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    
    // Update chat's last message
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    ));
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Message sent successfully
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartCall = async (video: boolean = false) => {
    if (!selectedChat) return;
    
    setIsInCall(true);
    setIsVideoOn(video);
    setIsMuted(false);
    
    toast({
      title: "Call Started",
      description: `Starting ${video ? 'video' : 'audio'} call with ${selectedChat.user.firstName}`,
    });
  };

  const handleEndCall = async () => {
    setIsInCall(false);
    setIsVideoOn(false);
    setIsMuted(false);
    
    toast({
      title: "Call Ended",
      description: "Call has been ended.",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
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
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access messaging and calling features.
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
          
          <h1 className="text-lg font-semibold">Interact</h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
        </TabsList>

        {/* Chats Tab */}
        <TabsContent value="chats" className="h-[calc(100vh-200px)]">
          {!selectedChat ? (
            // Chat List View
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat List */}
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <Card 
                    key={chat.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={chat.user.profileImageUrl} />
                            <AvatarFallback>
                              {chat.user.firstName[0]}{chat.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                            chat.user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-sm">
                                {chat.user.firstName} {chat.user.lastName}
                              </h3>
                              {chat.user.isVerified && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {chat.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            {getAccountTypeIcon(chat.user.accountType)}
                            <span className="text-xs text-muted-foreground">
                              {getAccountTypeLabel(chat.user.accountType)}
                            </span>
                          </div>
                          
                          {chat.lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {chat.lastMessage.senderId === "currentUser" ? "You: " : ""}
                              {chat.lastMessage.content}
                            </p>
                          )}
                          
                          {chat.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs mt-1">
                              {chat.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No chats yet. Start connecting with people!</p>
                </div>
              )}
            </div>
          ) : (
            // Chat View
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChat(null)}
                    className="p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedChat.user.profileImageUrl} />
                    <AvatarFallback>
                      {selectedChat.user.firstName[0]}{selectedChat.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedChat.user.firstName} {selectedChat.user.lastName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedChat.user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs text-muted-foreground">
                        {selectedChat.user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartCall(false)}
                    disabled={isInCall}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartCall(true)}
                    disabled={isInCall}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${message.senderId === "currentUser" ? "order-2" : "order-1"}`}>
                      <div className={`rounded-lg px-3 py-2 ${
                        message.senderId === "currentUser"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === "currentUser"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  
                  <Button size="sm" variant="ghost">
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Calls Tab */}
        <TabsContent value="calls" className="p-4">
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Call History</h3>
            <p className="text-muted-foreground mb-4">
              Your call history will appear here.
            </p>
            <Button variant="outline" onClick={() => setActiveTab("chats")}>
              Start a Chat
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call Interface Overlay */}
      {isInCall && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Call Header */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedChat?.user.profileImageUrl} />
                <AvatarFallback>
                  {selectedChat?.user.firstName[0]}{selectedChat?.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-white font-semibold">
                  {selectedChat?.user.firstName} {selectedChat?.user.lastName}
                </h3>
                <p className="text-white/70 text-sm">
                  {isVideoOn ? 'Video Call' : 'Audio Call'}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndCall}
              className="text-white hover:bg-white/20"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Call Content */}
          <div className="flex-1 flex items-center justify-center">
            {isVideoOn ? (
              <div className="text-center">
                <div className="w-64 h-48 bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Video className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-white/70">Video call in progress...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-800 rounded-full mb-4 flex items-center justify-center">
                  <Phone className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-white/70">Audio call in progress...</p>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center space-x-4 p-6">
            <Button
              size="lg"
              variant={isMuted ? "destructive" : "outline"}
              onClick={toggleMute}
              className="w-14 h-14 rounded-full"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            {isVideoOn && (
              <Button
                size="lg"
                variant={isVideoOn ? "outline" : "destructive"}
                onClick={toggleVideo}
                className="w-14 h-14 rounded-full"
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            )}
            
            <Button
              size="lg"
              variant="destructive"
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
