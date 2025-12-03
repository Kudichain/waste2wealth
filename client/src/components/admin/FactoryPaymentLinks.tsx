import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Factory,
  CreditCard,
  Mail,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Package
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PaymentLink {
  id: string;
  factoryId: string;
  factoryName: string;
  type: "subscription" | "shipment";
  amount: number;
  status: "pending" | "paid" | "expired" | "failed";
  link: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  invoiceNumber: string;
  description: string;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  duration: "monthly" | "annual";
  price: number;
  features: string[];
}

export default function FactoryPaymentLinks() {
  const [selectedFactory, setSelectedFactory] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [copiedLink, setCopiedLink] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscription packages
  const packages: SubscriptionPackage[] = [
    {
      id: "starter-monthly",
      name: "Starter",
      duration: "monthly",
      price: 50000,
      features: ["Up to 50 tons/month", "Basic analytics", "Email support"],
    },
    {
      id: "standard-monthly",
      name: "Standard",
      duration: "monthly",
      price: 150000,
      features: ["Up to 200 tons/month", "Advanced analytics", "Priority support", "Custom reports"],
    },
    {
      id: "enterprise-monthly",
      name: "Enterprise",
      duration: "monthly",
      price: 500000,
      features: ["Unlimited tons", "Real-time analytics", "24/7 support", "Dedicated account manager", "API access"],
    },
    {
      id: "starter-annual",
      name: "Starter Annual",
      duration: "annual",
      price: 500000,
      features: ["Up to 50 tons/month", "Basic analytics", "Email support", "2 months free"],
    },
    {
      id: "standard-annual",
      name: "Standard Annual",
      duration: "annual",
      price: 1500000,
      features: ["Up to 200 tons/month", "Advanced analytics", "Priority support", "Custom reports", "2 months free"],
    },
    {
      id: "enterprise-annual",
      name: "Enterprise Annual",
      duration: "annual",
      price: 5000000,
      features: ["Unlimited tons", "Real-time analytics", "24/7 support", "Dedicated account manager", "API access", "2 months free"],
    },
  ];

  // Mock payment links data
  const { data: paymentLinks = [], isLoading } = useQuery<PaymentLink[]>({
    queryKey: ["/api/admin/payment-links"],
    initialData: [
      {
        id: "PL-001",
        factoryId: "F-12",
        factoryName: "EcoPlastics Nigeria Ltd",
        type: "subscription",
        amount: 500000,
        status: "paid",
        link: "https://waste2wealth.ng/pay/PL-001-abc123def456",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        invoiceNumber: "INV-2024-001",
        description: "Annual Subscription - Starter Package",
      },
      {
        id: "PL-002",
        factoryId: "F-08",
        factoryName: "GreenMetal Recyclers",
        type: "shipment",
        amount: 1800000,
        status: "paid",
        link: "https://waste2wealth.ng/pay/PL-002-xyz789ghi012",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        invoiceNumber: "INV-2024-002",
        description: "Shipment Payment - 15 tons Plastic (BATCH-045)",
      },
      {
        id: "PL-003",
        factoryId: "F-15",
        factoryName: "PaperMill Industries",
        type: "subscription",
        amount: 150000,
        status: "pending",
        link: "https://waste2wealth.ng/pay/PL-003-mno345pqr678",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        invoiceNumber: "INV-2024-003",
        description: "Monthly Subscription - Standard Package",
      },
    ],
  });

  // Generate payment link mutation
  const generateLinkMutation = useMutation({
    mutationFn: async (data: { factoryId: string; packageId: string; type: "subscription" | "shipment" }) => {
      // TODO: Replace with actual API call
      return new Promise<PaymentLink>((resolve) =>
        setTimeout(() => {
          resolve({
            id: `PL-${Date.now()}`,
            factoryId: data.factoryId,
            factoryName: "New Factory",
            type: data.type,
            amount: packages.find(p => p.id === data.packageId)?.price || 0,
            status: "pending",
            link: `https://waste2wealth.ng/pay/PL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            invoiceNumber: `INV-2024-${Date.now()}`,
            description: packages.find(p => p.id === data.packageId)?.name || "Payment",
          });
        }, 1000)
      );
    },
    onSuccess: (newLink) => {
      queryClient.setQueryData<PaymentLink[]>(
        ["/api/admin/payment-links"],
        (old = []) => [newLink, ...old]
      );
      toast({
        title: "Payment Link Generated",
        description: "Link has been created and sent to factory email.",
        variant: "default",
      });
      setSelectedFactory("");
      setSelectedPackage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    toast({
      title: "Link Copied",
      description: "Payment link copied to clipboard.",
      variant: "default",
    });
    setTimeout(() => setCopiedLink(""), 2000);
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

  const getStatusBadge = (status: PaymentLink["status"]) => {
    const variants: Record<typeof status, { label: string; className: string; icon: any }> = {
      paid: { label: "Paid", className: "bg-green-500 text-white", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-orange-500 text-white", icon: Clock },
      expired: { label: "Expired", className: "bg-gray-500 text-white", icon: XCircle },
      failed: { label: "Failed", className: "bg-red-500 text-white", icon: XCircle },
    };
    const { label, className, icon: Icon } = variants[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Generate New Payment Link */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-primary" />
            Factory Payment Links
          </CardTitle>
          <CardDescription>
            Generate secure payment links for factory subscriptions and per-ton shipments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Tabs defaultValue="subscription" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscription">Subscription Payment</TabsTrigger>
              <TabsTrigger value="shipment">Shipment Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="space-y-4 mt-6">
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <AlertTitle>Subscription Packages</AlertTitle>
                <AlertDescription>
                  Generate payment links for monthly or annual factory subscriptions. Links expire in 7 days.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.filter(p => p.duration === "monthly").map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPackage === pkg.id ? "border-2 border-primary ring-2 ring-primary/20" : ""
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Monthly</p>
                        <p className="text-2xl font-bold">{pkg.name}</p>
                        <p className="text-3xl font-bold text-primary mt-2">
                          {formatCurrency(pkg.price)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Annual Packages (2 Months Free)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packages.filter(p => p.duration === "annual").map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPackage === pkg.id ? "border-2 border-primary ring-2 ring-primary/20" : ""
                      }`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="mb-4">
                          <Badge className="bg-green-500 text-white mb-2">Best Value</Badge>
                          <p className="text-sm text-muted-foreground">Annual</p>
                          <p className="text-2xl font-bold">{pkg.name.replace(" Annual", "")}</p>
                          <p className="text-3xl font-bold text-primary mt-2">
                            {formatCurrency(pkg.price)}
                            <span className="text-sm font-normal text-muted-foreground">/year</span>
                          </p>
                        </div>
                        <ul className="space-y-2 text-sm">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <div className="flex-1">
                  <Label htmlFor="factory-select">Select Factory</Label>
                  <Input
                    id="factory-select"
                    placeholder="Enter factory ID (e.g., F-12)"
                    value={selectedFactory}
                    onChange={(e) => setSelectedFactory(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      selectedFactory &&
                      selectedPackage &&
                      generateLinkMutation.mutate({
                        factoryId: selectedFactory,
                        packageId: selectedPackage,
                        type: "subscription",
                      })
                    }
                    disabled={!selectedFactory || !selectedPackage || generateLinkMutation.isPending}
                    className="gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {generateLinkMutation.isPending ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipment" className="space-y-4 mt-6">
              <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950/20">
                <Package className="h-4 w-4 text-purple-600" />
                <AlertTitle>Shipment Payment</AlertTitle>
                <AlertDescription>
                  Generate payment links for verified waste shipments. Amount calculated automatically based on weight and current rates.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipment-factory">Factory ID</Label>
                    <Input
                      id="shipment-factory"
                      placeholder="e.g., F-12"
                      value={selectedFactory}
                      onChange={(e) => setSelectedFactory(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipment-batch">Batch/Token ID</Label>
                    <Input
                      id="shipment-batch"
                      placeholder="e.g., BATCH-045"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Auto-Calculation</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="space-y-2 text-sm">
                      <p><strong>Example Calculation:</strong></p>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                        <p>Batch: BATCH-045</p>
                        <p>Weight: 15 tons Plastic</p>
                        <p>Rate: ₦120,000/ton</p>
                        <p className="font-bold text-blue-600 mt-2">Total: ₦1,800,000</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        System automatically fetches verified weight and current rates to calculate payment amount.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() =>
                    selectedFactory &&
                    generateLinkMutation.mutate({
                      factoryId: selectedFactory,
                      packageId: "shipment-custom",
                      type: "shipment",
                    })
                  }
                  disabled={!selectedFactory || generateLinkMutation.isPending}
                  className="gap-2 w-full"
                >
                  <LinkIcon className="h-4 w-4" />
                  {generateLinkMutation.isPending ? "Generating..." : "Generate Shipment Link"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>

      {/* Payment Links Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Payment Links</CardTitle>
              <CardDescription>Track status of all generated payment links</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-links"] })}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Factory</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paymentLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No payment links generated yet
                  </TableCell>
                </TableRow>
              ) : (
                paymentLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm">{link.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{link.factoryName}</p>
                          <p className="text-xs text-muted-foreground">{link.factoryId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={link.type === "subscription" ? "border-blue-500 text-blue-700" : "border-purple-500 text-purple-700"}>
                        {link.type === "subscription" ? <Calendar className="h-3 w-3 mr-1" /> : <Package className="h-3 w-3 mr-1" />}
                        {link.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(link.amount)}</TableCell>
                    <TableCell>{getStatusBadge(link.status)}</TableCell>
                    <TableCell className="text-sm">{formatDate(link.createdAt)}</TableCell>
                    <TableCell className="text-sm">{formatDate(link.expiresAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(link.link, link.id)}
                          className="gap-1"
                        >
                          {copiedLink === link.id ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
