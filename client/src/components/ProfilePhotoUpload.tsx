import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userName?: string;
}

export default function ProfilePhotoUpload({ currentPhotoUrl, userName }: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append("photo", compressedFile);
      
      const response = await fetch(`/api/users/${user?.id}/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setPreviewUrl(data.photoUrl);
      setSelectedFile(null);
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/photo`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setPreviewUrl("");
      setSelectedFile(null);
      toast({
        title: "Photo Removed",
        description: "Your profile photo has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await uploadPhotoMutation.mutateAsync(selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to remove your profile photo?")) {
      deletePhotoMutation.mutate();
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentPhotoUrl || "");
  };

  const getInitials = () => {
    if (!userName) return "U";
    const names = userName.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>
              Upload a clear photo for visual identification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Photo Preview */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-40 w-40 border-4 border-muted">
            <AvatarImage src={previewUrl} alt={userName || "User"} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-primary/10">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          {selectedFile && (
            <div className="text-sm text-center">
              <p className="font-medium text-green-600 dark:text-green-400">New photo selected</p>
              <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {selectedFile ? (
            <>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="lg"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                {previewUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              {previewUrl && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  size="lg"
                  className="w-full text-destructive hover:text-destructive"
                  disabled={deletePhotoMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  {deletePhotoMutation.isPending ? "Removing..." : "Remove Photo"}
                </Button>
              )}
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Guidelines */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Photo Guidelines:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Use a clear, recent photo of yourself</li>
            <li>Face should be clearly visible and centered</li>
            <li>Avoid sunglasses, hats, or face coverings</li>
            <li>Good lighting with neutral background preferred</li>
            <li>Supported formats: JPEG, PNG, WebP (max 10MB)</li>
            <li>Image will be compressed for faster loading</li>
          </ul>
        </div>

        {/* Why Photo is Important */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Why is a profile photo important?
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Helps vendors visually identify you during trash drops</li>
            <li>Builds trust and credibility on the platform</li>
            <li>Makes your profile more professional and approachable</li>
            <li>Required for certain high-value transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
