import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import PaymentRateEditor from "@/components/admin/PaymentRateEditor";
import EventGalleryManagement from "@/components/admin/EventGalleryManagement";
import PriceManagement from "@/components/admin/PriceManagement";
import FactoryPaymentLinks from "@/components/admin/FactoryPaymentLinks";
import {
  Shield,
  Users,
  FileText,
  Image,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Settings,
  Upload,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  LogOut,
  Wallet,
  AlertCircle,
  Activity,
  UserCheck,
  UserX,
  FileBarChart,
  Package,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Factory,
  Recycle,
  Leaf,
  BarChart3,
  AlertTriangle,
  Eye,
  Ban,
  Award,
  Target,
  Zap,
  CreditCard,
  Building2,
  MapPin,
  TrendingDown,
  Calendar,
  Clock,
  Camera,
  Fingerprint,
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "planned";
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
}
interface Payment {
  id: string;
  userId: string;
  username: string;
  amount: number;
  itemName: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

interface WalletData {
  balance: number;
  userId: string;
}

interface TreasuryTransaction {
  id: string;
  reference: string;
  actorName: string;
  role: "collector" | "vendor";
  weight: number;
  amount: number;
  status: string;
  statusBucket: "settled" | "pending" | "flagged";
  timestamp: string;
  location: string;
  bank: string;
  channel?: string | null;
  state?: string | null;
  city?: string | null;
}

interface TreasuryResponse {
  role: "collector" | "vendor";
  window?: {
    start: string;
    end: string;
  };
  filters?: {
    dateRange?: string;
    state?: string | null;
  };
  summary: {
    totalAmount: number;
    pendingAmount: number;
    flaggedCount: number;
    settledCount: number;
    count: number;
    avgSettlementSeconds?: number;
  };
  availableStates: string[];
  transactions: TreasuryTransaction[];
}

const TREASURY_DATE_RANGES = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("overview");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [transactionView, setTransactionView] = useState<"collector" | "vendor">("collector");
  const [dateRange, setDateRange] = useState("24h");
  const [stateFilter, setStateFilter] = useState("all");

