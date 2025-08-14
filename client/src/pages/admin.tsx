import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Shield, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  AlertCircle,
  GraduationCap,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is admin (hardcoded for now)
  const isAdmin = user?.phone === '+917753889327';

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please sign in to access admin features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Shield className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access the admin area.
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
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage verification requests and user accounts
                </p>
              </div>
            </div>
            
            {/* Admin Badge */}
            <Badge variant="default" className="bg-purple-500">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isMobile ? (
          // Mobile Layout with Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Statistics</CardTitle>
                  <CardDescription>
                    Overview of verification system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700">0</p>
                      <p className="text-sm text-blue-600">Pending</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">0</p>
                      <p className="text-sm text-green-600">Approved</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Admin Actions</h4>
                    <div className="space-y-2 text-sm">
                      <p>• Review verification requests</p>
                      <p>• Approve or reject applications</p>
                      <p>• Monitor system activity</p>
                      <p>• Manage user accounts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Desktop Layout
          <div className="space-y-6">
            <AdminDashboard />
          </div>
        )}
      </main>
    </div>
  );
}
