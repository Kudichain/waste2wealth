import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Building2 } from "lucide-react";
import type { UpdateVendorProfile } from "@shared/schema";

interface VendorProfileEditorProps {
  userId: string;
}

export function VendorProfileEditor({ userId }: VendorProfileEditorProps) {
  const { toast } = useToast();
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [certPreviewUrl, setCertPreviewUrl] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UpdateVendorProfile>({});

  const { data: vendorProfile, isLoading } = useQuery({
    queryKey: ["vendorProfile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/vendor-profile`);
      if (!res.ok) throw new Error("Failed to fetch vendor profile");
      return res.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/vendor-profile", {
        method: "PUT",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to update vendor profile");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor profile updated successfully",
      });
      setLogoPreviewUrl(null);
      setLogoFile(null);
      setCertPreviewUrl(null);
      setCertFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cert"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "logo" && !file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select an image file for logo",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setLogoFile(file);
          setLogoPreviewUrl(reader.result as string);
        } else {
          setCertFile(file);
          setCertPreviewUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsInBusiness" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();

    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, String(value));
        }
      }
    });

    // Add files if selected
    if (logoFile) {
      data.append("businessLogo", logoFile);
    }
    if (certFile) {
      data.append("businessCertificate", certFile);
    }

    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading vendor profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Business Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Logo
          </CardTitle>
          <CardDescription>Upload your business logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed">
              {logoPreviewUrl || vendorProfile?.businessLogo ? (
                <img
                  src={logoPreviewUrl || vendorProfile?.businessLogo}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
              {logoPreviewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreviewUrl(null);
                    setLogoFile(null);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or GIF up to 5MB
                  </p>
                </div>
              </Label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "logo")}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder={vendorProfile?.businessName || "Enter business name"}
                  value={formData.businessName || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder={vendorProfile?.contactName || "Enter contact name"}
                  value={formData.contactName || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder={vendorProfile?.contactPhone || "Enter phone number"}
                  value={formData.contactPhone || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  name="businessRegistrationNumber"
                  placeholder={vendorProfile?.businessRegistrationNumber || "Enter registration number"}
                  value={formData.businessRegistrationNumber || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder={vendorProfile?.state || "Enter state"}
                  value={formData.state || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lga">Local Government Area *</Label>
                <Input
                  id="lga"
                  name="lga"
                  placeholder={vendorProfile?.lga || "Enter LGA"}
                  value={formData.lga || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  name="ward"
                  placeholder={vendorProfile?.ward || "Enter ward"}
                  value={formData.ward || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder={vendorProfile?.address || "Enter full address"}
                value={formData.address || ""}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your business (max 1000 characters)"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={1000}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(formData.description?.length || 0)}/1000 characters
              </p>
            </div>

            {/* Financial Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    placeholder={vendorProfile?.taxId || "Enter tax ID"}
                    value={formData.taxId || ""}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    type="number"
                    min="0"
                    placeholder={vendorProfile?.yearsInBusiness?.toString() || "Enter years"}
                    value={formData.yearsInBusiness || ""}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <h4 className="font-medium">Bank Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder={vendorProfile?.bankName || "Enter bank name"}
                      value={formData.bankName || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankCode">Bank Code</Label>
                    <Input
                      id="bankCode"
                      name="bankCode"
                      placeholder={vendorProfile?.bankCode || "Enter bank code"}
                      value={formData.bankCode || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountName">Account Name</Label>
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      placeholder={vendorProfile?.bankAccountName || "Enter account name"}
                      value={formData.bankAccountName || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      placeholder={vendorProfile?.bankAccountNumber || "Enter account number"}
                      value={formData.bankAccountNumber || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Certificate */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Business Certificate</h3>
              {certPreviewUrl && (
                <div className="mb-4 flex items-center justify-between p-3 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">Certificate selected</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCertPreviewUrl(null);
                      setCertFile(null);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Label htmlFor="cert" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload business certificate</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG up to 5MB
                  </p>
                </div>
              </Label>
              <input
                id="cert"
                type="file"
                onChange={(e) => handleFileChange(e, "cert")}
                className="hidden"
              />
            </div>

            {vendorProfile?.verified && (
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ✓ Vendor profile verified
              </div>
            )}

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Vendor Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
