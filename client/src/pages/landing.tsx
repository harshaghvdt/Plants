import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Users, MessageSquare, Heart, Share, Search, Sprout, TreePine, Flower, Sun, Phone, User, GraduationCap, LeafIcon, UserCheck } from "lucide-react";
import { useSendOTP, useVerifyLoginOTP, useVerifyRegistrationOTP } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState("");
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');

  const { toast } = useToast();
  const sendOTPMutation = useSendOTP();
  const verifyLoginMutation = useVerifyLoginOTP();
  const verifyRegistrationMutation = useVerifyRegistrationOTP();

  const handleSendOTP = async (isRegistration = false) => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    await sendOTPMutation.mutateAsync({ phone });
    setStep('otp');
  };

  const handleVerifyOTP = async (isRegistration = false) => {
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP sent to your phone",
        variant: "destructive",
      });
      return;
    }

    if (isRegistration) {
      setStep('details');
    } else {
      await verifyLoginMutation.mutateAsync({ phone, otp });
      setIsLoginOpen(false);
      setStep('phone');
      setPhone("");
      setOtp("");
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !username || !accountType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await verifyRegistrationMutation.mutateAsync({
      phone,
      otp,
      firstName,
      lastName,
      username,
      accountType,
    });

    setIsRegisterOpen(false);
    setStep('phone');
    setPhone("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setUsername("");
    setAccountType("");
  };

  const resetForm = () => {
    setStep('phone');
    setPhone("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setUsername("");
    setAccountType("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-secondary/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-leaf-secondary/20 botanical-sway">
          <Leaf size={80} />
        </div>
        <div className="absolute top-32 right-20 text-flower-purple/20 botanical-bloom">
          <Flower size={60} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-leaf-primary/20 botanical-rustle">
          <TreePine size={100} />
        </div>
        <div className="absolute bottom-32 right-10 text-sun-yellow/30">
          <Sun size={70} />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="plant-icon">
                <Leaf className="h-8 w-8" />
              </div>
              <span className="text-xl font-bold heading-organic text-foreground">PlantLife</span>
            </div>
            <div className="flex space-x-3">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Sign In to PlantLife</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {step === 'phone' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="login-phone">Phone Number</Label>
                          <Input
                            id="login-phone"
                            type="tel"
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          onClick={() => handleSendOTP(false)}
                          disabled={sendOTPMutation.isPending}
                          className="w-full"
                        >
                          {sendOTPMutation.isPending ? "Sending..." : "Send OTP"}
                        </Button>
                      </div>
                    )}
                    
                    {step === 'otp' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="login-otp">OTP Code</Label>
                          <Input
                            id="login-otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="mt-1"
                            maxLength={6}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => setStep('phone')}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button 
                            onClick={() => handleVerifyOTP(false)}
                            disabled={verifyLoginMutation.isPending}
                            className="flex-1"
                          >
                            {verifyLoginMutation.isPending ? "Verifying..." : "Verify & Sign In"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={resetForm}
                    className="nature-button"
                  >
                    <Sprout className="h-4 w-4 mr-2" />
                    Join Garden
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Join PlantLife Community</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {step === 'phone' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="register-phone">Phone Number</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          onClick={() => handleSendOTP(true)}
                          disabled={sendOTPMutation.isPending}
                          className="w-full"
                        >
                          {sendOTPMutation.isPending ? "Sending..." : "Send OTP"}
                        </Button>
                      </div>
                    )}
                    
                    {step === 'otp' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="register-otp">OTP Code</Label>
                          <Input
                            id="register-otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="mt-1"
                            maxLength={6}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => setStep('phone')}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button 
                            onClick={() => handleVerifyOTP(true)}
                            disabled={verifyRegistrationMutation.isPending}
                            className="flex-1"
                          >
                            {verifyRegistrationMutation.isPending ? "Verifying..." : "Verify OTP"}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {step === 'details' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1"
                            placeholder="Choose a unique username"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="accountType">Account Type</Label>
                          <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select your account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">
                                <div className="flex items-center space-x-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Student</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="farmer">
                                <div className="flex items-center space-x-2">
                                  <LeafIcon className="h-4 w-4" />
                                  <span>Farmer</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="enthusiast">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4" />
                                  <span>Plant Enthusiast</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="professor_scientist">
                                <div className="flex items-center space-x-2">
                                  <UserCheck className="h-4 w-4" />
                                  <span>Professor/Scientist</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => setStep('otp')}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button 
                            onClick={handleRegister}
                            disabled={verifyRegistrationMutation.isPending}
                            className="flex-1"
                          >
                            {verifyRegistrationMutation.isPending ? "Creating Account..." : "Create Account"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 relative">
              <h1 className="text-4xl lg:text-6xl font-bold heading-organic text-foreground mb-6">
                Grow Your Plant Community
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-botanical">
                Connect with fellow plant enthusiasts, share your green victories, and cultivate knowledge together. 
                Join a thriving community where every leaf tells a story.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <Button 
                  size="lg"
                  onClick={() => setIsRegisterOpen(true)}
                  className="nature-button w-full sm:w-auto px-8 py-4"
                >
                  <Sprout className="w-5 h-5 mr-2" />
                  Start Growing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-full"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Plants
                </Button>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <Card className="post-card botanical-bloom">
                  <CardContent className="p-6">
                    <MessageSquare className="h-10 w-10 text-leaf-primary mb-4 plant-icon" />
                    <h3 className="font-semibold mb-2 heading-organic text-lg">Share Plant Care</h3>
                    <p className="text-sm text-muted-foreground text-botanical">Post your plant care tips, progress photos, and growing experiences</p>
                  </CardContent>
                </Card>
                
                <Card className="post-card botanical-bloom mt-8" style={{ animationDelay: '0.2s' }}>
                  <CardContent className="p-6">
                    <Users className="h-10 w-10 text-earth-brown mb-4 plant-icon" />
                    <h3 className="font-semibold mb-2 heading-organic text-lg">Connect Gardeners</h3>
                    <p className="text-sm text-muted-foreground text-botanical">Follow experienced gardeners and discover new plant communities</p>
                  </CardContent>
                </Card>
                
                <Card className="post-card botanical-bloom -mt-4" style={{ animationDelay: '0.4s' }}>
                  <CardContent className="p-6">
                    <Heart className="h-10 w-10 text-flower-purple mb-4 plant-icon" />
                    <h3 className="font-semibold mb-2 heading-organic text-lg">Show Plant Love</h3>
                    <p className="text-sm text-muted-foreground text-botanical">Appreciate fellow gardeners' beautiful plants and helpful advice</p>
                  </CardContent>
                </Card>
                
                <Card className="post-card botanical-bloom mt-4" style={{ animationDelay: '0.6s' }}>
                  <CardContent className="p-6">
                    <Share className="h-10 w-10 text-sky-blue mb-4 plant-icon" />
                    <h3 className="font-semibold mb-2 heading-organic text-lg">Spread Knowledge</h3>
                    <p className="text-sm text-muted-foreground text-botanical">Share plant care guides and growing wisdom with your network</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold heading-organic text-foreground mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-lg text-muted-foreground text-botanical max-w-2xl mx-auto">
              PlantLife provides all the tools you need to document your plant journey, 
              connect with fellow enthusiasts, and build a thriving green community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center botanical-grow" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 mx-auto mb-6 botanical-gradient rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 heading-organic">Plant Profiles</h3>
              <p className="text-muted-foreground text-botanical">
                Create detailed profiles for each of your plants with care schedules, growth tracking, and photo journals.
              </p>
            </div>
            
            <div className="text-center botanical-grow" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 mx-auto mb-6 earth-gradient rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 heading-organic">Community Support</h3>
              <p className="text-muted-foreground text-botanical">
                Get advice from experienced gardeners, troubleshoot plant problems, and celebrate growing successes together.
              </p>
            </div>
            
            <div className="text-center botanical-grow" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 mx-auto mb-6 bg-flower-purple rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 heading-organic">Plant Discovery</h3>
              <p className="text-muted-foreground text-botanical">
                Discover new plant varieties, learn about care requirements, and find inspiration for your next green addition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-leaf-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="botanical-bloom">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 heading-organic">
              Ready to Join Our Growing Community?
            </h2>
            <p className="text-xl text-white/90 mb-8 text-botanical">
              Connect with plant lovers worldwide and start sharing your green journey today.
            </p>
            <Button 
              size="lg"
              onClick={() => setIsRegisterOpen(true)}
              className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sprout className="w-6 h-6 mr-2" />
              Join PlantLife Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="h-6 w-6 text-leaf-primary" />
            <span className="text-muted-foreground text-botanical">
              © 2025 PlantLife Community. Growing together, naturally.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}