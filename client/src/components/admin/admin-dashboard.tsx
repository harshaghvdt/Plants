import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  GraduationCap, 
  AlertCircle,
  Users,
  FileText,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface VerificationRequest {
  id: string;
  userId: string;
  verificationType: 'student' | 'professor_scientist';
  status: 'pending' | 'approved' | 'rejected';
  instituteName?: string;
  proofOfWorkUrl?: string;
  selfieUrl?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    accountType: string;
    phone: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');

  // Check if user is admin (hardcoded for now)
  const isAdmin = user?.phone === '+917753889327';

  useEffect(() => {
    if (isAdmin) {
      fetchVerificationRequests();
    }
  }, [isAdmin]);

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch('/api/admin/verification/pending', {
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
        description: "Failed to fetch verification requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/admin/verification/${selectedRequest.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: reviewStatus,
          adminNotes: adminNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review verification request');
      }

      toast({
        title: "Review Submitted",
        description: `Verification request ${reviewStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      // Update local state
      setVerificationRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: reviewStatus, adminNotes, reviewedAt: new Date().toISOString() }
            : req
        )
      );

      // Reset form
      setReviewStatus('approved');
      setAdminNotes('');
      setSelectedRequest(null);
      setReviewDialogOpen(false);
    } catch (error) {
      toast({
        title: "Review Failed",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      case 'professor_scientist':
        return <UserCheck className="h-4 w-4" />;
      case 'farmer':
        return <FileText className="h-4 w-4" />;
      case 'enthusiast':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Shield className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-semibold">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Loading verification requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = verificationRequests.filter(req => req.status === 'pending');
  const approvedRequests = verificationRequests.filter(req => req.status === 'approved');
  const rejectedRequests = verificationRequests.filter(req => req.status === 'rejected');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Admin Dashboard</span>
          </CardTitle>
          <CardDescription>
            Manage verification requests and user accounts
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{verificationRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Approved ({approvedRequests.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Rejected ({rejectedRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No pending verification requests
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getAccountTypeIcon(request.user.accountType)}
                        <span className="font-semibold">
                          {request.user.firstName} {request.user.lastName}
                        </span>
                        <Badge variant="outline">@{request.user.username}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Phone: {request.user.phone}</span>
                        <span>Type: {request.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}</span>
                        <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                      </div>

                      {request.instituteName && (
                        <div className="text-sm">
                          <span className="font-medium">Institute:</span> {request.instituteName}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Dialog open={reviewDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                        if (open) {
                          setSelectedRequest(request);
                          setReviewDialogOpen(true);
                        } else {
                          setSelectedRequest(null);
                          setReviewDialogOpen(false);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Verification Request</DialogTitle>
                            <DialogDescription>
                              Review the verification request for {request.user.firstName} {request.user.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* User Information */}
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-medium mb-2">User Information</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span>Name: {request.user.firstName} {request.user.lastName}</span>
                                <span>Username: @{request.user.username}</span>
                                <span>Phone: {request.user.phone}</span>
                                <span>Account Type: {request.user.accountType}</span>
                                <span>Verification Type: {request.verificationType}</span>
                                {request.instituteName && <span>Institute: {request.instituteName}</span>}
                              </div>
                            </div>

                            {/* Proof of Work */}
                            {request.proofOfWorkUrl && (
                              <div>
                                <Label>Proof of Work</Label>
                                <div className="mt-2">
                                  <img 
                                    src={request.proofOfWorkUrl} 
                                    alt="Proof of work" 
                                    className="w-full max-h-64 object-cover rounded-lg border"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Selfie */}
                            {request.selfieUrl && (
                              <div>
                                <Label>Selfie Photo</Label>
                                <div className="mt-2">
                                  <img 
                                    src={request.selfieUrl} 
                                    alt="Selfie" 
                                    className="w-full max-h-64 object-cover rounded-lg border"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Review Form */}
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reviewStatus">Review Decision</Label>
                                <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="approved">
                                      <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Approve</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      <div className="flex items-center space-x-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span>Reject</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                                <Textarea
                                  id="adminNotes"
                                  placeholder="Add notes about your decision..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequest(null);
                                    setReviewDialogOpen(false);
                                    setReviewStatus('approved');
                                    setAdminNotes('');
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleReview}
                                  className="flex-1"
                                  variant={reviewStatus === 'approved' ? 'default' : 'destructive'}
                                >
                                  {reviewStatus === 'approved' ? 'Approve' : 'Reject'} Request
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Approved Requests */}
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No approved verification requests
                </div>
              </CardContent>
            </Card>
          ) : (
            approvedRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getAccountTypeIcon(request.user.accountType)}
                        <span className="font-semibold">
                          {request.user.firstName} {request.user.lastName}
                        </span>
                        <Badge variant="outline">@{request.user.username}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Type: {request.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}</span>
                        <span>Approved: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Rejected Requests */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  No rejected verification requests
                </div>
              </CardContent>
            </Card>
          ) : (
            rejectedRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getAccountTypeIcon(request.user.accountType)}
                        <span className="font-semibold">
                          {request.user.firstName} {request.user.lastName}
                        </span>
                        <Badge variant="outline">@{request.user.username}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Type: {request.verificationType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}</span>
                        <span>Rejected: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>

                      {request.adminNotes && (
                        <div className="text-sm">
                          <span className="font-medium">Reason:</span> {request.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
