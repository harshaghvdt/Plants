import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, FileText, GraduationCap, UserCheck, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface VerificationFormData {
  verificationType: 'student' | 'professor_scientist';
  instituteName?: string;
  proofOfWorkUrl?: string;
  selfieUrl?: string;
}

export default function VerificationRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const [formData, setFormData] = useState<VerificationFormData>({
    verificationType: 'student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Check if user can apply for verification
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

  // Get verification deadline for professors/scientists
  const getVerificationDeadline = () => {
    if (user?.accountType === 'professor_scientist' && !user.isVerified) {
      const accountCreationDate = new Date(user.createdAt);
      const deadline = new Date(accountCreationDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return deadline;
    }
    return null;
  };

  const handleFileCapture = (type: 'proof' | 'selfie') => {
    const inputRef = type === 'proof' ? fileInputRef : selfieInputRef;
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'proof' | 'selfie') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'proof') {
          setCapturedImage(result);
          setFormData(prev => ({ ...prev, proofOfWorkUrl: result }));
        } else {
          setCapturedSelfie(result);
          setFormData(prev => ({ ...prev, selfieUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validation
    if (formData.verificationType === 'professor_scientist') {
      if (!formData.instituteName || !formData.proofOfWorkUrl || !formData.selfieUrl) {
        toast({
          title: "Missing Information",
          description: "Institute name, proof of work, and selfie are required for professor/scientist verification",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit verification request');
      }

      toast({
        title: "Verification Request Submitted",
        description: "Your verification request has been submitted and is under review.",
      });

      // Reset form
      setFormData({ verificationType: 'student' });
      setCapturedImage(null);
      setCapturedSelfie(null);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Please sign in to submit a verification request.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.isVerified) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Already Verified</h3>
            <p className="text-muted-foreground">
              Your account is already verified as a {user.verificationType}.
            </p>
            <Badge variant="secondary" className="text-sm">
              {user.verificationType === 'professor_scientist' ? 'Verified Professor/Scientist' : 'Verified Student'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canApplyForVerification()) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto" />
            <h3 className="text-xl font-semibold">Verification Not Available</h3>
            <p className="text-muted-foreground">
              {user.accountType === 'professor_scientist' 
                ? "Professor/scientist verification must be applied within 7 days of account creation."
                : `${user.accountType} accounts cannot be verified.`
              }
            </p>
            {user.accountType === 'professor_scientist' && getVerificationDeadline() && (
              <div className="text-sm text-muted-foreground">
                Deadline: {getVerificationDeadline()?.toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <span>Verification Request</span>
        </CardTitle>
        <CardDescription>
          Submit your verification request to get a verified badge on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Type Display */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">
                {user.accountType === 'professor_scientist' ? 'Professor/Scientist' : 'Student'}
              </Badge>
              {user.accountType === 'professor_scientist' && (
                <Badge variant="destructive" className="text-xs">
                  7-day deadline
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user.accountType === 'professor_scientist' 
                ? "You must verify within 7 days of account creation to maintain your status."
                : "You can verify anytime to get a student verification badge."
              }
            </p>
          </div>

          {/* Verification Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="verificationType">Verification Type</Label>
            <Select 
              value={formData.verificationType} 
              onValueChange={(value: 'student' | 'professor_scientist') => 
                setFormData(prev => ({ ...prev, verificationType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Student Verification</span>
                  </div>
                </SelectItem>
                <SelectItem value="professor_scientist">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Professor/Scientist Verification</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Institute Name (Professor/Scientist only) */}
          {formData.verificationType === 'professor_scientist' && (
            <div className="space-y-2">
              <Label htmlFor="instituteName">Institute/Organization Name *</Label>
              <Input
                id="instituteName"
                placeholder="e.g., University of Botany, Research Institute"
                value={formData.instituteName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, instituteName: e.target.value }))}
                required
              />
            </div>
          )}

          {/* Proof of Work (Professor/Scientist only) */}
          {formData.verificationType === 'professor_scientist' && (
            <div className="space-y-2">
              <Label>Proof of Work *</Label>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileCapture('proof')}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isMobile ? 'Capture Photo' : 'Upload File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'proof')}
                  className="hidden"
                />
                {capturedImage && (
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Proof of work" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCapturedImage(null);
                        setFormData(prev => ({ ...prev, proofOfWorkUrl: undefined }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selfie (Professor/Scientist only) */}
          {formData.verificationType === 'professor_scientist' && (
            <div className="space-y-2">
              <Label>Selfie Photo *</Label>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileCapture('selfie')}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isMobile ? 'Take Selfie' : 'Upload Selfie'}
                </Button>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  className="hidden"
                />
                {capturedSelfie && (
                  <div className="relative">
                    <img 
                      src={capturedSelfie} 
                      alt="Selfie" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCapturedSelfie(null);
                        setFormData(prev => ({ ...prev, selfieUrl: undefined }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