  const {
    data: settlementData,
    isLoading: isSettlementsLoading,
    error: settlementsError,
  } = useQuery<TreasuryResponse>({
    queryKey: ["admin-settlements", transactionView, dateRange, stateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        role: transactionView,
        dateRange,
      });
      if (stateFilter !== "all") {
        params.append("state", stateFilter);
      }
      const response = await fetch(`/api/admin/settlements?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch settlements");
      }
      return response.json();
    },
    staleTime: 15_000,
  });

  const availableStates = settlementData?.availableStates ?? [];
  const activeTransactions = settlementData?.transactions ?? [];

  const statusStyles: Record<TreasuryTransaction["statusBucket"], { label: string; className: string }> = {
    settled: { label: "Settled", className: "bg-green-500/15 text-green-600 border-green-500/20" },
    pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
    flagged: { label: "Flagged", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  };

  const transactionInsights = useMemo(() => {
    if (!settlementData) {
      return {
        totalAmount: 0,
        pendingAmount: 0,
        flaggedCount: 0,
        settledCount: 0,
        avgTicket: 0,
        settlementScore: "0%",
        settlementSpeed: "—",
      };
    }

    const summary = settlementData.summary;
    const avgTicket = summary.count ? summary.totalAmount / summary.count : 0;
    const settlementScore = summary.count
      ? `${((summary.settledCount / summary.count) * 100).toFixed(1)}%`
      : "0%";
    const settlementSpeed = summary.avgSettlementSeconds
      ? formatDuration(summary.avgSettlementSeconds)
      : "—";

    return {
      totalAmount: summary.totalAmount,
      pendingAmount: summary.pendingAmount,
      flaggedCount: summary.flaggedCount,
      settledCount: summary.settledCount,
      avgTicket,
      settlementScore,
      settlementSpeed,
    };
  }, [settlementData]);

  const settlementWindowLabel = useMemo(() => {
    if (!settlementData?.window) {
      return "Live window";
    }
    const start = new Date(settlementData.window.start);
    const end = new Date(settlementData.window.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Live window";
    }
    return `${start.toLocaleString()} → ${end.toLocaleTimeString()}`;
  }, [settlementData]);

  // Fetch wallet balance
  const { data: walletData, refetch: refetchWallet } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
    refetchInterval: 5000, // Refetch every 5 seconds
    initialData: { balance: 0, userId: user?.id || "" },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          description: "Admin withdrawal",
          reference: `ADMIN-WD-${Date.now()}`
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Withdrawal failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setWithdrawAmount("");
      toast({
        title: "Withdrawal Successful",
        description: "Funds have been withdrawn from your wallet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    if (walletData && amount > walletData.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough KOBO to withdraw.",
        variant: "destructive",
      });
      return;
    }
    withdrawMutation.mutate(amount);
  };

  // Mock data - in real app, these would come from API
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    initialData: [
      { id: "1", title: "Waste Collection Network", description: "Building a nationwide waste collection infrastructure", status: "active", createdAt: "2024-01-01" },
      { id: "2", title: "Recycling Plant Setup", description: "Establishing recycling facilities in major cities", status: "planned", createdAt: "2024-02-01" }
    ]
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog"],
    initialData: [
      { id: "1", title: "The Future of Waste Management in Nigeria", content: "Exploring innovative solutions...", published: true, createdAt: "2024-01-15" }
    ]
  });

  const { data: newsItems = [] } = useQuery<NewsItem[]>({
    queryKey: ["/api/admin/news"],
    initialData: [
      { id: "1", title: "New Partnership with Lagos State Government", content: "Announcing our collaboration...", published: true, createdAt: "2024-01-20" }
    ]
  });

  const { data: shopItems = [] } = useQuery<ShopItem[]>({
    queryKey: ["/api/admin/shop"],
    initialData: [
      { id: "1", name: "Eco-Friendly Shopping Bag", description: "Reusable shopping bag made from recycled materials", price: 2500, available: true }
    ]
  });

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
    initialData: [
      { id: "1", userId: "user_collector1", username: "collector1", amount: 2500, itemName: "Eco-Friendly Shopping Bag", status: "pending", createdAt: "2024-01-25" }
    ]
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: "completed" | "cancelled" }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { paymentId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "Payment Updated",
        description: `Payment ${data.status === "completed" ? "accepted" : "cancelled"} successfully.`,
      });
    },
  });

  const handlePaymentAction = (paymentId: string, action: "accept" | "reject") => {
    const status = action === "accept" ? "completed" : "cancelled";
    updatePaymentStatusMutation.mutate({ paymentId, status });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        {/* Admin Header with Logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-outfit font-bold text-3xl md:text-4xl">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage platform content, users, and system settings
            </p>
          </div>
          <Button 
            variant="destructive" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Fintech Command Center */}
        <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-white/90 dark:bg-gray-950/80 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Treasury Command Center
                </CardTitle>
                <CardDescription>
                  Toggle between collector and vendor rails to see real-time settlement health.
                </CardDescription>
              </div>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/5 p-1">
                <Button
                  size="sm"
                  variant={transactionView === "collector" ? "default" : "ghost"}
                  className={`rounded-full px-6 ${transactionView === "collector" ? "shadow-lg" : "text-muted-foreground"}`}
                  onClick={() => setTransactionView("collector")}
                >
                  Collector Rail
                </Button>
                <Button
                  size="sm"
                  variant={transactionView === "vendor" ? "default" : "ghost"}
                  className={`rounded-full px-6 ${transactionView === "vendor" ? "shadow-lg" : "text-muted-foreground"}`}
                  onClick={() => setTransactionView("vendor")}
                >
                  Vendor Rail
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  Window: {settlementWindowLabel}
                </Badge>
                {stateFilter !== "all" && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200">
                    State: {stateFilter}
                  </Badge>
                )}
                {isSettlementsLoading && <span className="text-primary">Refreshing live data…</span>}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREASURY_DATE_RANGES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={stateFilter}
                  onValueChange={setStateFilter}
                  disabled={!availableStates.length}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All geographies</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {settlementsError && (
              <Alert variant="destructive">
                <AlertTitle>Unable to load settlements</AlertTitle>
                <AlertDescription>{(settlementsError as Error).message}</AlertDescription>
              </Alert>
            )}

            {/* Snapshot cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Total Settled (24h)</CardDescription>
                  <CardTitle className="text-3xl">
                    ₦{formatCurrency(transactionInsights.totalAmount)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>{transactionInsights.settledCount} transactions cleared</p>
                  <p>Speed: {transactionInsights.settlementSpeed}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20 border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Avg. Ticket Size</CardDescription>
                  <CardTitle className="text-3xl">
                    ₦{formatCurrency(transactionInsights.avgTicket)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>Channel: {transactionView === "collector" ? "Instant Payout" : "Treasury Sweep"}</p>
                  <p>Settlement score {transactionInsights.settlementScore}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-900/20 border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Pending Queue</CardDescription>
                  <CardTitle className="text-3xl text-amber-600">
                    ₦{formatCurrency(transactionInsights.pendingAmount)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>Auto-release once tokens confirm</p>
                  <p>Next sweep at :15 and :45</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-900/20 border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardDescription>Risk Alerts</CardDescription>
                  <CardTitle className="text-3xl text-red-600">
                    {transactionInsights.flaggedCount}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  <p>Flagged for manual review</p>
                  <p>Bound to fraud desk workflow</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Transaction stream */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {transactionView === "collector" ? "Collector" : "Vendor"} transaction stream
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Linked to {transactionView === "collector" ? "wallet tokens" : "batch IDs"}
                  </Badge>
                </div>
                {isSettlementsLoading && (
                  <div className="p-4 text-sm text-muted-foreground border rounded-2xl bg-accent/40 animate-pulse">
                    Streaming live settlements…
                  </div>
                )}
                {!isSettlementsLoading && activeTransactions.length === 0 && (
                  <div className="p-6 text-center border rounded-2xl bg-white/60 dark:bg-gray-900/60">
                    <p className="font-medium">No settlements match this window.</p>
                    <p className="text-xs text-muted-foreground">Try expanding the date range or removing filters.</p>
                  </div>
                )}
                {activeTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-2xl border bg-white/70 dark:bg-gray-900/60 backdrop-blur flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tx.role === "collector" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}`}>
                          {tx.role === "collector" ? <Users className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{tx.actorName}</p>
                          <p className="text-xs text-muted-foreground">{tx.reference} • {tx.location}</p>
                        </div>
                      </div>
                      <Badge className={`border ${statusStyles[tx.statusBucket]?.className ?? statusStyles.pending.className}`}>
                        {statusStyles[tx.statusBucket]?.label ?? statusStyles.pending.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>Weight: <strong>{tx.weight} kg</strong></span>
                      <span>Channel: {tx.channel ?? "Not specified"}</span>
                      <span>{tx.bank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">₦{tx.amount.toLocaleString()}</p>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(tx.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Risk & health */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Settlement Health
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Treasury runway and governance checks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Settlement score</span>
                      <span className="font-semibold">{transactionInsights.settlementScore}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Next liquidity sweep</span>
                      <span className="font-semibold">T+0 • 15 min cadence</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      <p>• All payouts attached to verified tokens</p>
                      <p>• Vendor batches enforce 3-step verification</p>
                      <p>• Collector rail capped at ₦150k per drop</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Liquidity Controls</CardTitle>
                    <CardDescription>One-tap treasury actions</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Sync with Paystack
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <CreditCard className="h-4 w-4" />
                      Trigger mass payout
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Pause flagged rail
                    </Button>
                    <Button variant="outline" className="justify-start gap-2">
                      <Target className="h-4 w-4" />
                      Adjust rate logic
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Admin Wallet & Payment Flow Management */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Admin Wallet - Central Payment Hub</CardTitle>
                  <CardDescription>All inflows & outflows • Token-verified disbursements • Multi-source funding</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => refetchWallet()}
                    title="Refresh balance"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {((walletData?.balance || 0) / 1000).toFixed(3)} KOBO
                </p>
                <p className="text-sm text-muted-foreground">
                  ≈ ₦{(walletData?.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Payment Flow Overview - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Incoming Payments */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <ArrowDownToLine className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-sm">Incoming</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">₦2.4M</p>
                  <p className="text-xs text-muted-foreground mt-1">Factory + CSR + Grants</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Factory Subs:</span>
                      <span className="font-medium">₦1.8M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per-Ton Fees:</span>
                      <span className="font-medium">₦450K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CSR/Grants:</span>
                      <span className="font-medium">₦150K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outgoing Disbursements */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm">Outgoing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">₦1.9M</p>
                  <p className="text-xs text-muted-foreground mt-1">Collectors + Vendors</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collectors:</span>
                      <span className="font-medium">₦1.2M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendors:</span>
                      <span className="font-medium">₦650K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonuses:</span>
                      <span className="font-medium">₦50K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Transactions */}
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <CardTitle className="text-sm">Pending</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">₦320K</p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipments:</span>
                      <span className="font-medium">24 tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KYC Review:</span>
                      <span className="font-medium">12 users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Payout:</span>
                      <span className="font-medium">₦320K</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Net Flow */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-sm">Net Flow</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">+₦500K</p>
                  <p className="text-xs text-muted-foreground mt-1">This month surplus</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Margin:</span>
                      <span className="font-medium text-green-600">20.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth:</span>
                      <span className="font-medium text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reserve:</span>
                      <span className="font-medium">₦50K KOBO</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Source Breakdown */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Multi-Source Funding Channels
                </p>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                  3 Active Sources
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Factory Payments */}
                <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Factory className="h-5 w-5 text-emerald-600" />
                        <p className="font-medium text-sm">Factory Payments</p>
                      </div>
                      <Badge className="bg-emerald-500 text-white">Primary</Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">Subscriptions (Monthly/Annual)</span>
                        <span className="font-semibold">₦1.8M</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">Per-Ton Fees (Verified Shipments)</span>
                        <span className="font-semibold">₦450K</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-medium">Total Factory Revenue:</span>
                        <span className="font-bold text-emerald-600">₦2.25M</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>✓ 45 factories subscribed</p>
                      <p>✓ 1,200 tons verified this month</p>
                      <p>✓ Auto-credited on verification</p>
                    </div>
                  </CardContent>
                </Card>

                {/* CSR Donations */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <p className="font-medium text-sm">CSR Donations</p>
                      </div>
                      <Badge className="bg-blue-500 text-white">Secondary</Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">Corporate Sponsors</span>
                        <span className="font-semibold">₦100K</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">Community Projects</span>
                        <span className="font-semibold">₦50K</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-medium">Total CSR Funds:</span>
                        <span className="font-bold text-blue-600">₦150K</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>✓ 8 corporate partners active</p>
                      <p>✓ Tagged for impact reporting</p>
                      <p>✓ Paystack/Flutterwave integrated</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Grants & Government Funding */}
                <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <p className="font-medium text-sm">Grants & Funding</p>
                      </div>
                      <Badge className="bg-purple-500 text-white">Strategic</Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">Government Programs</span>
                        <span className="font-semibold">₦0</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                        <span className="text-muted-foreground">NGO Grants</span>
                        <span className="font-semibold">₦0</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-medium">Total Grants:</span>
                        <span className="font-bold text-purple-600">₦0</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>✓ Ready for expansion funding</p>
                      <p>✓ Compliance reports available</p>
                      <p>✓ Remita integration enabled</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Disbursement Management */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Token-Verified Disbursement Flow
                </p>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200">
                  Automated • Auditable • Secure
                </Badge>
              </div>
              
              <div className="space-y-4">
                {/* Flow Diagram */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <p className="font-medium">Collector Drops</p>
                        <p className="text-xs text-muted-foreground">QR token generated</p>
                      </div>
                    </div>
                    <span className="text-2xl text-muted-foreground">→</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <p className="font-medium">Vendor Authenticates</p>
                        <p className="text-xs text-muted-foreground">Weight verified</p>
                      </div>
                    </div>
                    <span className="text-2xl text-muted-foreground">→</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <p className="font-medium">Factory Confirms</p>
                        <p className="text-xs text-muted-foreground">Shipment received</p>
                      </div>
                    </div>
                    <span className="text-2xl text-muted-foreground">→</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <p className="font-medium">Admin Disburses</p>
                        <p className="text-xs text-muted-foreground">Auto-payment</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Formula */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 dark:bg-green-950/10 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-sm">Collector Payout Formula</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border text-sm font-mono">
                        <p className="text-xs text-muted-foreground mb-1">Calculation:</p>
                        <p className="font-semibold">Payout = Weight (kg) × Rate (₦/kg)</p>
                        <p className="text-xs text-muted-foreground mt-2">Example: 50kg × ₦80/kg = ₦4,000</p>
                      </div>
                      <div className="mt-3 space-y-1 text-xs">
                        <p className="flex justify-between"><span className="text-muted-foreground">Plastic:</span> <span className="font-medium">₦80/kg</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Metal:</span> <span className="font-medium">₦120/kg</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Organic:</span> <span className="font-medium">₦60/kg</span></p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 dark:bg-blue-950/10 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <p className="font-medium text-sm">Vendor Payout Formula</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border text-sm font-mono">
                        <p className="text-xs text-muted-foreground mb-1">Calculation:</p>
                        <p className="font-semibold">Payout = Weight (kg) × Handling Fee</p>
                        <p className="text-xs text-muted-foreground mt-2">Example: 50kg × ₦15/kg = ₦750</p>
                      </div>
                      <div className="mt-3 space-y-1 text-xs">
                        <p className="flex justify-between"><span className="text-muted-foreground">Standard Fee:</span> <span className="font-medium">₦15/kg</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Premium Vendor:</span> <span className="font-medium">₦20/kg</span></p>
                        <p className="flex justify-between"><span className="text-muted-foreground">Volume Bonus:</span> <span className="font-medium">+5% over 1000kg</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="pt-4 border-t">
              <Label htmlFor="withdraw-amount" className="text-sm font-semibold mb-2 block">Manual Withdrawal (Admin Override)</Label>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount in KOBO"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    step="0.001"
                    className="mt-1.5"
                  />
                </div>
                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !withdrawAmount}
                  className="gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">⚠️ Use for emergency disbursements, refunds, or corrections only. All withdrawals are logged with audit trails.</p>
            </div>

            {/* Wallet Status Messages */}
            {(walletData?.balance || 0) >= 50000000 && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Wallet Healthy - Ready for Operations
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Sufficient funds for collector and vendor disbursements. Auto-disbursement enabled.
                  </p>
                </div>
              </div>
            )}
            {(walletData?.balance || 0) > 10000000 && (walletData?.balance || 0) < 50000000 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Moderate Balance - Monitor Closely
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    Consider adding funds to maintain smooth disbursement operations.
                  </p>
                </div>
              </div>
            )}
            {(walletData?.balance || 0) <= 10000000 && (walletData?.balance || 0) > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Low Balance - Action Required
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Wallet balance is low. Add funds immediately to avoid disbursement delays.
                  </p>
                </div>
              </div>
            )}
            {(walletData?.balance || 0) === 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Empty Wallet - Critical Status
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Cannot process disbursements. Add funds from factory payments, CSR donations, or grants.
                  </p>
                </div>
              </div>
            )}

            {/* End-to-End Flow Diagram */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Complete Ecosystem Flow - Money & Waste Movement
                </p>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 border-purple-200">
                  Integrated System
                </Badge>
              </div>
              
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2">
                <CardContent className="pt-6">
                  <div className="space-y-6 font-mono text-xs">
                    
                    {/* Stage 1: Factory Subscriptions */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-green-500">
                      <p className="font-bold text-green-600 mb-2">💰 STAGE 1: FACTORY PAYMENTS → ADMIN WALLET</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Factory subscribes (Monthly: ₦50K | Annual: ₦500K)</p>
                        <p>├─ Pays per-ton fee (₦5000/ton) on verified shipment</p>
                        <p>├─ Payment via: Paystack | Flutterwave | Remita</p>
                        <p>└─ ✅ CREDITED: Admin Wallet (+₦55K example)</p>
                      </div>
                    </div>

                    {/* Stage 2: Waste Collection */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-blue-500">
                      <p className="font-bold text-blue-600 mb-2">♻️ STAGE 2: COLLECTOR DROPS WASTE → TOKEN GENERATED</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Collector drops 50kg plastic at vendor center</p>
                        <p>├─ QR Token generated: <span className="text-blue-600">WMT-2024-001234</span></p>
                        <p>├─ Weight verified by scale: <span className="font-bold">50.0 kg</span></p>
                        <p>├─ Waste type tagged: <span className="text-orange-600">PLASTIC-PET</span></p>
                        <p>└─ ⏳ STATUS: Pending vendor authentication</p>
                      </div>
                    </div>

                    {/* Stage 3: Vendor Processing */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-purple-500">
                      <p className="font-bold text-purple-600 mb-2">📦 STAGE 3: VENDOR AUTHENTICATES → SHIPMENT PREPARED</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Vendor scans token: <span className="text-purple-600">WMT-2024-001234</span></p>
                        <p>├─ Verifies weight: <span className="font-bold">50kg confirmed</span></p>
                        <p>├─ Quality check: <span className="text-green-600">✅ PASSED</span></p>
                        <p>├─ Aggregates to batch: <span className="text-orange-600">BATCH-002</span> (500kg total)</p>
                        <p>└─ ⏳ STATUS: Ready for factory shipment</p>
                      </div>
                    </div>

                    {/* Stage 4: Factory Confirmation */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-orange-500">
                      <p className="font-bold text-orange-600 mb-2">🏭 STAGE 4: FACTORY RECEIVES → VERIFICATION COMPLETE</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Factory receives batch: <span className="text-orange-600">BATCH-002</span></p>
                        <p>├─ Confirms weight: <span className="font-bold">500kg verified</span></p>
                        <p>├─ Scans all tokens in batch (10 tokens)</p>
                        <p>├─ Per-ton fee charged: ₦5000/ton × 0.5 ton = <span className="font-bold text-green-600">₦2,500</span></p>
                        <p>└─ ✅ CONFIRMED: All tokens authenticated</p>
                      </div>
                    </div>

                    {/* Stage 5: Disbursement Calculation */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-pink-500">
                      <p className="font-bold text-pink-600 mb-2">💳 STAGE 5: ADMIN AUTO-DISBURSES → PAYMENTS RELEASED</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p className="font-bold mb-2">Collector Payout (Token: WMT-2024-001234):</p>
                        <p>├─ Weight: 50kg × Rate: ₦80/kg</p>
                        <p>├─ Calculation: <span className="font-bold text-green-600">₦4,000</span></p>
                        <p>├─ KYC Status: <span className="text-green-600">✅ VERIFIED</span></p>
                        <p>└─ Payment Method: Mobile Money (0812-XXX-XXXX)</p>
                        <p className="mt-2 font-bold">Vendor Payout (Batch: BATCH-002):</p>
                        <p>├─ Weight: 500kg × Handling Fee: ₦15/kg</p>
                        <p>├─ Calculation: <span className="font-bold text-green-600">₦7,500</span></p>
                        <p>├─ KYC Status: <span className="text-green-600">✅ VERIFIED</span></p>
                        <p>└─ Payment Method: Bank Transfer (GTB-012XXXXX)</p>
                        <p className="mt-3 pt-3 border-t font-bold">📊 ADMIN WALLET LEDGER:</p>
                        <p className="text-green-600">├─ INFLOW: ₦2,500 (Factory per-ton fee)</p>
                        <p className="text-red-600">├─ OUTFLOW: -₦4,000 (Collector payout)</p>
                        <p className="text-red-600">├─ OUTFLOW: -₦7,500 (Vendor payout)</p>
                        <p className="font-bold text-orange-600">└─ NET: -₦9,000 (Deficit covered by subscriptions)</p>
                      </div>
                    </div>

                    {/* Stage 6: CSR & Grants */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-indigo-500">
                      <p className="font-bold text-indigo-600 mb-2">🏆 STAGE 6: CSR DONATIONS & GRANTS (Optional Boost)</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Corporate CSR: Dangote Foundation donates ₦500K</p>
                        <p>├─ Tagged for: Youth empowerment program</p>
                        <p>├─ Impact report required: Monthly progress dashboard</p>
                        <p>├─ Government Grant: UNSDG Climate Fund ₦1M</p>
                        <p>├─ Tagged for: CO₂ offset & circular economy</p>
                        <p>└─ ✅ CREDITED: Admin Wallet (+₦1.5M total)</p>
                      </div>
                    </div>

                    {/* Fraud Detection */}
                    <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border-l-4 border-red-500">
                      <p className="font-bold text-red-600 mb-2">🚨 FRAUD DETECTION: AUTOMATED SAFEGUARDS</p>
                      <div className="space-y-1 ml-4 text-muted-foreground">
                        <p>┌─ Duplicate Token Alert: <span className="text-red-600">WMT-2024-001234 scanned twice ❌</span></p>
                        <p>├─ Weight Mismatch: Collector claims 50kg, vendor logs 45kg</p>
                        <p>│  └─ Auto-escalate to admin review queue</p>
                        <p>├─ Velocity Check: Same collector drops 500kg in 1 hour ⚠️</p>
                        <p>│  └─ Flag for manual verification</p>
                        <p>├─ KYC Validation: No payout until NIN verified</p>
                        <p>└─ ✅ IMMUTABLE LEDGER: Every transaction token-linked</p>
                      </div>
                    </div>

                    {/* Final Summary */}
                    <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-500">
                      <p className="font-bold text-green-700 dark:text-green-400 mb-3">✅ COMPLETE CYCLE SUMMARY</p>
                      <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                        <div>
                          <p className="font-bold text-green-600">💰 MONEY FLOW:</p>
                          <p>Factory → Admin → Collectors/Vendors</p>
                          <p className="text-xs mt-1">Centralized • Auditable • Token-verified</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">♻️ WASTE FLOW:</p>
                          <p>Collectors → Vendors → Factories</p>
                          <p className="text-xs mt-1">Trackable • Authenticated • Verified</p>
                        </div>
                        <div>
                          <p className="font-bold text-purple-600">📊 KEY METRICS:</p>
                          <p>• 1,200 tons processed this month</p>
                          <p>• 450 collectors active</p>
                          <p>• 45 factories subscribed</p>
                        </div>
                        <div>
                          <p className="font-bold text-orange-600">🌍 IMPACT:</p>
                          <p>• 2,400 tons CO₂ offset</p>
                          <p>• 680 jobs created</p>
                          <p>• 6 UN SDGs aligned</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
              
              <p className="text-xs text-muted-foreground mt-3 text-center">
                💡 <span className="font-semibold">Professional Note:</span> This token-based payment flow ensures transparency, prevents fraud, and provides immutable audit trails for regulatory compliance and impact reporting.
              </p>
            </div>

          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-12 shadow-md">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="payment-links" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-2">
              <Shield className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="gamification" className="gap-2">
              <Award className="h-4 w-4" />
              Gamification
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Camera className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="rates" className="gap-2">
              <Settings className="h-4 w-4" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* User Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Total Collectors
                    </CardDescription>
                    <CardTitle className="text-3xl">1,230</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="default" className="bg-green-500">✅ Verified: 85%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      Total Vendors
                    </CardDescription>
                    <CardTitle className="text-3xl">320</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="default" className="bg-green-500">✅ Verified: 90%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-orange-500" />
                      Total Factories
                    </CardDescription>
                    <CardTitle className="text-3xl">45</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="default" className="bg-blue-500">📋 Active Subscriptions: 42</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Pending Approvals
                    </CardDescription>
                    <CardTitle className="text-3xl">15%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>235 KYC pending review</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transaction Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                Transaction Ledger Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Verified Tokens
                    </CardDescription>
                    <CardTitle className="text-3xl">8,450</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>All stages completed</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      Pending Tokens
                    </CardDescription>
                    <CardTitle className="text-3xl">342</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Awaiting factory verification</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-cyan-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Recycle className="h-4 w-4 text-cyan-500" />
                      Total Waste Processed
                    </CardDescription>
                    <CardTitle className="text-3xl">1,200 tons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>+15% this month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Fraud Alerts
                    </CardDescription>
                    <CardTitle className="text-3xl">2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <span>Duplicate tokens detected</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Payment Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Payment Flow Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                      Incoming (Factories)
                    </CardDescription>
                    <CardTitle className="text-2xl">₦12,500,000</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Subscriptions: ₦4,500,000</p>
                      <p>Per-ton payments: ₦8,000,000</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <ArrowUpFromLine className="h-4 w-4 text-rose-500" />
                      Outgoing (Disbursed)
                    </CardDescription>
                    <CardTitle className="text-2xl">₦9,800,000</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Collectors: ₦6,200,000</p>
                      <p>Vendors: ₦3,600,000</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-amber-500" />
                      Pending Disbursements
                    </CardDescription>
                    <CardTitle className="text-2xl">₦2,700,000</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p>Awaiting shipment verification</p>
                      <p>158 pending transactions</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Analytics & Impact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Impact & Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-green-600 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      CO₂ Offset
                    </CardDescription>
                    <CardTitle className="text-3xl">3,500 tons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Environmental impact</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Jobs Created
                    </CardDescription>
                    <CardTitle className="text-3xl">2,100</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Active participants earning</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-600 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                      Community Participation
                    </CardDescription>
                    <CardTitle className="text-3xl">92%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Active user engagement</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-600 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-orange-600" />
                      Factory Subscriptions
                    </CardDescription>
                    <CardTitle className="text-3xl">42/45</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>3 pending renewal</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Latest platform events and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Token TRX-PLST-8451 verified</p>
                      <p className="text-xs text-muted-foreground">Factory F-12 confirmed shipment from Vendor V-205</p>
                    </div>
                    <span className="text-xs text-muted-foreground">5 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment disbursed: ₦24,500</p>
                      <p className="text-xs text-muted-foreground">Collector C-1045 received payment for 45kg waste</p>
                    </div>
                    <span className="text-xs text-muted-foreground">12 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">KYC verification approved</p>
                      <p className="text-xs text-muted-foreground">Vendor V-320 identity verified successfully</p>
                    </div>
                    <span className="text-xs text-muted-foreground">34 min ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fraud alert: Duplicate token detected</p>
                      <p className="text-xs text-muted-foreground">Token TRX-METL-4523 flagged for review</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Factory subscription renewed</p>
                      <p className="text-xs text-muted-foreground">F-08 renewed annual subscription for ₦500,000</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage collectors, vendors, factories, and KYC verification</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="collector">Collectors</SelectItem>
                        <SelectItem value="vendor">Vendors</SelectItem>
                        <SelectItem value="factory">Factories</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-status">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">All Status</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending KYC</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs">C-1023</TableCell>
                      <TableCell className="font-medium">Amos Okafor</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Collector</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">NIN Verified</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Jan 15, 2024</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                            <Ban className="h-3 w-3" />
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs">V-201</TableCell>
                      <TableCell className="font-medium">Green Recyclers Ltd</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">Vendor</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">CAC Verified</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Feb 3, 2024</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                            <Ban className="h-3 w-3" />
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs">F-12</TableCell>
                      <TableCell className="font-medium">Lagos Plastics Industries</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50">Factory</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">License Valid</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Dec 10, 2023</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                            <Ban className="h-3 w-3" />
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-yellow-50/30">
                      <TableCell className="font-mono text-xs">C-1045</TableCell>
                      <TableCell className="font-medium">Faith Adeyemi</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Collector</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500">Pending ⏳</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Voter Card Pending</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 1, 2024</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                            <UserCheck className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                            <UserX className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-yellow-50/30">
                      <TableCell className="font-mono text-xs">V-205</TableCell>
                      <TableCell className="font-medium">EcoWaste Solutions</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">Vendor</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500">Pending ⏳</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Awaiting Docs</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 5, 2024</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                            <UserCheck className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                            <UserX className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing 5 of 1,595 users
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Previous</Button>
                    <Button size="sm" variant="outline">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced KYC System */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Enhanced KYC Verification System
                </CardTitle>
                <CardDescription>Tiered verification badges and multi-factor authentication</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Verification Tiers */}
                <div>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Tiered Verification Badges
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border-2 border-bronze bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-200 rounded-lg">
                          <Award className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-amber-900 dark:text-amber-100">Basic Tier</h5>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">Bronze Badge</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                        <p>✓ Phone number verified</p>
                        <p>✓ Email confirmed</p>
                        <p>✓ Basic profile completed</p>
                        <p className="font-medium mt-2">Benefits: Access to platform, limited transactions</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-300 rounded-lg">
                          <Award className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">Silver Tier</h5>
                          <Badge variant="outline" className="bg-gray-200 text-gray-800 text-xs">Silver Badge</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-800 dark:text-gray-200 space-y-1">
                        <p>✓ ID uploaded (NIN/Voter's Card)</p>
                        <p>✓ Photo verification</p>
                        <p>✓ Address confirmed</p>
                        <p className="font-medium mt-2">Benefits: Higher transaction limits, priority support</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-200 rounded-lg">
                          <Award className="h-5 w-5 text-yellow-700" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-yellow-900 dark:text-yellow-100">Gold Tier</h5>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">Gold Badge</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                        <p>✓ Biometric authentication</p>
                        <p>✓ Bank account verified</p>
                        <p>✓ Background check completed</p>
                        <p className="font-medium mt-2">Benefits: Unlimited transactions, instant disbursements</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Methods */}
                <div>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Enhanced Verification Methods
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Voter's Card OCR</p>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Automatic data extraction from voter's card images</p>
                    </div>

                    <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="h-4 w-4 text-green-600" />
                        <p className="text-xs font-medium text-green-900 dark:text-green-100">Photo Verification</p>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">Live photo capture for identity matching</p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Fingerprint className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-medium text-purple-900 dark:text-purple-100">Biometric Auth</p>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Fingerprint/face ID for high-value users</p>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 dark:bg-orange-950/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100">GPS Verification</p>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Location confirmation for collectors</p>
                    </div>
                  </div>
                </div>

                {/* KYC Statistics */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-accent">
                      <p className="text-2xl font-bold">780</p>
                      <p className="text-xs text-muted-foreground">Gold Tier Users</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent">
                      <p className="text-2xl font-bold">1,245</p>
                      <p className="text-xs text-muted-foreground">Silver Tier Users</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent">
                      <p className="text-2xl font-bold">2,340</p>
                      <p className="text-xs text-muted-foreground">Basic Tier Users</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent">
                      <p className="text-2xl font-bold">93%</p>
                      <p className="text-xs text-muted-foreground">Overall Verification Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Ledger Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileBarChart className="h-5 w-5" />
                      Transaction Token Ledger
                    </CardTitle>
                    <CardDescription>Complete list of all waste transaction tokens</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tokens</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="text" placeholder="Search token..." className="w-[200px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token ID</TableHead>
                      <TableHead>Collector</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Factory</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs font-semibold">TRX-PLST-8451</TableCell>
                      <TableCell className="text-sm">C-1023</TableCell>
                      <TableCell className="text-sm">V-201</TableCell>
                      <TableCell className="text-sm">F-12</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Plastic</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">45 kg</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 10, 2024</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-yellow-50/30">
                      <TableCell className="font-mono text-xs font-semibold">TRX-METL-4523</TableCell>
                      <TableCell className="text-sm">C-1045</TableCell>
                      <TableCell className="text-sm">V-205</TableCell>
                      <TableCell className="text-sm">F-15</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50">Metal</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">62 kg</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-500">Pending ⏳</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 11, 2024</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs font-semibold">TRX-PLST-8449</TableCell>
                      <TableCell className="text-sm">C-1032</TableCell>
                      <TableCell className="text-sm">V-201</TableCell>
                      <TableCell className="text-sm">F-12</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Plastic</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">38 kg</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 9, 2024</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-red-50/30">
                      <TableCell className="font-mono text-xs font-semibold">TRX-METL-4522</TableCell>
                      <TableCell className="text-sm">C-1045</TableCell>
                      <TableCell className="text-sm">V-203</TableCell>
                      <TableCell className="text-sm">-</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50">Metal</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">62 kg</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-500">Flagged 🚩</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 11, 2024</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs font-semibold">TRX-ORGN-3211</TableCell>
                      <TableCell className="text-sm">C-1027</TableCell>
                      <TableCell className="text-sm">V-207</TableCell>
                      <TableCell className="text-sm">F-08</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">Organic</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">120 kg</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Verified ✅</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 8, 2024</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing 5 of 8,792 transaction tokens
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Previous</Button>
                    <Button size="sm" variant="outline">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Details Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Shipment Verification Rate</CardDescription>
                  <CardTitle className="text-2xl">96.2%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">8,450 of 8,792 verified</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Average Processing Time</CardDescription>
                  <CardTitle className="text-2xl">2.3 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">From collection to payment</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Fraud Detection Rate</CardDescription>
                  <CardTitle className="text-2xl">0.02%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">2 flagged tokens detected</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Management Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incoming Payments */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <ArrowDownToLine className="h-5 w-5" />
                    Incoming Payments (Factories → Company)
                  </CardTitle>
                  <CardDescription>Track subscription fees and per-ton payments</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div>
                        <p className="text-sm font-medium text-emerald-900">Total Received This Month</p>
                        <p className="text-2xl font-bold text-emerald-700">₦12,500,000</p>
                      </div>
                      <div className="p-3 bg-emerald-200 rounded-lg">
                        <ArrowDownToLine className="h-6 w-6 text-emerald-700" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-accent">
                        <div>
                          <p className="font-medium text-sm">Subscription Payments</p>
                          <p className="text-xs text-muted-foreground">Monthly & Annual packages</p>
                        </div>
                        <p className="font-bold text-lg">₦4,500,000</p>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-accent">
                        <div>
                          <p className="font-medium text-sm">Per-Ton Payments</p>
                          <p className="text-xs text-muted-foreground">1,200 tons @ avg ₦6,667/ton</p>
                        </div>
                        <p className="font-bold text-lg">₦8,000,000</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Recent Factory Payments</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Factory className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Lagos Plastics Industries</p>
                              <p className="text-xs text-muted-foreground">45 tons received</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">₦300,000</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <Factory className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">EcoPlast Manufacturing</p>
                              <p className="text-xs text-muted-foreground">Annual subscription</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">₦500,000</p>
                            <p className="text-xs text-muted-foreground">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outgoing Payments */}
              <Card className="shadow-md">
                <CardHeader className="border-b bg-rose-50">
                  <CardTitle className="flex items-center gap-2 text-rose-700">
                    <ArrowUpFromLine className="h-5 w-5" />
                    Outgoing Payments (Company → Collectors/Vendors)
                  </CardTitle>
                  <CardDescription>Automated disbursements after verification</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-rose-50 border border-rose-200">
                      <div>
                        <p className="text-sm font-medium text-rose-900">Total Disbursed This Month</p>
                        <p className="text-2xl font-bold text-rose-700">₦9,800,000</p>
                      </div>
                      <div className="p-3 bg-rose-200 rounded-lg">
                        <ArrowUpFromLine className="h-6 w-6 text-rose-700" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-accent">
                        <div>
                          <p className="font-medium text-sm">Collector Payments</p>
                          <p className="text-xs text-muted-foreground">Per kg collected</p>
                        </div>
                        <p className="font-bold text-lg">₦6,200,000</p>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-accent">
                        <div>
                          <p className="font-medium text-sm">Vendor Payments</p>
                          <p className="text-xs text-muted-foreground">Authentication & transfer fees</p>
                        </div>
                        <p className="font-bold text-lg">₦3,600,000</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Recent Disbursements</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Amos Okafor (C-1023)</p>
                              <p className="text-xs text-muted-foreground">45kg plastic collected</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">₦24,500</p>
                            <p className="text-xs text-green-600">✅ Paid</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Green Recyclers (V-201)</p>
                              <p className="text-xs text-muted-foreground">Authentication fee</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">₦12,000</p>
                            <p className="text-xs text-green-600">✅ Paid</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Queue */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-amber-50">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Coins className="h-5 w-5" />
                  Payment Queue (Pending Disbursements)
                </CardTitle>
                <CardDescription>Linked to verified tokens - ready for payment release</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token ID</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Verified At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs">TRX-METL-4523</TableCell>
                      <TableCell className="font-medium">Faith Adeyemi</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Collector</Badge>
                      </TableCell>
                      <TableCell className="font-bold">₦31,000</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 11, 14:30</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Release Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-mono text-xs">TRX-METL-4523</TableCell>
                      <TableCell className="font-medium">EcoWaste Solutions</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">Vendor</Badge>
                      </TableCell>
                      <TableCell className="font-bold">₦15,500</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Mar 11, 14:30</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Release Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Total Pending: ₦2,700,000</p>
                      <p className="text-xs text-amber-700 mt-1">158 transactions awaiting shipment verification before payment release</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Payment Audit Trail
                </CardTitle>
                <CardDescription>Every payment logged with token ID, timestamp, and user ID</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✅ All payments are automatically logged to the transactions table</p>
                  <p>✅ Each payment is linked to its transaction token for full traceability</p>
                  <p>✅ Timestamps and user IDs ensure complete transparency</p>
                  <p>✅ Audit logs available for compliance and dispute resolution</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waste Metrics */}
              <Card>
                <CardHeader className="border-b bg-cyan-50">
                  <CardTitle className="flex items-center gap-2 text-cyan-700">
                    <Recycle className="h-5 w-5" />
                    Waste Metrics
                  </CardTitle>
                  <CardDescription>Total waste collected, recycled, and transferred</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Total Collected</p>
                      <p className="text-xs text-muted-foreground">All waste types</p>
                    </div>
                    <p className="text-2xl font-bold">1,200 tons</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Plastic Waste</p>
                      <p className="text-xs text-muted-foreground">45% of total</p>
                    </div>
                    <p className="text-2xl font-bold">540 tons</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Metal Waste</p>
                      <p className="text-xs text-muted-foreground">35% of total</p>
                    </div>
                    <p className="text-2xl font-bold">420 tons</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Organic Waste</p>
                      <p className="text-xs text-muted-foreground">20% of total</p>
                    </div>
                    <p className="text-2xl font-bold">240 tons</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader className="border-b bg-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <DollarSign className="h-5 w-5" />
                    Financial Metrics
                  </CardTitle>
                  <CardDescription>Total payments received and disbursed</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Revenue (Factories)</p>
                      <p className="text-xs text-emerald-700">This month</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">₦12.5M</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
                    <div>
                      <p className="text-sm font-medium text-rose-900">Disbursements</p>
                      <p className="text-xs text-rose-700">Collectors & Vendors</p>
                    </div>
                    <p className="text-2xl font-bold text-rose-700">₦9.8M</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Net Revenue</p>
                      <p className="text-xs text-blue-700">Platform earnings</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">₦2.7M</p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Avg Transaction Value</p>
                      <p className="text-xs text-muted-foreground">Per verified token</p>
                    </div>
                    <p className="text-2xl font-bold">₦1,480</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Metrics */}
            <Card>
              <CardHeader className="border-b bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Leaf className="h-5 w-5" />
                  Environmental Impact Metrics
                </CardTitle>
                <CardDescription>CO₂ offset, jobs created, and community participation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-green-50 border border-green-200">
                    <Leaf className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-4xl font-bold text-green-700">3,500</p>
                    <p className="text-sm font-medium text-green-900 mt-2">tons CO₂ Offset</p>
                    <p className="text-xs text-green-700 mt-1">Equivalent to planting 58,000 trees</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-blue-50 border border-blue-200">
                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-4xl font-bold text-blue-700">2,100</p>
                    <p className="text-sm font-medium text-blue-900 mt-2">Jobs Created</p>
                    <p className="text-xs text-blue-700 mt-1">Active income-earning participants</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-purple-50 border border-purple-200">
                    <Activity className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-4xl font-bold text-purple-700">92%</p>
                    <p className="text-sm font-medium text-purple-900 mt-2">Participation Rate</p>
                    <p className="text-xs text-purple-700 mt-1">Active community engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factory Subscriptions */}
            <Card>
              <CardHeader className="border-b bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Factory className="h-5 w-5" />
                  Factory Subscriptions Overview
                </CardTitle>
                <CardDescription>Active monthly/annual packages and renewal dates</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm font-medium">Active Subscriptions</p>
                      <p className="text-xs text-muted-foreground">Monthly & Annual</p>
                    </div>
                    <p className="text-3xl font-bold">42/45</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div>
                      <p className="text-sm font-medium text-amber-900">Pending Renewals</p>
                      <p className="text-xs text-amber-700">Expiring this month</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">3</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factory</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-medium">Lagos Plastics Industries</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Annual</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₦500,000</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Dec 10, 2024</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">Active ✅</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-amber-50/30">
                      <TableCell className="font-medium">EcoPlast Manufacturing</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50">Monthly</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₦50,000</TableCell>
                      <TableCell className="text-xs text-amber-700">Mar 25, 2024</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-500">Expiring Soon ⏳</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Enhanced Analytics: Waste Type Breakdown */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Waste Type Breakdown & Analysis
                </CardTitle>
                <CardDescription>Detailed composition analysis by waste category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-blue-700">Plastic Waste</CardDescription>
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-3xl text-blue-700">540 tons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">% of Total</span>
                          <span className="font-bold text-blue-700">45%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-blue-600">Revenue</span>
                          <span className="font-semibold text-blue-700">₦5.4M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-gray-700">Metal Waste</CardDescription>
                        <Coins className="h-5 w-5 text-gray-600" />
                      </div>
                      <CardTitle className="text-3xl text-gray-700">420 tons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-700">% of Total</span>
                          <span className="font-bold text-gray-700">35%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{width: '35%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-semibold text-gray-700">₦4.2M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-green-700">Organic Waste</CardDescription>
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-3xl text-green-700">240 tons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-700">% of Total</span>
                          <span className="font-bold text-green-700">20%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-green-600">Revenue</span>
                          <span className="font-semibold text-green-700">₦2.4M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-orange-700">Other Materials</CardDescription>
                        <Factory className="h-5 w-5 text-orange-600" />
                      </div>
                      <CardTitle className="text-3xl text-orange-700">0 tons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-700">% of Total</span>
                          <span className="font-bold text-orange-700">0%</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: '0%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-orange-600">Revenue</span>
                          <span className="font-semibold text-orange-700">₦0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border bg-accent">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Top Performing Categories
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                        <span className="text-sm font-medium text-blue-900">Plastic (PET bottles)</span>
                        <span className="text-sm font-bold text-blue-700">320 tons</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <span className="text-sm font-medium text-gray-900">Metal (Aluminum cans)</span>
                        <span className="text-sm font-bold text-gray-700">280 tons</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-green-50">
                        <span className="text-sm font-medium text-green-900">Organic (Food waste)</span>
                        <span className="text-sm font-bold text-green-700">180 tons</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-accent">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Growth Opportunities
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-orange-50">
                        <span className="text-sm font-medium text-orange-900">E-waste potential</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">High Value</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50">
                        <span className="text-sm font-medium text-purple-900">Glass recycling</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">Untapped</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-teal-50">
                        <span className="text-sm font-medium text-teal-900">Textile waste</span>
                        <Badge variant="outline" className="bg-teal-100 text-teal-700">Emerging</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Performance Analysis */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Regional Performance Analysis (Kano State)
                </CardTitle>
                <CardDescription>Local Government Area breakdown and collection hotspots</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-purple-700">Top Performing LGA</CardDescription>
                      <CardTitle className="text-2xl text-purple-700">Nassarawa LGA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-700">Total Waste</span>
                          <span className="font-bold text-purple-700">380 tons</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-700">Active Collectors</span>
                          <span className="font-bold text-purple-700">450</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-700">Revenue</span>
                          <span className="font-bold text-purple-700">₦3.8M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-700">Second Best LGA</CardDescription>
                      <CardTitle className="text-2xl text-blue-700">Kano Municipal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">Total Waste</span>
                          <span className="font-bold text-blue-700">320 tons</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">Active Collectors</span>
                          <span className="font-bold text-blue-700">380</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">Revenue</span>
                          <span className="font-bold text-blue-700">₦3.2M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-green-700">Emerging LGA</CardDescription>
                      <CardTitle className="text-2xl text-green-700">Fagge LGA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-700">Total Waste</span>
                          <span className="font-bold text-green-700">280 tons</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-700">Active Collectors</span>
                          <span className="font-bold text-green-700">320</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-700">Revenue</span>
                          <span className="font-bold text-green-700">₦2.8M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local Government Area</TableHead>
                      <TableHead>Active Collectors</TableHead>
                      <TableHead>Total Waste (tons)</TableHead>
                      <TableHead>Revenue Generated</TableHead>
                      <TableHead>Growth Rate</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-accent bg-purple-50/30">
                      <TableCell className="font-medium">Nassarawa</TableCell>
                      <TableCell>450</TableCell>
                      <TableCell className="font-semibold">380 tons</TableCell>
                      <TableCell>₦3,800,000</TableCell>
                      <TableCell className="text-green-600 font-semibold">+22%</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-purple-600">⭐ Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-medium">Kano Municipal</TableCell>
                      <TableCell>380</TableCell>
                      <TableCell className="font-semibold">320 tons</TableCell>
                      <TableCell>₦3,200,000</TableCell>
                      <TableCell className="text-green-600 font-semibold">+18%</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-blue-600">Very Good</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-medium">Fagge</TableCell>
                      <TableCell>320</TableCell>
                      <TableCell className="font-semibold">280 tons</TableCell>
                      <TableCell>₦2,800,000</TableCell>
                      <TableCell className="text-green-600 font-semibold">+15%</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">Good</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent">
                      <TableCell className="font-medium">Gwale</TableCell>
                      <TableCell>240</TableCell>
                      <TableCell className="font-semibold">200 tons</TableCell>
                      <TableCell>₦2,000,000</TableCell>
                      <TableCell className="text-blue-600 font-semibold">+12%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">Average</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-accent bg-amber-50/30">
                      <TableCell className="font-medium">Tarauni</TableCell>
                      <TableCell>180</TableCell>
                      <TableCell className="font-semibold">120 tons</TableCell>
                      <TableCell>₦1,200,000</TableCell>
                      <TableCell className="text-amber-600 font-semibold">+8%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-500">Needs Support</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Financial Forecasting Dashboard */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Financial Forecasting & Projections
                </CardTitle>
                <CardDescription>Expected inflows, outflows, and 6-month revenue forecast</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-emerald-700">Expected Inflows</CardDescription>
                        <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                      </div>
                      <CardTitle className="text-3xl text-emerald-700">₦15.2M</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-700">Factory Payments</span>
                          <span className="font-bold text-emerald-700">₦13.5M</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-700">CSR & Grants</span>
                          <span className="font-bold text-emerald-700">₦1.7M</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-2">Next 30 days forecast</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-rose-700">Expected Outflows</CardDescription>
                        <ArrowUpFromLine className="h-5 w-5 text-rose-600" />
                      </div>
                      <CardTitle className="text-3xl text-rose-700">₦10.8M</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-rose-700">Collector Payments</span>
                          <span className="font-bold text-rose-700">₦6.5M</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-rose-700">Vendor Payments</span>
                          <span className="font-bold text-rose-700">₦4.3M</span>
                        </div>
                        <p className="text-xs text-rose-600 mt-2">Next 30 days forecast</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription className="text-blue-700">Net Profit Forecast</CardDescription>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-3xl text-blue-700">₦4.4M</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">Profit Margin</span>
                          <span className="font-bold text-blue-700">28.9%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-700">vs Last Month</span>
                          <span className="font-bold text-green-600">+12% ↗</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Next 30 days projection</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border bg-accent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        6-Month Revenue Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div>
                            <p className="text-sm font-medium text-blue-900">April 2024</p>
                            <p className="text-xs text-blue-700">Estimated revenue</p>
                          </div>
                          <p className="text-lg font-bold text-blue-700">₦15.2M</p>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                          <div>
                            <p className="text-sm font-medium text-green-900">May 2024</p>
                            <p className="text-xs text-green-700">Growth expected +15%</p>
                          </div>
                          <p className="text-lg font-bold text-green-700">₦17.5M</p>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50 border border-teal-200">
                          <div>
                            <p className="text-sm font-medium text-teal-900">June 2024</p>
                            <p className="text-xs text-teal-700">Peak season boost</p>
                          </div>
                          <p className="text-lg font-bold text-teal-700">₦19.8M</p>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                          <div>
                            <p className="text-sm font-medium text-purple-900">Q3 2024 Average</p>
                            <p className="text-xs text-purple-700">July - September</p>
                          </div>
                          <p className="text-lg font-bold text-purple-700">₦21.2M/mo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border bg-accent">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        Key Financial Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-600">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-green-900">Strong Growth Trajectory</p>
                              <p className="text-xs text-green-700 mt-1">Monthly revenue increasing by avg 15% - on track to hit ₦20M by Q3</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-600">
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Healthy Profit Margins</p>
                              <p className="text-xs text-blue-700 mt-1">28.9% net margin with room for scale - can invest in expansion</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50 border-l-4 border-amber-600">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-amber-900">Cash Flow Optimization</p>
                              <p className="text-xs text-amber-700 mt-1">Maintain ₦5M+ buffer for smooth operations - consider reserve fund</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-purple-50 border-l-4 border-purple-600">
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-purple-900">Expansion Opportunity</p>
                              <p className="text-xs text-purple-700 mt-1">Revenue supports opening 3 new LGAs by Q4 with strong ROI potential</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Impact Dashboard for Sponsors */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  Impact Dashboard for Sponsors & Stakeholders
                </CardTitle>
                <CardDescription>Share-ready metrics for CSR reports, grants, and investor presentations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <Leaf className="h-8 w-8 text-green-600 mb-2" />
                      <CardDescription className="text-green-700">Environmental Impact</CardDescription>
                      <CardTitle className="text-3xl text-green-700">3,500 tons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-green-700">CO₂ offset ≈ 58,000 trees planted</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <Users className="h-8 w-8 text-blue-600 mb-2" />
                      <CardDescription className="text-blue-700">Social Impact</CardDescription>
                      <CardTitle className="text-3xl text-blue-700">2,100</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-blue-700">Jobs created for youth & women</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader className="pb-2">
                      <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                      <CardDescription className="text-purple-700">Economic Impact</CardDescription>
                      <CardTitle className="text-3xl text-purple-700">₦9.8M</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-purple-700">Disbursed to collectors & vendors</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardHeader className="pb-2">
                      <Activity className="h-8 w-8 text-orange-600 mb-2" />
                      <CardDescription className="text-orange-700">Community Reach</CardDescription>
                      <CardTitle className="text-3xl text-orange-700">92%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-orange-700">Active engagement in 44 LGAs</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                  <h4 className="font-semibold text-lg text-indigo-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Sponsor Recognition & ROI
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-white border border-indigo-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Dangote Foundation</p>
                          <p className="text-xs text-muted-foreground">CSR Partner</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contribution</span>
                          <span className="font-semibold">₦5M grant</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impact</span>
                          <span className="font-semibold text-green-600">850 jobs funded</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white border border-indigo-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Kano State Govt</p>
                          <p className="text-xs text-muted-foreground">Government Partner</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contribution</span>
                          <span className="font-semibold">₦3.2M subsidy</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impact</span>
                          <span className="font-semibold text-green-600">1,200 tons processed</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white border border-indigo-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Factory className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Lagos Plastics</p>
                          <p className="text-xs text-muted-foreground">Factory Subscriber</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subscription</span>
                          <span className="font-semibold">₦500K/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Materials</span>
                          <span className="font-semibold text-blue-600">450 tons received</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-900">
                      <strong>Total Sponsorship Impact:</strong> ₦8.2M in funding enabled 1,650 tons of waste processing, 
                      creating 850 direct jobs and offsetting 1,400 tons of CO₂. ROI for sponsors: <strong>320% social value return</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance & Security Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Fraud Detection & Security Alerts
                </CardTitle>
                <CardDescription>Token validation system and fraud prevention</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-green-700">Valid Tokens</CardDescription>
                      <CardTitle className="text-3xl text-green-700">8,790</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-green-600">99.98% validation rate</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-red-700">Flagged Tokens</CardDescription>
                      <CardTitle className="text-3xl text-red-700">2</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-red-600">Duplicate/mismatch detected</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-700">Under Review</CardDescription>
                      <CardTitle className="text-3xl text-blue-700">0</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-blue-600">All alerts resolved</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-900">Duplicate Token Detected</p>
                        <p className="text-sm text-red-700 mt-1">Token TRX-METL-4522 appears to be a duplicate of TRX-METL-4523</p>
                      </div>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <div className="text-xs text-red-700 space-y-1 ml-8">
                      <p>• Same collector (C-1045), vendor (V-203), and weight (62kg)</p>
                      <p>• Created within 5 minutes of each other</p>
                      <p>• Automatic payment hold applied</p>
                    </div>
                    <div className="flex gap-2 mt-4 ml-8">
                      <Button size="sm" variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        Invalidate Token
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Investigate
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900">Weight Mismatch Alert</p>
                        <p className="text-sm text-amber-700 mt-1">Token TRX-PLST-8443 weight differs between vendor and factory</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500">Medium Priority</Badge>
                    </div>
                    <div className="text-xs text-amber-700 space-y-1 ml-8">
                      <p>• Vendor recorded: 50kg</p>
                      <p>• Factory reported: 47kg</p>
                      <p>• Discrepancy: 3kg (6%)</p>
                    </div>
                    <div className="flex gap-2 mt-4 ml-8">
                      <Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700">
                        <CheckCircle className="h-3 w-3" />
                        Accept Factory Weight
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Review Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Repository */}
            <Card>
              <CardHeader className="border-b bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <FileText className="h-5 w-5" />
                  Compliance Document Repository
                </CardTitle>
                <CardDescription>Licenses, permits, and certificates for all entities</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-accent text-center">
                    <p className="text-3xl font-bold">1,230</p>
                    <p className="text-sm text-muted-foreground mt-1">Collector IDs Verified</p>
                    <p className="text-xs text-green-600 mt-2">✅ NIN/Voter Cards</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent text-center">
                    <p className="text-3xl font-bold">320</p>
                    <p className="text-sm text-muted-foreground mt-1">Vendor Licenses</p>
                    <p className="text-xs text-green-600 mt-2">✅ CAC/Business Permits</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent text-center">
                    <p className="text-3xl font-bold">45</p>
                    <p className="text-sm text-muted-foreground mt-1">Factory Certificates</p>
                    <p className="text-xs text-green-600 mt-2">✅ Operating Licenses</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Compliance Features:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>✅ Secure document storage with encryption</p>
                    <p>✅ Automatic expiry notifications for licenses</p>
                    <p>✅ Audit trail for all document access</p>
                    <p>✅ Multi-level verification workflow</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Fraud Prevention System */}
            <Card className="shadow-md border-2 border-red-200">
              <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Shield className="h-5 w-5" />
                  Enhanced Fraud Prevention & Auto-Lockout System
                </CardTitle>
                <CardDescription>Comprehensive audit trail, automatic lockout mechanisms, and escalation workflows</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Fraud Prevention Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <CardDescription className="text-green-700">Clean Accounts</CardDescription>
                      </div>
                      <CardTitle className="text-2xl text-green-700">4,523</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-green-600">99.8% of all users</p>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <CardDescription className="text-amber-700">Under Watch</CardDescription>
                      </div>
                      <CardTitle className="text-2xl text-amber-700">7</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-amber-600">Monitoring for patterns</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-600" />
                        <CardDescription className="text-red-700">Auto-Locked</CardDescription>
                      </div>
                      <CardTitle className="text-2xl text-red-700">3</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-red-600">Suspended accounts</p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Ban className="h-4 w-4 text-purple-600" />
                        <CardDescription className="text-purple-700">Permanently Banned</CardDescription>
                      </div>
                      <CardTitle className="text-2xl text-purple-700">1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-purple-600">Confirmed fraud cases</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Auto-Lockout Rules */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Unlock className="h-5 w-5 text-red-600" />
                    Automatic Lockout Triggers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">Duplicate Token Creation</p>
                          <p className="text-sm text-red-700 mt-1">Auto-lock after 3 duplicate tokens in 24 hours</p>
                          <div className="mt-3 space-y-1 text-xs text-red-600">
                            <p>• Immediate payment hold on all pending tokens</p>
                            <p>• Notification sent to admin for review</p>
                            <p>• Account frozen for 48 hours pending investigation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
                      <div className="flex items-start gap-3">
                        <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-amber-900">Weight Manipulation</p>
                          <p className="text-sm text-amber-700 mt-1">Auto-flag when weight discrepancy {'>'}15%</p>
                          <div className="mt-3 space-y-1 text-xs text-amber-600">
                            <p>• Compare vendor vs factory reported weights</p>
                            <p>• Place token under review (not auto-locked)</p>
                            <p>• Require admin approval for payment release</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-orange-900">Rapid Token Generation</p>
                          <p className="text-sm text-orange-700 mt-1">Auto-watch if {'>'}10 tokens created in 1 hour</p>
                          <div className="mt-3 space-y-1 text-xs text-orange-600">
                            <p>• Add to "Under Watch" list for monitoring</p>
                            <p>• Flag for manual review if pattern continues</p>
                            <p>• No immediate lockout (monitoring phase)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">GPS Location Anomalies</p>
                          <p className="text-sm text-blue-700 mt-1">Auto-flag if location differs by {'>'}50km</p>
                          <div className="mt-3 space-y-1 text-xs text-blue-600">
                            <p>• Compare collection GPS vs usual collector zones</p>
                            <p>• Require photo verification for distant locations</p>
                            <p>• Flag for review if repeated anomalies detected</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Trail Dashboard */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Complete Audit Trail (Last 7 Days)
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-red-50">
                          <TableCell className="text-xs font-mono">2024-03-15 14:23:45</TableCell>
                          <TableCell className="font-medium">C-1045</TableCell>
                          <TableCell className="text-sm">Duplicate Token Created</TableCell>
                          <TableCell className="text-xs text-muted-foreground">TRX-METL-4522 matches TRX-METL-4523</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-xs">High</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-600 text-xs">Auto-Locked</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-amber-50">
                          <TableCell className="text-xs font-mono">2024-03-14 09:17:22</TableCell>
                          <TableCell className="font-medium">V-203</TableCell>
                          <TableCell className="text-sm">Weight Discrepancy</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Vendor: 50kg, Factory: 47kg (6% diff)</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-amber-500 text-xs">Medium</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-600 text-xs">Under Review</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-xs font-mono">2024-03-13 16:42:11</TableCell>
                          <TableCell className="font-medium">C-1032</TableCell>
                          <TableCell className="text-sm">Rapid Token Creation</TableCell>
                          <TableCell className="text-xs text-muted-foreground">12 tokens created in 45 minutes</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">Low</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-500 text-xs">Monitoring</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-green-50">
                          <TableCell className="text-xs font-mono">2024-03-12 11:05:33</TableCell>
                          <TableCell className="font-medium">C-1045</TableCell>
                          <TableCell className="text-sm">Account Unlocked</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Previous lockout resolved by admin</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">Info</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-600 text-xs">Resolved</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-xs font-mono">2024-03-11 08:30:19</TableCell>
                          <TableCell className="font-medium">F-12</TableCell>
                          <TableCell className="text-sm">GPS Verification</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Location confirmed: Kano Industrial Area</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">Info</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-600 text-xs">Verified</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing 5 of 247 audit trail entries
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Export Full Audit Log
                    </Button>
                  </div>
                </div>

                {/* Escalation Workflow */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Flagged Token Escalation Workflow
                  </h3>
                  <div className="p-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">Auto-Detection</p>
                            <p className="text-sm text-red-700">System automatically flags suspicious token based on rules</p>
                          </div>
                        </div>
                        <div className="ml-5 border-l-2 border-purple-300 h-8"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                          <div className="flex-1">
                            <p className="font-semibold text-amber-900">Payment Hold</p>
                            <p className="text-sm text-amber-700">Automatic hold applied to prevent disbursement</p>
                          </div>
                        </div>
                        <div className="ml-5 border-l-2 border-purple-300 h-8"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                          <div className="flex-1">
                            <p className="font-semibold text-blue-900">Admin Notification</p>
                            <p className="text-sm text-blue-700">Email/SMS alert sent to compliance officer</p>
                          </div>
                        </div>
                        <div className="ml-5 border-l-2 border-purple-300 h-8"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                          <div className="flex-1">
                            <p className="font-semibold text-purple-900">Manual Review</p>
                            <p className="text-sm text-purple-700">Admin investigates: Approve, Reject, or Escalate</p>
                          </div>
                        </div>
                        <div className="ml-5 border-l-2 border-purple-300 h-8"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                          <div className="flex-1">
                            <p className="font-semibold text-green-900">Resolution</p>
                            <p className="text-sm text-green-700">Token approved/rejected, payment released/cancelled</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 rounded-lg bg-white border border-purple-200">
                      <p className="text-sm font-medium text-purple-900 mb-2">Escalation SLAs:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-red-700">High Priority:</span>
                          <span className="text-red-600"> Review within 2 hours</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-700">Medium Priority:</span>
                          <span className="text-amber-600"> Review within 24 hours</span>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-700">Low Priority:</span>
                          <span className="text-blue-600"> Review within 72 hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tiered Factory Subscription Packages */}
            <Card className="shadow-md border-2 border-orange-200">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Building2 className="h-5 w-5" />
                  Tiered Factory Subscription Packages
                </CardTitle>
                <CardDescription>Flexible pricing tiers for factories of all sizes - from small startups to large enterprises</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Subscription Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Package */}
                  <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-blue-900">Starter</CardTitle>
                      <CardDescription className="text-blue-700 font-medium">Perfect for small factories & startups</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4 bg-white rounded-lg border-2 border-blue-200">
                        <p className="text-4xl font-bold text-blue-700">₦100,000</p>
                        <p className="text-sm text-blue-600 mt-1">/month</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">Up to <strong>50 tons/month</strong> processing capacity</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">Access to <strong>verified collector network</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">Basic <strong>token authentication</strong> system</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">Standard <strong>payment processing</strong> (3-5 days)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-900">Email support <strong>(48hr response)</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 line-through">Analytics dashboard</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 line-through">Priority collector matching</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Select Starter Plan
                        </Button>
                      </div>
                      <div className="text-xs text-center text-blue-600">
                        <p className="font-semibold">Overage: ₦2,500/ton beyond cap</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Standard Package */}
                  <Card className="border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-2xl transition-shadow relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-purple-900">Standard</CardTitle>
                      <CardDescription className="text-purple-700 font-medium">Ideal for growing operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4 bg-white rounded-lg border-2 border-purple-300">
                        <p className="text-4xl font-bold text-purple-700">₦1,000,000</p>
                        <p className="text-sm text-purple-600 mt-1">/year <span className="text-xs">(Save ₦200K vs monthly)</span></p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900">Up to <strong>200 tons/month</strong> processing capacity</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900"><strong>Priority collector matching</strong> algorithm</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900">Advanced <strong>token authentication + QR codes</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900">Fast <strong>payment processing (1-2 days)</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900"><strong>Full analytics dashboard</strong> with insights</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900">Dedicated account manager <strong>(24hr response)</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-900">Quarterly <strong>compliance reports</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 line-through">API integration</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Select Standard Plan
                        </Button>
                      </div>
                      <div className="text-xs text-center text-purple-600">
                        <p className="font-semibold">Overage: ₦2,000/ton beyond cap</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enterprise Package */}
                  <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-3">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-amber-900">Enterprise</CardTitle>
                      <CardDescription className="text-amber-700 font-medium">For large-scale operations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4 bg-white rounded-lg border-2 border-yellow-300">
                        <p className="text-4xl font-bold text-amber-700">₦5,000,000</p>
                        <p className="text-sm text-amber-600 mt-1">/year <span className="text-xs">(Best value)</span></p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>Unlimited tonnage</strong> processing capacity</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>Exclusive collector network</strong> access</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900">Premium <strong>multi-factor authentication</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>Instant payment processing</strong> (same day)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>Custom analytics + AI forecasting</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900">Dedicated support team <strong>(4hr response)</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>Full API integration</strong> with webhooks</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900">Monthly <strong>compliance + impact reports</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-900"><strong>White-label branding</strong> options</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700">
                          Select Enterprise Plan
                        </Button>
                      </div>
                      <div className="text-xs text-center text-amber-600">
                        <p className="font-semibold">No overage fees • Unlimited processing</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Per-Ton Pricing Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    Per-Ton Pricing (For All Subscription Tiers)
                  </h3>
                  <Card className="border-2 border-orange-200">
                    <CardContent className="pt-6">
                      <Table>
                        <TableHeader className="bg-orange-50">
                          <TableRow>
                            <TableHead>Waste Type</TableHead>
                            <TableHead>Base Rate (per ton)</TableHead>
                            <TableHead>Starter Overage</TableHead>
                            <TableHead>Standard Overage</TableHead>
                            <TableHead>Quality Premium</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              Plastic Waste
                            </TableCell>
                            <TableCell className="font-semibold">₦8,000/ton</TableCell>
                            <TableCell className="text-sm">₦2,500/ton</TableCell>
                            <TableCell className="text-sm">₦2,000/ton</TableCell>
                            <TableCell className="text-xs text-green-600">+₦1,500 if sorted</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                              Metal Waste
                            </TableCell>
                            <TableCell className="font-semibold">₦12,000/ton</TableCell>
                            <TableCell className="text-sm">₦3,000/ton</TableCell>
                            <TableCell className="text-sm">₦2,500/ton</TableCell>
                            <TableCell className="text-xs text-green-600">+₦2,000 if sorted</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                              Paper Waste
                            </TableCell>
                            <TableCell className="font-semibold">₦4,500/ton</TableCell>
                            <TableCell className="text-sm">₦1,500/ton</TableCell>
                            <TableCell className="text-sm">₦1,200/ton</TableCell>
                            <TableCell className="text-xs text-green-600">+₦800 if dry</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Organic Waste
                            </TableCell>
                            <TableCell className="font-semibold">₦2,000/ton</TableCell>
                            <TableCell className="text-sm">₦800/ton</TableCell>
                            <TableCell className="text-sm">₦600/ton</TableCell>
                            <TableCell className="text-xs text-green-600">+₦500 if composted</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-2">Pricing Notes:</p>
                        <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
                          <li><strong>Base Rate:</strong> Standard payment rate within subscription capacity</li>
                          <li><strong>Overage Rate:</strong> Applied only when monthly tonnage exceeds tier cap</li>
                          <li><strong>Quality Premium:</strong> Bonus payment for sorted/processed waste (auto-credited)</li>
                          <li><strong>Enterprise Tier:</strong> No overage fees, base rates apply to all tonnage</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Subscription Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Factory className="h-5 w-5 text-blue-600" />
                    Active Factory Subscriptions (All Tiers)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-blue-700">Starter Tier</CardDescription>
                        <CardTitle className="text-3xl text-blue-700">18 factories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-blue-600">₦1.8M monthly revenue</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-purple-700">Standard Tier</CardDescription>
                        <CardTitle className="text-3xl text-purple-700">20 factories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-purple-600">₦20M annual revenue</p>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200 bg-amber-50">
                      <CardHeader className="pb-2">
                        <CardDescription className="text-amber-700">Enterprise Tier</CardDescription>
                        <CardTitle className="text-3xl text-amber-700">7 factories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-amber-600">₦35M annual revenue</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                        <div>
                          <p className="text-sm font-medium text-green-900">Total Subscription Revenue (All Tiers)</p>
                          <p className="text-xs text-green-700 mt-1">Recurring annual income from 45 factories</p>
                        </div>
                        <p className="text-4xl font-bold text-green-700">₦57.6M</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Management
                    </CardTitle>
                    <CardDescription>Manage ongoing and planned projects</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <FileText className="h-4 w-4" />
                    Add New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-accent">
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize">
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamification & User Engagement Tab */}
          <TabsContent value="gamification" className="space-y-6">
            {/* Achievement Badges System */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievement Badges & Recognition System
                </CardTitle>
                <CardDescription>Motivate collectors and vendors with tiered achievements</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Bronze Badge */}
                  <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-amber-600 text-white">Bronze Tier</Badge>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-amber-900">Starter Achievers</CardTitle>
                      <CardDescription className="text-amber-700">1-50 tons collected</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-800">Total Users</span>
                          <span className="font-bold text-amber-900">1,850</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-800">Avg Collection</span>
                          <span className="font-bold text-amber-900">28 tons</span>
                        </div>
                        <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200">
                          <p className="text-xs text-amber-800"><strong>Perks:</strong> Basic dashboard, priority pickup</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Silver Badge */}
                  <Card className="border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gray-600 text-white">Silver Tier</Badge>
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-gray-900">Consistent Performers</CardTitle>
                      <CardDescription className="text-gray-700">51-200 tons collected</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">Total Users</span>
                          <span className="font-bold text-gray-900">680</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">Avg Collection</span>
                          <span className="font-bold text-gray-900">125 tons</span>
                        </div>
                        <div className="mt-3 p-2 rounded bg-gray-50 border border-gray-300">
                          <p className="text-xs text-gray-800"><strong>Perks:</strong> +10% bonus, training access, premium support</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gold Badge */}
                  <Card className="border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-600 text-white">Gold Tier</Badge>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-yellow-900">Elite Champions</CardTitle>
                      <CardDescription className="text-yellow-700">200+ tons collected</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-800">Total Users</span>
                          <span className="font-bold text-yellow-900">120</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-800">Avg Collection</span>
                          <span className="font-bold text-yellow-900">350 tons</span>
                        </div>
                        <div className="mt-3 p-2 rounded bg-yellow-50 border border-yellow-300">
                          <p className="text-xs text-yellow-800"><strong>Perks:</strong> +20% bonus, exclusive events, VIP support</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="bg-green-50 border-green-200">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Gamification Impact</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Since launching badges 3 months ago: <strong>+32% collection increase</strong>, <strong>87% engagement rate</strong>, and <strong>480 users</strong> actively progressing to next tier.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Leaderboards */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Top Performers Leaderboard
                </CardTitle>
                <CardDescription>Recognize high achievers and drive healthy competition</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-3 bg-blue-100 border-b border-blue-200">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Top 5 Collectors (March)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400">
                        <span className="text-2xl">🥇</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Aminu Yusuf (C-1089)</p>
                          <p className="text-xs text-yellow-800">Nassarawa LGA</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-yellow-700">42 tons</p>
                          <p className="text-xs text-yellow-800">₦228K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400">
                        <span className="text-2xl">🥈</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Fatima Abubakar (C-1045)</p>
                          <p className="text-xs text-gray-700">Kano Municipal</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-700">38 tons</p>
                          <p className="text-xs text-gray-700">₦206K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400">
                        <span className="text-2xl">🥉</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Ibrahim Musa (C-1027)</p>
                          <p className="text-xs text-amber-800">Fagge LGA</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-amber-700">35 tons</p>
                          <p className="text-xs text-amber-800">₦190K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50">
                        <span className="w-8 text-center font-bold text-blue-600">4</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Aisha Mohammed (C-1032)</p>
                          <p className="text-xs text-muted-foreground">Gwale</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">32 tons</p>
                          <p className="text-xs text-green-600">₦174K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50">
                        <span className="w-8 text-center font-bold text-blue-600">5</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Yusuf Idris (C-1078)</p>
                          <p className="text-xs text-muted-foreground">Tarauni</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">30 tons</p>
                          <p className="text-xs text-green-600">₦163K</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-purple-50/30">
                    <CardHeader className="pb-3 bg-purple-100 border-b border-purple-200">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-600" />
                        Top 5 Vendors (March)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400">
                        <span className="text-2xl">🥇</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Green Recyclers (V-201)</p>
                          <p className="text-xs text-yellow-800">Premium Vendor</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-yellow-700">120 tons</p>
                          <p className="text-xs text-yellow-800">₦540K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400">
                        <span className="text-2xl">🥈</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">EcoSort Hub (V-203)</p>
                          <p className="text-xs text-gray-700">Verified Vendor</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-700">105 tons</p>
                          <p className="text-xs text-gray-700">₦472K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400">
                        <span className="text-2xl">🥉</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm">Waste Warriors (V-205)</p>
                          <p className="text-xs text-amber-800">Verified Vendor</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-amber-700">98 tons</p>
                          <p className="text-xs text-amber-800">₦441K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50">
                        <span className="w-8 text-center font-bold text-purple-600">4</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">RecyclePro (V-207)</p>
                          <p className="text-xs text-muted-foreground">Verified</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">85 tons</p>
                          <p className="text-xs text-green-600">₦382K</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50">
                        <span className="w-8 text-center font-bold text-purple-600">5</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">CleanKano Initiative (V-210)</p>
                          <p className="text-xs text-muted-foreground">Premium</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">78 tons</p>
                          <p className="text-xs text-green-600">₦351K</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Training Modules */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-green-600" />
                  Training Modules & Educational Content
                </CardTitle>
                <CardDescription>Short videos and guides for safe collection practices</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <Badge className="bg-green-600 w-fit mb-2">Beginner</Badge>
                      <CardTitle className="text-lg">Safety First</CardTitle>
                      <CardDescription>Basic safety protocols</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Duration</span>
                          <span className="font-semibold">8 min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-semibold text-green-600">1,850</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">87% completion</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <Badge className="bg-blue-600 w-fit mb-2">Intermediate</Badge>
                      <CardTitle className="text-lg">Waste Sorting 101</CardTitle>
                      <CardDescription>Identify material types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Duration</span>
                          <span className="font-semibold">12 min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-semibold text-blue-600">1,420</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">68% completion</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-3">
                      <Badge className="bg-purple-600 w-fit mb-2">Advanced</Badge>
                      <CardTitle className="text-lg">Maximizing Earnings</CardTitle>
                      <CardDescription>High-value waste tips</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Duration</span>
                          <span className="font-semibold">15 min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-semibold text-purple-600">780</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '52%'}}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">52% completion</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Community Challenges */}
            <Card>
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Community Challenges & Competitions
                </CardTitle>
                <CardDescription>Monthly competitions to boost engagement</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-600">Active</Badge>
                        <span className="text-sm font-semibold text-orange-700 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          12 days left
                        </span>
                      </div>
                      <CardTitle className="text-xl text-orange-900">March Mega Collection</CardTitle>
                      <CardDescription className="text-orange-700">Collect 5+ tons for prizes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 rounded bg-white border border-orange-200">
                          <p className="text-sm font-semibold mb-1">Prizes:</p>
                          <ul className="text-xs space-y-1">
                            <li>🥇 ₦50K + Gold Badge</li>
                            <li>🥈 ₦30K + Silver Badge</li>
                            <li>🥉 ₦20K + Bronze Badge</li>
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Participants</span>
                            <span className="font-bold">1,240</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Total Collected</span>
                            <span className="font-bold">3,800 tons</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-600">Coming Soon</Badge>
                        <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          April 1
                        </span>
                      </div>
                      <CardTitle className="text-xl text-blue-900">Plastic-Free April</CardTitle>
                      <CardDescription className="text-blue-700">2x bonuses on plastic</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 rounded bg-white border border-blue-200">
                          <p className="text-sm font-semibold mb-1">Rewards:</p>
                          <ul className="text-xs space-y-1">
                            <li>💰 Double payment rate</li>
                            <li>🎖️ "Eco Warrior" badge</li>
                            <li>🏆 ₦100K grand prize</li>
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Target</span>
                            <span className="font-bold">1,000 tons</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Duration</span>
                            <span className="font-bold">30 days</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Rates Management Tab */}
          <TabsContent value="rates" className="space-y-6">
            <PaymentRateEditor />
          </TabsContent>

          {/* Event Gallery Management Tab */}
          <TabsContent value="events" className="space-y-6">
            <EventGalleryManagement />
          </TabsContent>

          {/* Price Management Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <PriceManagement />
          </TabsContent>

          {/* Factory Payment Links Tab */}
          <TabsContent value="payment-links" className="space-y-6">
            <FactoryPaymentLinks />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-title">Site Title</Label>
                    <Input id="site-title" defaultValue="KudiChain" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" defaultValue="admin@kudichain.io" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" defaultValue="support@motech.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="ngn">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngn">NGN (₦)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function formatDuration(totalSeconds?: number) {
  if (!totalSeconds || !Number.isFinite(totalSeconds)) {
    return "—";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(1, Math.round(totalSeconds % 60));
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatRelativeTime(timestamp?: string) {
  if (!timestamp) {
    return "just now";
  }
  const target = new Date(timestamp).getTime();
  if (Number.isNaN(target)) {
    return timestamp;
  }
  const diffMs = Date.now() - target;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function formatCurrency(amount: number) {
  if (!Number.isFinite(amount)) {
    return "0";
  }
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
