import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ScanLine, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Camera,
  Package,
  Weight,
  DollarSign
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface CollectorInfo {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  kycStatus: string;
  verifiedFullName?: string;
  phoneNumber?: string;
}

interface DropFormData {
  trashType: string;
  weight: string;
  notes: string;
}

export default function VendorBarcodeScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [collectorInfo, setCollectorInfo] = useState<CollectorInfo | null>(null);
  const [dropForm, setDropForm] = useState<DropFormData>({
    trashType: "",
    weight: "",
    notes: "",
  });

  // Trash type pricing (NGN per kg)
  const TRASH_PRICING = {
    plastic: 50,
    metal: 80,
    organic: 30,
    paper: 25,
    glass: 40,
    electronics: 100,
  };

  // Verify barcode and fetch collector info
  const verifyBarcodeMutation = useMutation({
    mutationFn: async (barcodeId: string) => {
      const response = await fetch(`/api/barcode/verify/${barcodeId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Invalid barcode or collector not found");
      }
      
      return response.json();
    },
    onSuccess: (data: CollectorInfo) => {
      setCollectorInfo(data);
      toast({
        title: "Collector Verified",
        description: `${data.firstName} ${data.lastName} identified successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      setCollectorInfo(null);
    },
  });

  // Log drop and process payment
  const logDropMutation = useMutation({
    mutationFn: async (dropData: {
      collectorId: string;
      barcodeId: string;
      trashType: string;
      weight: number;
      amount: number;
      notes?: string;
    }) => {
      const response = await fetch("/api/barcode-drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dropData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to log drop");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barcodeDrops"] });
      toast({
        title: "Drop Confirmed",
        description: "Payment has been credited to collector's wallet.",
      });
      
      // Reset form
      setBarcodeInput("");
      setCollectorInfo(null);
      setDropForm({ trashType: "", weight: "", notes: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Drop Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a barcode ID.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    verifyBarcodeMutation.mutate(barcodeInput.trim());
    setIsScanning(false);
  };

  const calculateAmount = (): number => {
    if (!dropForm.trashType || !dropForm.weight) return 0;
    
    const weight = parseFloat(dropForm.weight);
    if (isNaN(weight) || weight <= 0) return 0;
    
    const pricePerKg = TRASH_PRICING[dropForm.trashType as keyof typeof TRASH_PRICING] || 0;
    return weight * pricePerKg;
  };

  const handleConfirmDrop = () => {
    if (!collectorInfo) {
      toast({
        title: "No Collector",
        description: "Please scan a collector barcode first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!dropForm.trashType || !dropForm.weight) {
      toast({
        title: "Missing Information",
        description: "Please fill in trash type and weight.",
        variant: "destructive",
      });
      return;
    }
    
    const weight = parseFloat(dropForm.weight);
    if (isNaN(weight) || weight <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight in kg.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = calculateAmount();
    
    logDropMutation.mutate({
      collectorId: collectorInfo.id,
      barcodeId: barcodeInput,
      trashType: dropForm.trashType,
      weight,
      amount,
      notes: dropForm.notes,
    });
  };

  const handleReset = () => {
    setBarcodeInput("");
    setCollectorInfo(null);
    setDropForm({ trashType: "", weight: "", notes: "" });
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">KYC Verified</Badge>;
      case "verified":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">KYC Pending</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Not Verified</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ScanLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Scan Collector Barcode</CardTitle>
            <CardDescription>
              Verify collector identity and log waste drops
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barcode Scanner */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcodeInput">Collector Barcode ID</Label>
            <div className="flex gap-2">
              <Input
                id="barcodeInput"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Enter or scan barcode ID"
                onKeyPress={(e) => e.key === "Enter" && handleScan()}
                disabled={!!collectorInfo}
              />
              <Button
                onClick={handleScan}
                disabled={isScanning || !!collectorInfo}
                className="whitespace-nowrap"
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </div>

          {verifyBarcodeMutation.isPending && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-sm text-center">Verifying barcode...</p>
            </div>
          )}
        </div>

        {/* Collector Information */}
        {collectorInfo && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-900 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarImage src={collectorInfo.photoUrl} alt={collectorInfo.firstName} />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {collectorInfo.firstName[0]}{collectorInfo.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {collectorInfo.firstName} {collectorInfo.lastName}
                  </h3>
                  {collectorInfo.verifiedFullName && (
                    <p className="text-sm text-muted-foreground">
                      ID: {collectorInfo.verifiedFullName}
                    </p>
                  )}
                  {collectorInfo.phoneNumber && (
                    <p className="text-sm text-muted-foreground">
                      {collectorInfo.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getKYCBadge(collectorInfo.kycStatus)}
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>

            {collectorInfo.kycStatus !== "approved" && (
              <div className="flex items-start gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  This collector's KYC is not fully verified. Proceed with caution for high-value transactions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Drop Details Form */}
        {collectorInfo && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Drop Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trashType">
                  Trash Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={dropForm.trashType}
                  onValueChange={(value) => setDropForm((prev) => ({ ...prev, trashType: value }))}
                >
                  <SelectTrigger id="trashType">
                    <SelectValue placeholder="Select trash type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plastic">Plastic (₦50/kg)</SelectItem>
                    <SelectItem value="metal">Metal (₦80/kg)</SelectItem>
                    <SelectItem value="organic">Organic (₦30/kg)</SelectItem>
                    <SelectItem value="paper">Paper (₦25/kg)</SelectItem>
                    <SelectItem value="glass">Glass (₦40/kg)</SelectItem>
                    <SelectItem value="electronics">Electronics (₦100/kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight (kg) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={dropForm.weight}
                    onChange={(e) => setDropForm((prev) => ({ ...prev, weight: e.target.value }))}
                    placeholder="0.0"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={dropForm.notes}
                onChange={(e) => setDropForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the drop..."
                rows={3}
              />
            </div>

            {/* Payment Calculation */}
            {dropForm.trashType && dropForm.weight && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Calculated Payment:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₦{calculateAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dropForm.weight} kg × ₦{TRASH_PRICING[dropForm.trashType as keyof typeof TRASH_PRICING]}/kg
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {collectorInfo ? (
            <>
              <Button
                onClick={handleConfirmDrop}
                disabled={logDropMutation.isPending || !dropForm.trashType || !dropForm.weight}
                className="flex-1"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {logDropMutation.isPending ? "Processing..." : "Confirm Drop"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <div className="w-full p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
              <ScanLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Scan a collector's barcode to begin
            </div>
          )}
        </div>

        {/* Recent Drops (Optional) */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Quick Tips:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Always verify the collector's KYC status before accepting large drops</li>
            <li>Weigh the waste accurately to ensure fair payment</li>
            <li>Payment is instantly credited to the collector's wallet upon confirmation</li>
            <li>You can view all drops in your transaction history</li>
            <li>Contact support if you encounter any suspicious activity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
