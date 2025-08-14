import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  UserCheck, 
  Shield, 
  GraduationCap, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import VerificationRequestForm from "@/components/verification/verification-request-form";
import VerificationStatus from "@/components/verification/verification-status";

export default function VerificationPage() {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState("status");

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please sign in to access verification features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Verification</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account verification
                </p>
              </div>
            </div>
            
            {/* Account Type Badge */}
            <div className="flex items-center space-x-2">
              {user.accountType === 'student' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Student
                </Badge>
              )}
              {user.accountType === 'professor_scientist' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Professor/Scientist
                </Badge>
              )}
              {user.accountType === 'farmer' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <FileText className="h-3 w-3 mr-1" />
                  Farmer
                </Badge>
              )}
              {user.accountType === 'enthusiast' && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Users className="h-3 w-3 mr-1" />
                  Enthusiast
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isMobile ? (
          // Mobile Layout with Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="status" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Status</span>
              </TabsTrigger>
              <TabsTrigger value="apply" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Apply</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <VerificationStatus />
            </TabsContent>

            <TabsContent value="apply" className="space-y-4">
              <VerificationRequestForm />
            </TabsContent>
          </Tabs>
        ) : (
          // Desktop Layout with Sidebar
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <VerificationStatus />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your verification status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("apply")}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Apply for Verification
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("status")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    View Status
                  </Button>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Type</span>
                    <Badge variant="outline">
                      {user.accountType === 'student' && <GraduationCap className="h-3 w-3 mr-1" />}
                      {user.accountType === 'professor_scientist' && <UserCheck className="h-3 w-3 mr-1" />}
                      {user.accountType === 'farmer' && <FileText className="h-3 w-3 mr-1" />}
                      {user.accountType === 'enthusiast' && <Users className="h-3 w-3 mr-1" />}
                      {user.accountType}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verification Status</span>
                    {user.isVerified ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                  
                  {user.isVerified && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Verification Type</span>
                      <Badge variant="outline">
                        {user.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Requirements */}
              {!user.isVerified && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {user.accountType === 'student' && (
                      <div className="text-sm space-y-2">
                        <p className="text-muted-foreground">
                          To get verified as a student, you need to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Submit proof of student status</li>
                          <li>Provide valid identification</li>
                          <li>Wait for admin review</li>
                        </ul>
                      </div>
                    )}
                    
                    {user.accountType === 'professor_scientist' && (
                      <div className="text-sm space-y-2">
                        <p className="text-muted-foreground">
                          To get verified as a professor/scientist, you need to:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Provide institute name</li>
                          <li>Submit proof of work</li>
                          <li>Take a selfie photo</li>
                          <li>Apply within 7 days</li>
                        </ul>
                        
                        {(() => {
                          const accountAge = Date.now() - new Date(user.createdAt).getTime();
                          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                          const remainingTime = sevenDaysInMs - accountAge;
                          const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
                          
                          if (remainingTime > 0) {
                            return (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 font-medium">
                                  ⏰ {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
                                </p>
                                <p className="text-yellow-700 text-xs">
                                  Apply before the deadline to maintain your status
                                </p>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 font-medium">
                                  ❌ Deadline missed
                                </p>
                                <p className="text-red-700 text-xs">
                                  Contact support for assistance
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                    
                    {(user.accountType === 'farmer' || user.accountType === 'enthusiast') && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {user.accountType} accounts cannot be verified but have full access to community features.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
