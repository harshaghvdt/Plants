import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Twitter, Users, MessageSquare, Heart, Repeat, Search } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Twitter className="h-8 w-8 text-twitter-blue" />
              <span className="text-xl font-bold text-gray-900">Twitter Clone</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-twitter-blue hover:bg-twitter-dark-blue text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                What's happening in your world?
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join millions of people sharing their thoughts, connecting with others, and staying updated on the topics that matter to you.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full sm:w-auto bg-twitter-blue hover:bg-twitter-dark-blue text-white px-8 py-3"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-twitter-blue text-twitter-blue hover:bg-twitter-blue hover:text-white px-8 py-3"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <MessageSquare className="h-8 w-8 text-twitter-blue mb-4" />
                    <h3 className="font-semibold mb-2">Share Your Thoughts</h3>
                    <p className="text-sm text-gray-600">Express yourself in 280 characters or less</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow mt-8">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-twitter-blue mb-4" />
                    <h3 className="font-semibold mb-2">Connect with People</h3>
                    <p className="text-sm text-gray-600">Follow friends and discover new voices</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow -mt-4">
                  <CardContent className="p-6">
                    <Heart className="h-8 w-8 text-twitter-blue mb-4" />
                    <h3 className="font-semibold mb-2">Engage & React</h3>
                    <p className="text-sm text-gray-600">Like, retweet, and reply to conversations</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow mt-4">
                  <CardContent className="p-6">
                    <Search className="h-8 w-8 text-twitter-blue mb-4" />
                    <h3 className="font-semibold mb-2">Stay Informed</h3>
                    <p className="text-sm text-gray-600">Follow trending topics and breaking news</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to connect
            </h2>
            <p className="text-xl text-gray-600">
              Simple, powerful tools to help you share and discover
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-twitter-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                See new tweets instantly as they're posted, with live updates across all devices.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Repeat className="h-8 w-8 text-twitter-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Retweet</h3>
              <p className="text-gray-600">
                Amplify voices that matter to you by retweeting and sharing conversations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-twitter-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
              <p className="text-gray-600">
                Follow interesting people and discover new perspectives from around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-twitter-blue">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join the conversation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sign up today and start connecting with people who share your interests.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-twitter-blue hover:bg-gray-100 px-8 py-3"
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center space-x-2">
            <Twitter className="h-6 w-6 text-twitter-blue" />
            <span className="text-gray-600">Twitter Clone - Connect with the world</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
