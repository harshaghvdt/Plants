import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  GraduationCap, 
  Shield,
  Calendar,
  FileText,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface VerificationRequest {
  id: string;
  verificationType: 'student' | 'professor_scientist';
  status: 'pending' | 'approved' | 'rejected';
  instituteName?: string;
  proofOfWorkUrl?: string;
  selfieUrl?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export default function VerificationStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
    }
  }, [user]);

  const fetchVerificationRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/verification/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification requests');
      }

      const data = await response.json();
      setVerificationRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch verification status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationIcon = () => {
    if (user?.isVerified) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    
    if (user?.accountType === 'professor_scientist') {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (accountAge > sevenDaysInMs) {
        return <XCircle className="h-6 w-6 text-red-500" />;
      }
      return <Clock className="h-6 w-6 text-yellow-500" />;
    }
    
    return <AlertCircle className="h-6 w-6 text-blue-500" />;
  };

  const getVerificationTitle = () => {
    if (user?.isVerified) {
      return "Verified Account";
    }
    
    if (user?.accountType === 'professor_scientist') {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (accountAge > sevenDaysInMs) {
        return "Verification Deadline Missed";
      }
      return "Verification Required";
    }
    
    if (user?.accountType === 'student') {
      return "Student Verification Available";
    }
    
    return "Verification Not Available";
  };

  const getVerificationDescription = () => {
    if (user?.isVerified) {
      return `Your account is verified as a ${user.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}.`;
    }
    
    if (user?.accountType === 'professor_scientist') {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const remainingTime = sevenDaysInMs - accountAge;
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
      
      if (remainingTime > 0) {
        return `You must verify within ${remainingDays} day${remainingDays !== 1 ? 's' : ''} to maintain your status.`;
      } else {
        return "You missed the 7-day verification deadline. Contact support for assistance.";
      }
    }
    
    if (user?.accountType === 'student') {
      return "You can apply for student verification anytime to get a verified badge.";
    }
    
    return `${user?.accountType} accounts cannot be verified.`;
  };

  const getVerificationBadge = () => {
    if (user?.isVerified) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          {user.verificationType === 'professor_scientist' ? 'Verified Professor/Scientist' : 'Verified Student'}
        </Badge>
      );
    }
    
    if (user?.accountType === 'professor_scientist') {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      if (accountAge > sevenDaysInMs) {
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Deadline Missed
          </Badge>
        );
      }
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Verification Required
        </Badge>
      );
    }
    
    if (user?.accountType === 'student') {
      return (
        <Badge variant="outline">
          <GraduationCap className="h-3 w-3 mr-1" />
          Student Verification Available
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Available
      </Badge>
    );
  };

  const getAccountTypeIcon = () => {
    switch (user?.accountType) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'professor_scientist':
        return <UserCheck className="h-4 w-4" />;
      case 'farmer':
        return <FileText className="h-4 w-4" />;
      case 'enthusiast':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAccountTypeLabel = () => {
    switch (user?.accountType) {
      case 'student':
        return 'Student';
      case 'professor_scientist':
        return 'Professor/Scientist';
      case 'farmer':
        return 'Farmer';
      case 'enthusiast':
        return 'Plant Enthusiast';
      default:
        return 'Unknown';
    }
  };

  const canApplyForVerification = () => {
    if (!user) return false;
    if (user.isVerified) return false;
    
    if (user.accountType === 'professor_scientist') {
      const accountAge = Date.now() - new Date(user.createdAt).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      return accountAge <= sevenDaysInMs;
    }
    
    return user.accountType === 'student';
  };

  const getVerificationDeadline = () => {
    if (user?.accountType === 'professor_scientist' && !user.isVerified) {
      const accountCreationDate = new Date(user.createdAt);
      const deadline = new Date(accountCreationDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return deadline;
    }
    return null;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main Verification Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getVerificationIcon()}
            <span>{getVerificationTitle()}</span>
          </CardTitle>
          <CardDescription>
            {getVerificationDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Type and Verification Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              {getAccountTypeIcon()}
              <span className="font-medium">{getAccountTypeLabel()}</span>
            </div>
            {getVerificationBadge()}
          </div>

          {/* Verification Deadline */}
          {getVerificationDeadline() && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Verification Deadline: {getVerificationDeadline()?.toLocaleDateString()}</span>
            </div>
          )}

          {/* Action Button */}
          {canApplyForVerification() && (
            <Button 
              onClick={() => setShowVerificationForm(true)}
              className="w-full sm:w-auto"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Apply for Verification
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Verification History */}
      {verificationRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification History</CardTitle>
            <CardDescription>
              Track your verification requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {request.verificationType === 'professor_scientist' ? (
                      <UserCheck className="h-4 w-4 text-blue-500" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {request.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'} Verification
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {request.status === 'approved' && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {request.status === 'rejected' && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form Dialog */}
      <Dialog open={showVerificationForm} onOpenChange={setShowVerificationForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Request</DialogTitle>
            <DialogDescription>
              Submit your verification request to get a verified badge
            </DialogDescription>
          </DialogHeader>
          
          {/* Import and render the verification form component here */}
          <div className="mt-4">
            {/* This would be the VerificationRequestForm component */}
            <div className="text-center text-muted-foreground">
              Verification form component would be rendered here
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
