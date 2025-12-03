import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportChatbot } from "@/components/SupportChatbot";
import { BankAccountLink } from "@/components/BankAccountLink";
import { PaymentStatements } from "@/components/PaymentStatements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Coins,
  Phone,
  Radio,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Clock,
  BarChart3,
  TrendingDown,
  Archive,
  Send,
  CheckCircle2,
  MessageSquare,
  Star,
  MapPin,
  AlertCircle,
  Settings,
  Receipt,
  Target
} from "lucide-react";

interface TrashRecord {
  id: string;
  reference: string;
  collectorId: string;
  trashType: "plastic" | "metal" | "organic";
  weightKg: number | string;
  status: "pending_vendor_confirmation" | "vendor_confirmed" | "in_transit" | "factory_received" | "payout_released" | "cancelled";
  submittedAt: string;
  metadata?: Record<string, unknown> & {
    collectorName?: string;
    vendorName?: string;
    vendorWard?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  description?: string | null;
  type: "earn" | "redeem" | "bonus" | "penalty";
  createdAt: string;
}

interface IncomingRequest {
  id: string;
  collectorName: string;
  collectorRating: number;
  wasteType: string;
  estimatedWeight: string;
  location: string;
  distance: string;
  requestedAt: string;
  urgency: "high" | "medium" | "low";
  collectorPhone: string;
}

interface InventoryItem {
  id: string;
  wasteType: string;
  currentStock: number;
  unit: string;
  lastUpdated: string;
  targetStock: number;
  status: "low" | "optimal" | "high";
}

const STATUS_META: Record<TrashRecord["status"], { label: string; badgeClass: string }> = {
  pending_vendor_confirmation: {
    label: "Awaiting confirmation",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-300",
  },
  vendor_confirmed: {
    label: "Confirmed",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300",
  },
  in_transit: {
    label: "In transit",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300",
  },
  factory_received: {
    label: "With factory",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-300",
  },
  payout_released: {
    label: "Paid",
    badgeClass: "bg-primary/10 text-primary border border-primary",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300",
  },
};

const PURCHASE_CATEGORIES = [
  { value: "airtime", label: "Buy airtime" },
  { value: "data", label: "Buy mobile data" },
  { value: "electricity", label: "Energy or utility" },
  { value: "supplies", label: "Operations supplies" },
] as const;

export default function VendorDashboard() {
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [idCardReason, setIdCardReason] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallet } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: trashRecords = [] } = useQuery<TrashRecord[]>({
    queryKey: ["/api/trash-records"],
    select: (records) =>
      (records ?? []).map((record: any) => ({
        ...record,
        weightKg: Number(record.weightKg ?? 0),
      })) as TrashRecord[],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    select: (records) =>
      (records ?? []).map((entry: any) => ({
        ...entry,
        amount: Number(entry.amount ?? 0),
      })) as Transaction[],
  });

  const { data: profile } = useQuery<{ user: any; profile: any } | null>({
    queryKey: ["/api/vendors/profile"],
    queryFn: async () => {
      const response = await fetch("/api/vendors/profile", { credentials: "include" });
      if (response.status === 401 || response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to load profile");
      return response.json();
    },
    retry: false,
  });

  const [purchaseCategory, setPurchaseCategory] = useState<typeof PURCHASE_CATEGORIES[number]["value"]>(PURCHASE_CATEGORIES[1].value);
  const [purchaseAmount, setPurchaseAmount] = useState("1000");
  const [transferUsername, setTransferUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("0.5");
  const [transferNote, setTransferNote] = useState("");

  // Mock data for incoming requests
  const incomingRequests: IncomingRequest[] = [
    {
      id: "1",
      collectorName: "John Adeyemi",
      collectorRating: 4.8,
      wasteType: "Plastic",
      estimatedWeight: "35-40 kg",
      location: "Ikeja, Lagos",
      distance: "1.2 km",
      requestedAt: "15 mins ago",
      urgency: "high",
      collectorPhone: "+234 803 123 4567",
    },
    {
      id: "2",
      collectorName: "Sarah Okonkwo",
      collectorRating: 4.9,
      wasteType: "Metal",
      estimatedWeight: "20-25 kg",
      location: "Victoria Island",
      distance: "3.8 km",
      requestedAt: "1 hour ago",
      urgency: "medium",
      collectorPhone: "+234 805 234 5678",
    },
  ];

  // Mock inventory data
  const inventory: InventoryItem[] = [
    { id: "1", wasteType: "Plastic (PET)", currentStock: 850, unit: "kg", targetStock: 1000, lastUpdated: "2 hours ago", status: "optimal" },
    { id: "2", wasteType: "Metal (Aluminum)", currentStock: 420, unit: "kg", targetStock: 500, lastUpdated: "5 hours ago", status: "optimal" },
    { id: "3", wasteType: "Glass", currentStock: 180, unit: "kg", targetStock: 600, lastUpdated: "1 day ago", status: "low" },
    { id: "4", wasteType: "Paper", currentStock: 1120, unit: "kg", targetStock: 800, lastUpdated: "4 hours ago", status: "high" },
  ];

  const purchaseMutation = useMutation({
    mutationFn: async (payload: { amount: number; category: string }) => {
      const response = await apiRequest("POST", "/api/wallet/purchase", {
        amount: payload.amount,
        category: payload.category,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase successful",
        description: "We have debited your wallet and will fulfil your request shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (payload: { amount: number; username: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/wallet/transfer", {
        amount: payload.amount,
        targetUsername: payload.username,
        description: payload.description,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer completed",
        description: data?.recipient?.username ? `Funds sent to ${data.recipient.username}.` : "Funds transferred successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const idCardRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiRequest("POST", "/api/support-tickets", {
        category: "id_card_request",
        subject: "Request for ID Card",
        description: reason,
        priority: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ID Card request submitted",
        description: "Your request has been sent to the admin.",
      });
      setShowIdCardModal(false);
      setIdCardReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to submit request",
        description: error?.message || "Please try again or contact support directly.",
        variant: "destructive",
      });
    },
  });

  const stats = useMemo(() => {
    const submitted = trashRecords.filter((record) => record.status === "pending_vendor_confirmation").length;
    const confirmed = trashRecords.filter((record) => record.status === "vendor_confirmed").length;
    const inTransit = trashRecords.filter((record) => record.status === "in_transit").length;
    const paid = trashRecords.filter((record) => record.status === "payout_released").length;
    const totalWeight = trashRecords.reduce((acc, record) => acc + Number(record.weightKg || 0), 0);

    return {
      submitted,
      confirmed,
      inTransit,
      paid,
      totalWeight,
      totalRevenue: 2450000,
      thisMonth: 458000,
      activeCollectors: 34,
      avgResponseTime: "2.5 hrs",
      satisfactionRate: 4.7,
    };
  }, [trashRecords]);

  const recentRecords = useMemo(() => {
    return [...trashRecords].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 6);
  }, [trashRecords]);

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300";
      default:
        return "";
    }
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case "low":
        return { color: "text-red-600", bg: "bg-red-100 dark:bg-red-950", label: "Low Stock" };
      case "optimal":
        return { color: "text-green-600", bg: "bg-green-100 dark:bg-green-950", label: "Optimal" };
      case "high":
        return { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950", label: "High Stock" };
      default:
        return { color: "", bg: "", label: "" };
    }
  };

  const handlePurchaseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(purchaseAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    purchaseMutation.mutate({ amount: Number(numericAmount.toFixed(2)), category: purchaseCategory });
  };

  const handleTransferSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(transferAmount);

    if (!transferUsername.trim()) {
      toast({
        title: "Recipient required",
        description: "Enter the collector's username you want to reward.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      amount: Number(numericAmount.toFixed(2)),
      username: transferUsername.trim(),
      description: transferNote.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Header balance={wallet?.balance || 0} showWallet />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl -z-10"></div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2">Vendor workspace</p>
              <h1 className="font-outfit font-bold text-3xl sm:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hello, {profile?.profile?.businessName || user?.firstName || user?.username} 👋
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mt-2">
                Confirm drops, release payouts, and manage your waste collection business
              </p>
            </div>
            <Button className="mt-2" variant="outline" size="sm" onClick={() => setShowIdCardModal(true)}>
              Request ID Card
            </Button>
          </div>
        </div>

        {/* ID Card Modal */}
        {showIdCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-xl mb-2">Request ID Card</h2>
              <p className="text-sm text-muted-foreground mb-4">Explain why you need a new or replacement ID card.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!idCardReason.trim()) {
                    toast({ title: "Reason required", description: "Please provide a reason for your request.", variant: "destructive" });
                    return;
                  }
                  idCardRequestMutation.mutate(idCardReason.trim());
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="id-card-reason">Reason</Label>
                  <Input
                    id="id-card-reason"
                    name="id-card-reason"
                    value={idCardReason}
                    onChange={(e) => setIdCardReason(e.target.value)}
                    placeholder="e.g., Lost my previous card, need a new one."
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowIdCardModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={idCardRequestMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                    {idCardRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pending Requests Alert */}
        {stats.submitted > 0 && (
          <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 shadow-lg">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 dark:text-orange-100 text-lg">You have {stats.submitted} pending collection requests</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Respond quickly to maintain your reputation</p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg" onClick={() => setSelectedTab("requests")}>
                  View Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">₦{(stats.totalRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground mt-1">+₦{(stats.thisMonth / 1000).toFixed(0)}k this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                Active Collectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.activeCollectors}</p>
              <p className="text-xs text-muted-foreground mt-1">Working with you</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                Total Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.totalWeight.toFixed(1)} kg</p>
              <p className="text-xs text-muted-foreground mt-1">Processed this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.avgResponseTime}</p>
              <p className="text-xs text-muted-foreground mt-1">Average response</p>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 shadow-lg rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Archive className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    Wallet Operations
                  </CardTitle>
                  <CardDescription>Purchase services or transfer funds to collectors</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Purchase Form */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold mb-4">Buy Services</h3>
                    <form onSubmit={handlePurchaseSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchase-category" className="font-medium">
                          Category
                        </Label>
                        <Select
                          value={purchaseCategory}
                          onValueChange={(value) => setPurchaseCategory(value as typeof PURCHASE_CATEGORIES[number]["value"])}
                        >
                          <SelectTrigger id="purchase-category" className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PURCHASE_CATEGORIES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchase-amount" className="font-medium">
                          Amount (₦)
                        </Label>
                        <Input
                          id="purchase-amount"
                          type="number"
                          min="0"
                          step="0.5"
                          value={purchaseAmount}
                          onChange={(event) => setPurchaseAmount(event.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={purchaseMutation.isPending}>
                          {purchaseMutation.isPending ? "Processing..." : "Purchase"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Transfer Form */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold mb-4">Transfer to Collector</h3>
                    <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="transfer-username" className="font-medium">
                          Collector username *
                        </Label>
                        <Input
                          id="transfer-username"
                          placeholder="e.g., collector_amos"
                          value={transferUsername}
                          onChange={(event) => setTransferUsername(event.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-amount" className="font-medium">
                          Amount (₦)
                        </Label>
                        <Input
                          id="transfer-amount"
                          type="number"
                          min="0"
                          step="0.5"
                          value={transferAmount}
                          onChange={(event) => setTransferAmount(event.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-note" className="font-medium">
                          Note (optional)
                        </Label>
                        <Input id="transfer-note" placeholder="e.g., Bonus for excellent work" value={transferNote} onChange={(event) => setTransferNote(event.target.value)} className="h-11" />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" size="lg" className="px-8 bg-green-600 hover:bg-green-700" disabled={transferMutation.isPending}>
                          {transferMutation.isPending ? "Sending..." : "Transfer"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle>Wallet snapshot</CardTitle>
                  <CardDescription>Current balance and activity</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <p className="text-sm opacity-90 mb-1">Available Balance</p>
                    <p className="text-4xl font-bold">₦{(wallet?.balance || 0).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-muted-foreground mb-1">In Transit</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden shadow-xl">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle>Recent trash records</CardTitle>
                  <CardDescription>Latest collector submissions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Collector</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="text-center font-semibold">Weight</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p className="text-muted-foreground font-medium">No records yet</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentRecords.map((record) => {
                            const statusMeta = STATUS_META[record.status];
                            return (
                              <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <TableCell className="font-medium">{new Date(record.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{record.metadata?.collectorName || record.collectorId}</TableCell>
                                <TableCell className="capitalize">{record.trashType}</TableCell>
                                <TableCell className="text-center font-semibold">{Number(record.weightKg).toFixed(1)} kg</TableCell>
                                <TableCell>
                                  <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-xl">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle>Wallet activity</CardTitle>
                  <CardDescription>Track debits, credits, and transfers</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="text-right font-semibold">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12">
                              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p className="text-muted-foreground font-medium">No activity yet</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentTransactions.map((transaction) => (
                            <TableRow key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                              <TableCell className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-sm">{transaction.description || "Wallet activity"}</TableCell>
                              <TableCell className={`text-right font-bold ${transaction.amount >= 0 ? "text-green-600" : "text-rose-600"}`}>
                                {transaction.amount >= 0 ? "+" : "-"}₦{Math.abs(transaction.amount).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-outfit mb-2">Incoming Requests</h2>
              <p className="text-muted-foreground">Review and respond to collector submissions</p>
            </div>

            {incomingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{request.collectorName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`h-3 w-3 ${i <= request.collectorRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                              ))}
                              <span className="ml-1">({request.collectorRating})</span>
                            </div>
                            <span>•</span>
                            <span>{request.requestedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency === "high" ? "Urgent" : request.urgency === "medium" ? "Moderate" : "Flexible"}
                        </Badge>
                        <Badge variant="outline" className="border-blue-600 text-blue-600">
                          {request.wasteType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{request.estimatedWeight}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{request.distance} away</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.location}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="ghost">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {incomingRequests.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="py-16 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">New collection requests will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-outfit mb-2">Inventory Management</h2>
                <p className="text-muted-foreground">Track your waste stock levels</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Request Factory Pickup
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.status);
                const percentage = (item.currentStock / item.targetStock) * 100;

                return (
                  <Card key={item.id} className="hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.wasteType}</CardTitle>
                          <CardDescription>Last updated: {item.lastUpdated}</CardDescription>
                        </div>
                        <Badge className={`${stockStatus.bg} ${stockStatus.color}`}>{stockStatus.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-end justify-between mb-2">
                          <p className="text-4xl font-bold">{item.currentStock}</p>
                          <p className="text-sm text-muted-foreground">
                            / {item.targetStock} {item.unit}
                          </p>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-3 ${
                            item.status === "low"
                              ? "[&>div]:bg-red-600"
                              : item.status === "high"
                                ? "[&>div]:bg-blue-600"
                                : "[&>div]:bg-green-600"
                          }`}
                        />
                        <p className="text-xs text-muted-foreground mt-2 font-semibold">{percentage.toFixed(0)}% of target capacity</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Package className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-outfit mb-2">Account Settings ⚙️</h2>
              <p className="text-muted-foreground">Manage your profile and payment preferences</p>
            </div>

            <BankAccountLink />

            <Card className="shadow-xl">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Your verified business information</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Business Name</p>
                    <p className="font-semibold text-lg">{profile?.profile?.businessName || "Not set"}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact Person</p>
                    <p className="font-semibold text-lg">{profile?.profile?.contactName || "Not set"}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</p>
                    <p className="font-semibold text-lg">{profile?.user?.phoneNumber || "Not set"}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Location</p>
                    <p className="font-semibold text-lg">
                      {[profile?.profile?.ward, profile?.profile?.lga, profile?.profile?.state].filter(Boolean).join(", ") || "Not set"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            <PaymentStatements userRole="vendor" />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <SupportChatbot />
    </div>
  );
}
