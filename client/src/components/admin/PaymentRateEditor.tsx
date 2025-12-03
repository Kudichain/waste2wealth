import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pencil, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface PaymentRate {
  id: string;
  trashType: string;
  ratePerKg: number;
  ratePerTon: number;
  description?: string;
  isActive: boolean;
  updatedBy?: string;
  updaterName?: string;
  updatedAt: Date;
  createdAt: Date;
}

interface EditFormData {
  ratePerKg: number;
  ratePerTon: number;
  description?: string;
  isActive: boolean;
}

export default function PaymentRateEditor() {
  const [rates, setRates] = useState<PaymentRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<PaymentRate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    ratePerKg: 0,
    ratePerTon: 0,
    description: "",
    isActive: true,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch payment rates
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/payment-rates", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment rates");
      }

      const data = await response.json();
      setRates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payment rates");
      console.error("Error fetching rates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rate: PaymentRate) => {
    setEditingRate(rate);
    setFormData({
      ratePerKg: rate.ratePerKg,
      ratePerTon: rate.ratePerTon,
      description: rate.description || "",
      isActive: rate.isActive,
    });
    setValidationError(null);
    setIsDialogOpen(true);
  };

  const handleFormChange = (field: keyof EditFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);

    // Real-time validation for rate relationship
    if (field === "ratePerKg" || field === "ratePerTon") {
      const kg = field === "ratePerKg" ? Number(value) : formData.ratePerKg;
      const ton = field === "ratePerTon" ? Number(value) : formData.ratePerTon;

      if (kg > 0 && ton > 0) {
        const minExpected = kg * 1800;
        const maxExpected = kg * 2200;

        if (ton < minExpected || ton > maxExpected) {
          setValidationError(
            `Per ton rate should be between ₦${minExpected.toLocaleString()} and ₦${maxExpected.toLocaleString()} based on per kg rate of ₦${kg}`
          );
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!editingRate) return;

    // Validation
    if (formData.ratePerKg <= 0) {
      setValidationError("Rate per kg must be greater than 0");
      return;
    }

    if (formData.ratePerTon <= 0) {
      setValidationError("Rate per ton must be greater than 0");
      return;
    }

    const minExpected = formData.ratePerKg * 1800;
    const maxExpected = formData.ratePerKg * 2200;

    if (formData.ratePerTon < minExpected || formData.ratePerTon > maxExpected) {
      setValidationError(
        `Rate mismatch: Per ton rate must be between ₦${minExpected.toLocaleString()} and ₦${maxExpected.toLocaleString()}`
      );
      return;
    }

    try {
      setSubmitting(true);
      setValidationError(null);

      const response = await fetch(`/api/admin/payment-rates/${editingRate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update payment rate");
      }

      const result = await response.json();
      console.log("Payment rate updated:", result);

      // Refresh rates and close dialog
      await fetchRates();
      setIsDialogOpen(false);
      setEditingRate(null);
    } catch (err: any) {
      setValidationError(err.message || "Failed to update payment rate");
      console.error("Error updating rate:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Rate Management</CardTitle>
          <CardDescription>Loading payment rates...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Rate Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchRates} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Rate Management</CardTitle>
          <CardDescription>
            Update payment rates for collectors (per kg) and factories (per ton). Rates are used
            dynamically for all new transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trash Type</TableHead>
                <TableHead>Rate per Kg</TableHead>
                <TableHead>Rate per Ton</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{getTypeLabel(rate.trashType)}</TableCell>
                  <TableCell>{formatCurrency(rate.ratePerKg)}/kg</TableCell>
                  <TableCell>{formatCurrency(rate.ratePerTon)}/ton</TableCell>
                  <TableCell>
                    {rate.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(rate.updatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rate.updaterName || "System"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(rate)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payment rates configured. Contact system administrator.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Edit Payment Rate - {editingRate && getTypeLabel(editingRate.trashType)}
            </DialogTitle>
            <DialogDescription>
              Update the payment rates for this trash type. Changes will apply to all new
              transactions immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="ratePerKg">Rate per Kilogram (₦)</Label>
              <Input
                id="ratePerKg"
                type="number"
                min="0"
                step="0.01"
                value={formData.ratePerKg}
                onChange={(e) => handleFormChange("ratePerKg", parseFloat(e.target.value))}
                placeholder="Enter rate per kg"
              />
              <p className="text-sm text-muted-foreground">
                Amount paid to collectors per kilogram of waste
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratePerTon">Rate per Ton (₦)</Label>
              <Input
                id="ratePerTon"
                type="number"
                min="0"
                step="0.01"
                value={formData.ratePerTon}
                onChange={(e) => handleFormChange("ratePerTon", parseFloat(e.target.value))}
                placeholder="Enter rate per ton"
              />
              <p className="text-sm text-muted-foreground">
                Amount charged to factories per ton of waste (1 ton = 1000 kg)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Add notes or description"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleFormChange("isActive", checked)}
              />
            </div>

            {formData.ratePerKg > 0 && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Expected Per Ton Range:</p>
                <p className="text-muted-foreground">
                  ₦{(formData.ratePerKg * 1800).toLocaleString()} - ₦
                  {(formData.ratePerKg * 2200).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Based on 1 ton = 1000 kg with 80-120% markup)
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !!validationError}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
