import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Edit, 
  Save, 
  X, 
  DollarSign, 
  History, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Package,
  Leaf,
  Trash2,
  FileText
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WasteRate {
  id: string;
  wasteType: string;
  ratePerTon: number;
  effectiveDate: string;
  updatedBy: string;
  isActive: boolean;
}

interface PriceHistory {
  id: string;
  wasteType: string;
  oldRate: number;
  newRate: number;
  changedAt: string;
  changedBy: string;
  reason: string;
}

export default function PriceManagement() {
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Current active rates
  const [rates, setRates] = useState({
    plastic: "120000",
    metal: "150000",
    paper: "80000",
    organic: "60000",
  });

  // Temporary editing state
  const [editRates, setEditRates] = useState({ ...rates });
  const [changeReason, setChangeReason] = useState("");

  // Mock query - replace with actual API call
  const { data: priceHistory = [] } = useQuery<PriceHistory[]>({
    queryKey: ["/api/admin/price-history"],
    initialData: [
      {
        id: "1",
        wasteType: "Plastic",
        oldRate: 100000,
        newRate: 120000,
        changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        changedBy: "Admin User",
        reason: "Market rate adjustment for Q4 2024",
      },
      {
        id: "2",
        wasteType: "Metal",
        oldRate: 130000,
        newRate: 150000,
        changedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        changedBy: "Admin User",
        reason: "Increased demand from recycling plants",
      },
    ],
  });

  // Mutation for updating rates
  const updateRatesMutation = useMutation({
    mutationFn: async (newRates: typeof rates) => {
      // TODO: Replace with actual API call
      // await fetch("/api/admin/update-rates", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ rates: newRates, reason: changeReason }),
      // });
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setRates(editRates);
      setEditMode(false);
      setChangeReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/price-history"] });
      toast({
        title: "Rates Updated Successfully",
        description: "All factories have been notified of the new pricing.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditRates({ ...rates });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditRates({ ...rates });
    setChangeReason("");
    setEditMode(false);
  };

  const handleSave = () => {
    if (!changeReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the rate change.",
        variant: "destructive",
      });
      return;
    }
    updateRatesMutation.mutate(editRates);
  };

  const getWasteIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "plastic":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "metal":
        return <TrendingUp className="h-5 w-5 text-gray-600" />;
      case "paper":
        return <FileText className="h-5 w-5 text-amber-600" />;
      case "organic":
        return <Leaf className="h-5 w-5 text-green-600" />;
      default:
        return <Trash2 className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Price Management Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Waste Rate Management
              </CardTitle>
              <CardDescription>
                Control per-ton pricing for all waste types. Changes notify all factories automatically.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? "Hide" : "Show"} History
              </Button>
              {!editMode ? (
                <Button onClick={handleEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Rates
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2"
                    disabled={updateRatesMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="gap-2"
                    disabled={updateRatesMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    {updateRatesMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Plastic */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getWasteIcon("plastic")}
                    <p className="font-semibold">Plastic</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    PET/HDPE
                  </Badge>
                </div>
                {editMode ? (
                  <div>
                    <Label htmlFor="plastic-rate" className="text-xs">Rate per ton (₦)</Label>
                    <Input
                      id="plastic-rate"
                      type="number"
                      value={editRates.plastic}
                      onChange={(e) => setEditRates({ ...editRates, plastic: e.target.value })}
                      className="mt-1 text-lg font-bold"
                      min="0"
                      step="1000"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(parseInt(rates.plastic))}/ton
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Bottles, containers, packaging
                </p>
              </CardContent>
            </Card>

            {/* Metal */}
            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getWasteIcon("metal")}
                    <p className="font-semibold">Metal</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Al/Fe
                  </Badge>
                </div>
                {editMode ? (
                  <div>
                    <Label htmlFor="metal-rate" className="text-xs">Rate per ton (₦)</Label>
                    <Input
                      id="metal-rate"
                      type="number"
                      value={editRates.metal}
                      onChange={(e) => setEditRates({ ...editRates, metal: e.target.value })}
                      className="mt-1 text-lg font-bold"
                      min="0"
                      step="1000"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-700">
                    {formatCurrency(parseInt(rates.metal))}/ton
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Aluminum cans, scrap metal
                </p>
              </CardContent>
            </Card>

            {/* Paper */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getWasteIcon("paper")}
                    <p className="font-semibold">Paper</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    Cardboard
                  </Badge>
                </div>
                {editMode ? (
                  <div>
                    <Label htmlFor="paper-rate" className="text-xs">Rate per ton (₦)</Label>
                    <Input
                      id="paper-rate"
                      type="number"
                      value={editRates.paper}
                      onChange={(e) => setEditRates({ ...editRates, paper: e.target.value })}
                      className="mt-1 text-lg font-bold"
                      min="0"
                      step="1000"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-amber-700">
                    {formatCurrency(parseInt(rates.paper))}/ton
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Newspapers, cardboard boxes
                </p>
              </CardContent>
            </Card>

            {/* Organic */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getWasteIcon("organic")}
                    <p className="font-semibold">Organic</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Compost
                  </Badge>
                </div>
                {editMode ? (
                  <div>
                    <Label htmlFor="organic-rate" className="text-xs">Rate per ton (₦)</Label>
                    <Input
                      id="organic-rate"
                      type="number"
                      value={editRates.organic}
                      onChange={(e) => setEditRates({ ...editRates, organic: e.target.value })}
                      className="mt-1 text-lg font-bold"
                      min="0"
                      step="1000"
                    />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(parseInt(rates.organic))}/ton
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Food waste, yard waste
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Change Reason (only in edit mode) */}
          {editMode && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Document This Change</AlertTitle>
              <AlertDescription>
                <div className="mt-3">
                  <Label htmlFor="change-reason">Reason for Rate Change *</Label>
                  <Input
                    id="change-reason"
                    placeholder="e.g., Market rate adjustment, increased demand, seasonal pricing"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This will be logged in the audit trail and included in factory notifications.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success/Info Messages */}
          {!editMode && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Rates Active & Synchronized</AlertTitle>
              <AlertDescription>
                Current rates are applied to all new shipments. Factories have been notified via email and dashboard alerts.
                <div className="mt-2 text-xs">
                  <p className="font-semibold">Last Updated: {formatDate(new Date().toISOString())}</p>
                  <p>Next Review: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>

      {/* Price History Table */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Price Change History
            </CardTitle>
            <CardDescription>
              Complete audit trail of all rate changes with timestamps and admin actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Old Rate</TableHead>
                  <TableHead>New Rate</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No price changes recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  priceHistory.map((record) => {
                    const change = record.newRate - record.oldRate;
                    const percentChange = ((change / record.oldRate) * 100).toFixed(1);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {getWasteIcon(record.wasteType)}
                          {record.wasteType}
                        </TableCell>
                        <TableCell>{formatCurrency(record.oldRate)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(record.newRate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={change > 0 ? "default" : "destructive"}
                            className={change > 0 ? "bg-green-500" : ""}
                          >
                            {change > 0 ? "+" : ""}{formatCurrency(change)} ({percentChange}%)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(record.changedAt)}</TableCell>
                        <TableCell className="text-sm">{record.changedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                          {record.reason}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Factory Notification Preview */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Factory Notification Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white dark:bg-gray-900 rounded border text-sm space-y-2">
            <p className="font-semibold">Subject: Waste Pricing Update - Effective Immediately</p>
            <p className="text-muted-foreground">Dear Factory Partner,</p>
            <p className="text-muted-foreground">
              Our waste pricing has been updated. Please review the new rates on your dashboard.
            </p>
            <div className="my-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">New Rates:</p>
              <ul className="space-y-1 text-xs">
                <li>• Plastic: {formatCurrency(parseInt(rates.plastic))}/ton</li>
                <li>• Metal: {formatCurrency(parseInt(rates.metal))}/ton</li>
                <li>• Paper: {formatCurrency(parseInt(rates.paper))}/ton</li>
                <li>• Organic: {formatCurrency(parseInt(rates.organic))}/ton</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              All new shipments will be billed at these rates. Thank you for your partnership.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
