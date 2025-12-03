import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Camera
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface KYCVerificationProps {
  kycStatus?: "pending" | "verified" | "approved" | "rejected";
  verifiedFullName?: string;
  idType?: string;
  idNumber?: string;
}

export default function KYCVerification({ 
  kycStatus = "pending",
  verifiedFullName,
  idType,
  idNumber
}: KYCVerificationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadKYCMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("idDocument", file);
      formData.append("idType", "voters_card");
      
      const response = await fetch(`/api/users/${user?.id}/kyc/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload KYC document");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "KYC Document Uploaded",
        description: `Name extracted: ${data.extractedName || "Processing..."}`,
      });
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, WebP, or PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setExtracting(true);
    setUploadProgress(10);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await uploadKYCMutation.mutateAsync(selectedFile);
      setUploadProgress(100);
    } finally {
      setExtracting(false);
      clearInterval(progressInterval);
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "verified":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getStatusMessage = () => {
    switch (kycStatus) {
      case "approved":
        return "Your identity has been verified and approved. You can now access all platform features.";
      case "verified":
        return "Your document has been verified. Waiting for admin approval.";
      case "rejected":
        return "Your KYC submission was rejected. Please upload a valid document and try again.";
      default:
        return "Upload your Voter's Card to verify your identity and build trust with vendors.";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>KYC Authentication</CardTitle>
              <CardDescription>Verify your identity with your Voter's Card</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Message */}
        <div className={`p-4 rounded-lg border ${
          kycStatus === "approved" 
            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
            : kycStatus === "rejected"
            ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
            : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900"
        }`}>
          <p className="text-sm">{getStatusMessage()}</p>
        </div>

        {/* Verified Information Display */}
        {verifiedFullName && kycStatus === "approved" && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Verified Identity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Full Name:</span>
                <p className="font-medium">{verifiedFullName}</p>
              </div>
              {idType && (
                <div>
                  <span className="text-muted-foreground">ID Type:</span>
                  <p className="font-medium capitalize">{idType.replace("_", " ")}</p>
                </div>
              )}
              {idNumber && (
                <div>
                  <span className="text-muted-foreground">ID Number:</span>
                  <p className="font-medium">{idNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Why KYC is Required */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Why is KYC Required?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Ensures trust and transparency in the platform</li>
            <li>Enables secure payouts to your bank account</li>
            <li>Protects against fraud and unauthorized access</li>
            <li>Required for high-value transactions</li>
            <li>Helps vendors visually identify collectors</li>
          </ul>
        </div>

        {/* Upload Section (only if not approved) */}
        {kycStatus !== "approved" && (
          <>
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <FileText className="inline-block h-4 w-4 mr-1" />
                    {selectedFile?.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Drag and drop your Voter's Card here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse (JPG, PNG, WebP, PDF - Max 5MB)
                    </p>
                  </div>
                  <Input
                    id="kyc-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Label htmlFor="kyc-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {extracting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing document...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && !extracting && (
              <Button
                onClick={handleUpload}
                disabled={uploadKYCMutation.isPending}
                size="lg"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadKYCMutation.isPending ? "Uploading..." : "Upload & Verify"}
              </Button>
            )}
          </>
        )}

        {/* Guidelines */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Document Guidelines:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Ensure the document is clear and all text is readable</li>
            <li>Upload the front side of your Voter's Card</li>
            <li>Make sure your photo and name are visible</li>
            <li>Avoid glare or shadows on the document</li>
            <li>Supported formats: JPG, PNG, WebP, PDF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
