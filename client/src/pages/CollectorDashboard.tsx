import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportChatbot } from "@/components/SupportChatbot";
import { WalletCard } from "@/components/WalletCard";
import { BankAccountLink } from "@/components/BankAccountLink";
import { PaymentStatements } from "@/components/PaymentStatements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  MapPin,
  DollarSign,
  Star,
  Leaf,
  Zap,
  Trophy,
  PlayCircle,
  BookOpen,
  ChevronRight,
  Receipt,
  Settings,
  Target,
  CheckCircle2,
  Send,
  ArrowDownToLine,
  Phone,
  Wifi,
  Copy,
  Share2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type TrashRecordStatus =
  | "pending_vendor_confirmation"
  | "vendor_confirmed"
  | "in_transit"
  | "factory_received"
  | "payout_released"
  | "cancelled";

interface TrashRecord {
  id: string;
  reference: string;
  collectorId: string;
  vendorId: string;
  factoryId?: string | null;
  trashType: "plastic" | "metal" | "organic";
  weightKg: number | string;
  status: TrashRecordStatus;
  committedPayout?: number | string | null;
  vendorPayout?: number | string | null;
  submittedAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  receivedAt?: string | null;
  paidAt?: string | null;
  qualityNotes?: string | null;
  metadata?: {
    collectorName?: string;
    vendorName?: string;
    photo?: string;
    [key: string]: unknown;
  };
}

interface SupportTicket {
  id: string;
  category: "wallet" | "trash_drop" | "vendor_issue" | "factory_issue" | "other";
  subject: string;
  description?: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority?: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

interface VendorSummary {
  id: string;
  username: string;
  businessName: string;
  contactName?: string;
  phoneNumber?: string;
  email?: string;
  ward?: string;
  lga?: string;
  state?: string;
  address?: string;
  location?: string;
}

interface VendorOption {
  vendorId: string;
  businessName: string;
  contactName?: string;
  ward?: string;
  lga?: string;
  state?: string;
  address?: string;
}

interface Badge_Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

interface TrainingVideo {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
}

interface WalletTransaction {
  id: string;
  amount: number;
  description?: string | null;
  reference?: string | null;
  type: "earn" | "redeem" | "bonus" | "penalty";
  createdAt: string;
}

const TRASH_TYPE_OPTIONS = [
  { value: "plastic", label: "Plastic" },
  { value: "metal", label: "Metal" },
  { value: "organic", label: "Organic" },
] as const;

const SUPPORT_CATEGORIES = [
  { value: "wallet", label: "Wallet & payouts" },
  { value: "trash_drop", label: "Trash drop issues" },
  { value: "vendor_issue", label: "Vendor coordination" },
  { value: "factory_issue", label: "Factory logistics" },
  { value: "other", label: "Other" },
] as const;

const NIGERIAN_NETWORKS = [
  { value: "mtn", label: "MTN" },
  { value: "airtel", label: "Airtel" },
  { value: "glo", label: "Glo" },
  { value: "9mobile", label: "9mobile" },
] as const;

type NetworkValue = typeof NIGERIAN_NETWORKS[number]["value"];
type PurchaseMode = "airtime" | "data";

type BundleOption = {
  label: string;
  value: string;
  amount: number;
  validity: string;
};

const DATA_BUNDLES: Record<NetworkValue, BundleOption[]> = {
  mtn: [
    { label: "500MB Daily", value: "mtn-500mb-daily", amount: 200, validity: "1 day" },
    { label: "1.5GB Weekly", value: "mtn-1_5gb-weekly", amount: 1200, validity: "7 days" },
    { label: "4.5GB Monthly", value: "mtn-4_5gb-monthly", amount: 2500, validity: "30 days" },
  ],
  airtel: [
    { label: "750MB Daily", value: "airtel-750mb-daily", amount: 300, validity: "1 day" },
    { label: "2GB Weekly", value: "airtel-2gb-weekly", amount: 1500, validity: "7 days" },
    { label: "6GB Monthly", value: "airtel-6gb-monthly", amount: 3000, validity: "30 days" },
  ],
  glo: [
    { label: "1GB Daily", value: "glo-1gb-daily", amount: 300, validity: "1 day" },
    { label: "3.5GB Weekly", value: "glo-3_5gb-weekly", amount: 1200, validity: "7 days" },
    { label: "10GB Mega", value: "glo-10gb-monthly", amount: 3500, validity: "30 days" },
  ],
  "9mobile": [
    { label: "500MB Flex", value: "9mobile-500mb-daily", amount: 200, validity: "1 day" },
    { label: "1.5GB Weekly", value: "9mobile-1_5gb-weekly", amount: 1100, validity: "7 days" },
    { label: "5GB Monthly", value: "9mobile-5gb-monthly", amount: 3200, validity: "30 days" },
  ],
};

const STATUS_META: Record<
  TrashRecordStatus,
  { label: string; badgeClass: string; stage: "submitted" | "confirmed" | "paid" | "other" }
> = {
  pending_vendor_confirmation: {
    label: "Submitted",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-300",
    stage: "submitted",
  },
  vendor_confirmed: {
    label: "Confirmed",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300",
    stage: "confirmed",
  },
  in_transit: {
    label: "In transit",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300",
    stage: "confirmed",
  },
  factory_received: {
    label: "Received",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-300",
    stage: "confirmed",
  },
  payout_released: {
    label: "Paid",
    badgeClass: "bg-primary/10 text-primary border border-primary",
    stage: "paid",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300",
    stage: "other",
  },
};

type SupportCategory = SupportTicket["category"];

type CreateTrashPayload = {
  vendorId: string;
  trashType: typeof TRASH_TYPE_OPTIONS[number]["value"];
  weightKg: number;
  qualityNotes?: string;
  metadata?: Record<string, unknown>;
};

const SUPPORT_STATUS_META: Record<SupportTicket["status"], { label: string; badgeClass: string }> = {
  open: { label: "Open", badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  in_progress: { label: "In progress", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  resolved: { label: "Resolved", badgeClass: "bg-green-500/10 text-green-600 dark:text-green-400" },
  closed: { label: "Closed", badgeClass: "bg-muted" },
};

export default function CollectorDashboard() {
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [idCardReason, setIdCardReason] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const collectorDisplayName = useMemo(() => {
    if (user?.firstName) {
      return `${user.firstName} ${user?.lastName ?? ""}`.trim();
    }
    return user?.username ?? "Collector";
  }, [user]);

  const { data: wallet } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: stats } = useQuery<{ tasksCompleted: number; totalEarnings: number; balance: number }>({
    queryKey: ["/api/stats"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: vendors = [] } = useQuery<VendorSummary[]>({
    queryKey: ["/api/vendors"],
  });

  const vendorOptions = useMemo<VendorOption[]>(
    () =>
      (vendors ?? []).map((vendor) => ({
        vendorId: vendor.id,
        businessName: vendor.businessName,
        contactName: vendor.contactName,
        ward: vendor.ward,
        lga: vendor.lga,
        state: vendor.state,
        address: vendor.address ?? vendor.location,
      })),
    [vendors],
  );

  const { data: trashRecords = [] } = useQuery<TrashRecord[]>({
    queryKey: ["/api/trash-records"],
    select: (records) =>
      (records ?? []).map((record: any) => ({
        ...record,
        weightKg: Number(record.weightKg ?? 0),
        committedPayout: Number(record.committedPayout ?? 0),
        vendorPayout: Number(record.vendorPayout ?? 0),
      })) as TrashRecord[],
  });

  const { data: supportTickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
    select: (tickets) =>
      (tickets ?? []).sort(
        (a: SupportTicket, b: SupportTicket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ) as SupportTicket[],
  });

  const { data: transactions = [] } = useQuery<WalletTransaction[]>({
    queryKey: ["/api/transactions"],
    select: (records) =>
      (records ?? []).map((entry: any) => ({
        ...entry,
        amount: Number(entry.amount ?? 0),
      })) as WalletTransaction[],
  });

  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [selectedTrashType, setSelectedTrashType] = useState<typeof TRASH_TYPE_OPTIONS[number]["value"]>(
    TRASH_TYPE_OPTIONS[0].value,
  );
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [supportCategory, setSupportCategory] = useState<SupportCategory>("wallet");
  const [supportSubject, setSupportSubject] = useState<string>("");
  const [supportDescription, setSupportDescription] = useState<string>("");

  const [transferUsername, setTransferUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>("airtime");
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkValue>("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [airtimeAmount, setAirtimeAmount] = useState("");
  const [selectedBundle, setSelectedBundle] = useState(DATA_BUNDLES["mtn"][0].value);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const defaultBundle = DATA_BUNDLES[selectedNetwork]?.[0]?.value;
    if (defaultBundle) {
      setSelectedBundle(defaultBundle);
    }
  }, [selectedNetwork]);

  useEffect(() => {
    if (!copySuccess) return;
    const timer = setTimeout(() => setCopySuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [copySuccess]);

  const selectedVendor = useMemo(() => {
    if (!selectedVendorId) return undefined;
    return vendorOptions.find((option) => option.vendorId === selectedVendorId);
  }, [selectedVendorId, vendorOptions]);

  const statsSummary = useMemo(() => {
    return trashRecords.reduce(
      (acc, record) => {
        const meta = STATUS_META[record.status];
        const weightValue = Number(record.weightKg ?? 0);
        acc.totalWeight += weightValue;
        if (meta.stage === "submitted") acc.submitted += 1;
        if (meta.stage === "confirmed") acc.confirmed += 1;
        if (meta.stage === "paid") acc.paid += 1;
        return acc;
      },
      { totalWeight: 0, submitted: 0, confirmed: 0, paid: 0 },
    );
  }, [trashRecords]);

  // Mock data for gamification
  const levelStats = {
    currentLevel: 8,
    nextLevelPoints: 250,
    currentPoints: 185,
    streak: 12,
    co2Saved: 3086,
    treesEquivalent: 142,
  };

  const badges: Badge_Item[] = [
    { id: "1", name: "Early Bird", description: "Complete 10 tasks before 9 AM", icon: "☀️", earned: true },
    { id: "2", name: "Century Club", description: "Complete 100 collections", icon: "💯", earned: true },
    { id: "3", name: "Eco Warrior", description: "Save 5000 kg CO₂", icon: "🌍", earned: false, progress: 61 },
    { id: "4", name: "Team Player", description: "Refer 5 collectors", icon: "🤝", earned: false, progress: 40 },
    { id: "5", name: "Perfect Week", description: "Complete tasks 7 days straight", icon: "⭐", earned: true },
    { id: "6", name: "Quality King", description: "Get 50 five-star ratings", icon: "👑", earned: false, progress: 78 },
  ];

  const trainingVideos: TrainingVideo[] = [
    { id: "1", title: "Plastic Sorting Techniques", duration: "8:45", category: "Basics", thumbnail: "🎯" },
    { id: "2", title: "Safe Metal Handling", duration: "12:30", category: "Safety", thumbnail: "🔧" },
    { id: "3", title: "Maximizing Your Earnings", duration: "15:20", category: "Tips", thumbnail: "💰" },
    { id: "4", title: "Understanding Waste Categories", duration: "10:15", category: "Basics", thumbnail: "📚" },
  ];

  const historyRows = useMemo(
    () =>
      [...trashRecords]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 6),
    [trashRecords],
  );

  const recentTickets = useMemo(() => supportTickets.slice(0, 4), [supportTickets]);

  const walletHandle = user?.username || user?.email || "collector";
  const bundleOptions = DATA_BUNDLES[selectedNetwork] ?? [];
  const activeBundle = bundleOptions.find((bundle) => bundle.value === selectedBundle) ?? bundleOptions[0];

  const incomingTransfers = useMemo(
    () => transactions.filter((transaction) => transaction.type === "bonus").slice(0, 4),
    [transactions],
  );

  const outgoingTransfers = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "redeem" &&
            (transaction.description || "").toLowerCase().includes("transfer"),
        )
        .slice(0, 4),
    [transactions],
  );

  const recentPurchases = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "redeem" &&
            (transaction.description || "").toLowerCase().includes("purchase"),
        )
        .slice(0, 4),
    [transactions],
  );

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

  const handlePhotoUpload = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const createTrashMutation = useMutation({
    mutationFn: async (payload: CreateTrashPayload) => {
      const response = await apiRequest("POST", "/api/trash-records", payload);
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trash-records"] });
      toast({
        title: "Drop submitted",
        description: `${variables.metadata?.vendorName ?? "Vendor"} has been notified of your ${variables.trashType} drop (${variables.weightKg} kg).`,
      });
      setWeight("");
      setNotes("");
      setPhotoPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error?.message || "Unable to record your drop. Please try again.",
        variant: "destructive",
      });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/wallet/redeem", {
        amount: 1,
        description: "Collector withdrawal",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal requested",
        description: "Your 1 ₦ withdrawal is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error?.message || "Unable to process withdrawal. Please try again.",
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
        description: data?.recipient?.username
          ? `Funds sent to ${data.recipient.username}`
          : "₦KOBO moved successfully.",
      });
      setTransferAmount("");
      setTransferNote("");
      setTransferUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer failed",
        description: error?.message || "Unable to move funds right now.",
        variant: "destructive",
      });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (payload: { amount: number; category: PurchaseMode; metadata: Record<string, unknown> }) => {
      const response = await apiRequest("POST", "/api/wallet/purchase", payload);
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: `${variables.category === "airtime" ? "Airtime" : "Data"} request placed`,
        description: "We are processing your telco top-up.",
      });
      setAirtimeAmount("");
      setPhoneNumber("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error?.message || "Unable to process telco purchase.",
        variant: "destructive",
      });
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (payload: { category: SupportCategory; subject: string; description?: string; priority?: number }) => {
      const response = await apiRequest("POST", "/api/support-tickets", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "Our support desk will review and respond shortly.",
      });
      setSupportSubject("");
      setSupportDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to create ticket",
        description: error?.message || "Please try again or contact support directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedVendor) {
      toast({
        title: "Select a vendor",
        description: "Choose a verified vendor to submit your drop.",
        variant: "destructive",
      });
      return;
    }

    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      toast({
        title: "Invalid weight",
        description: "Enter a weight greater than zero.",
        variant: "destructive",
      });
      return;
    }

    await createTrashMutation.mutateAsync({
      vendorId: selectedVendor.vendorId,
      trashType: selectedTrashType,
      weightKg: Number(numericWeight.toFixed(2)),
      qualityNotes: notes.trim() || undefined,
      metadata: {
        collectorName: collectorDisplayName,
        vendorName: selectedVendor.businessName,
        vendorContact: selectedVendor.contactName,
        vendorWard: selectedVendor.ward,
        vendorLga: selectedVendor.lga,
        vendorState: selectedVendor.state,
        vendorAddress: selectedVendor.address,
        photo: photoPreview,
      },
    });
  };

  const handleRedeem = () => {
    if (!redeemMutation.isPending) {
      redeemMutation.mutate();
    }
  };

  const handleTransferSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(transferAmount);

    if (!transferUsername.trim()) {
      toast({
        title: "Recipient required",
        description: "Enter your friend's username.",
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

  const handlePurchaseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedPhone = phoneNumber.replace(/\D/g, "");
    if (sanitizedPhone.length < 10) {
      toast({
        title: "Phone number required",
        description: "Enter a valid Nigerian phone number.",
        variant: "destructive",
      });
      return;
    }

    let amountToCharge = 0;
    if (purchaseMode === "airtime") {
      const numericAmount = Number(airtimeAmount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Enter an airtime amount greater than zero.",
          variant: "destructive",
        });
        return;
      }
      amountToCharge = Number(numericAmount.toFixed(2));
    } else {
      if (!activeBundle) {
        toast({
          title: "Bundle unavailable",
          description: "Choose a data bundle first.",
          variant: "destructive",
        });
        return;
      }
      amountToCharge = activeBundle.amount;
    }

    purchaseMutation.mutate({
      amount: amountToCharge,
      category: purchaseMode,
      metadata: {
        network: selectedNetwork,
        phone: sanitizedPhone,
        bundle: purchaseMode === "data" ? selectedBundle : "airtime_topup",
        validity: purchaseMode === "data" ? activeBundle?.validity : undefined,
        channel: "collector_dashboard",
      },
    });
  };

  const handleCopyWalletHandle = async () => {
    if (!walletHandle || typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Clipboard unavailable",
        description: "Copy your username manually.",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(walletHandle);
      setCopySuccess(true);
    } catch (error) {
      toast({
        title: "Unable to copy handle",
        description: (error as Error)?.message || "Copy your username manually.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supportSubject.trim()) {
      toast({
        title: "Subject required",
        description: "Add a short subject so we can route your ticket.",
        variant: "destructive",
      });
      return;
    }

    await createTicketMutation.mutateAsync({
      category: supportCategory,
      subject: supportSubject.trim(),
      description: supportDescription.trim() || undefined,
      priority: 2,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Header balance={wallet?.balance || 0} showWallet />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Welcome Header with modern gradient */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl blur-3xl -z-10"></div>
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Welcome back, {collectorDisplayName}! 👋
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-4">
            You're making a real impact on our environment. Keep up the great work!
          </p>
          <Button className="mt-2" variant="outline" size="sm" onClick={() => setShowIdCardModal(true)}>
            Request ID Card
          </Button>
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
                    toast({
                      title: "Reason required",
                      description: "Please provide a reason for your request.",
                      variant: "destructive",
                    });
                    return;
                  }
                  idCardRequestMutation.mutate(idCardReason.trim());
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="id-card-reason">Reason</Label>
                  <Textarea
                    id="id-card-reason"
                    name="id-card-reason"
                    value={idCardReason}
                    onChange={(e) => setIdCardReason(e.target.value)}
                    placeholder="e.g., Lost my previous card, need a new one."
                    required
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowIdCardModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={idCardRequestMutation.isPending} className="bg-green-600 hover:bg-green-700">
                    {idCardRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Level & Streak Banner - Modern Card Design */}
        <Card className="mb-6 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white border-none overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32"></div>
          <CardContent className="py-6 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90 font-medium">Current Level</p>
                  <p className="text-3xl font-bold">Level {levelStats.currentLevel}</p>
                </div>
              </div>
              <div className="flex-1 max-w-md min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress to Level {levelStats.currentLevel + 1}</span>
                  <span className="text-sm font-bold">
                    {levelStats.currentPoints}/{levelStats.nextLevelPoints} XP
                  </span>
                </div>
                <Progress
                  value={(levelStats.currentPoints / levelStats.nextLevelPoints) * 100}
                  className="bg-white/20 h-2 [&>div]:bg-white [&>div]:shadow-lg"
                />
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-3 rounded-xl backdrop-blur-sm shadow-lg">
                <Zap className="h-6 w-6 text-yellow-300" />
                <div>
                  <p className="text-xs opacity-90 font-medium">Streak</p>
                  <p className="text-2xl font-bold">{levelStats.streak} days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Stats Grid with Hover Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">₦{(stats?.totalEarnings || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Your hard work pays off</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{trashRecords.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{statsSummary.totalWeight.toFixed(1)} kg total</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                </div>
                CO₂ Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{levelStats.co2Saved} kg</p>
              <p className="text-xs text-muted-foreground mt-1">≈ {levelStats.treesEquivalent} trees planted</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-purple-600">4.8</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on vendor feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs with Better Styling */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-900 shadow-lg rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <TabsTrigger
              value="overview"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger
              value="statements"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Receipt className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Statements</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    Send KOBO to friends
                  </CardTitle>
                  <CardDescription>Move funds instantly to teammates and loved ones.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleTransferSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-username" className="text-sm font-medium">
                        Friend username
                      </Label>
                      <Input
                        id="transfer-username"
                        value={transferUsername}
                        onChange={(event) => setTransferUsername(event.target.value)}
                        placeholder="e.g., @eko_collector"
                        autoComplete="off"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-amount" className="text-sm font-medium">
                        Amount (₦KOBO)
                      </Label>
                      <Input
                        id="transfer-amount"
                        type="number"
                        min="0"
                        step="0.5"
                        value={transferAmount}
                        onChange={(event) => setTransferAmount(event.target.value)}
                        placeholder="500"
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available balance: ₦{(wallet?.balance || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-note" className="text-sm font-medium">
                        Note (optional)
                      </Label>
                      <Input
                        id="transfer-note"
                        value={transferNote}
                        onChange={(event) => setTransferNote(event.target.value)}
                        placeholder="Logistics refund, thank you gift…"
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700" disabled={transferMutation.isPending}>
                      {transferMutation.isPending ? "Sending..." : "Send KOBO"}
                    </Button>
                    {outgoingTransfers.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Latest transfers</p>
                        <div className="space-y-2">
                          {outgoingTransfers.map((transfer) => (
                            <div key={transfer.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-100">
                                  {transfer.description || "Peer transfer"}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(transfer.createdAt)}</p>
                              </div>
                              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                -₦{transfer.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ArrowDownToLine className="h-5 w-5 text-blue-600" />
                    </div>
                    Receive KOBO from friends
                  </CardTitle>
                  <CardDescription>Share your wallet handle and watch funds land safely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet handle</p>
                      <p className="font-mono font-semibold text-lg">@{walletHandle}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={handleCopyWalletHandle}>
                      {copySuccess ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                      <span className="sr-only">Copy handle</span>
                    </Button>
                  </div>
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={handleCopyWalletHandle}>
                    <Share2 className="h-4 w-4" />
                    Share payment handle
                  </Button>
                  <div>
                    <p className="text-sm font-semibold mb-2">Recent incoming</p>
                    {incomingTransfers.length ? (
                      <div className="space-y-3">
                        {incomingTransfers.map((transfer) => (
                          <div key={transfer.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-100">
                                {transfer.description || "Wallet credit"}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatRelativeTime(transfer.createdAt)}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              +₦{transfer.amount.toLocaleString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No incoming transfers yet. Share your handle above.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      {purchaseMode === "airtime" ? (
                        <Phone className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Wifi className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    Buy airtime & data
                  </CardTitle>
                  <CardDescription>Top-up every major network without leaving the app.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      type="button"
                      size="sm"
                      variant={purchaseMode === "airtime" ? "default" : "outline"}
                      onClick={() => setPurchaseMode("airtime")}
                    >
                      Airtime
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={purchaseMode === "data" ? "default" : "outline"}
                      onClick={() => setPurchaseMode("data")}
                    >
                      Data
                    </Button>
                  </div>
                  <form className="space-y-4" onSubmit={handlePurchaseSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="telco-phone" className="text-sm font-medium">
                        Phone number
                      </Label>
                      <Input
                        id="telco-phone"
                        inputMode="numeric"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value)}
                        placeholder="0803 000 0000"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telco-network" className="text-sm font-medium">
                        Network
                      </Label>
                      <Select value={selectedNetwork} onValueChange={(value) => setSelectedNetwork(value as NetworkValue)}>
                        <SelectTrigger id="telco-network" className="h-11">
                          <SelectValue placeholder="Choose network" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_NETWORKS.map((network) => (
                            <SelectItem key={network.value} value={network.value}>
                              {network.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {purchaseMode === "airtime" ? (
                      <div className="space-y-2">
                        <Label htmlFor="airtime-amount" className="text-sm font-medium">
                          Amount (₦)
                        </Label>
                        <Input
                          id="airtime-amount"
                          type="number"
                          min="50"
                          step="50"
                          value={airtimeAmount}
                          onChange={(event) => setAirtimeAmount(event.target.value)}
                          placeholder="1000"
                          required
                          className="h-11"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="data-bundle" className="text-sm font-medium">
                          Data bundle
                        </Label>
                        <Select value={selectedBundle} onValueChange={setSelectedBundle}>
                          <SelectTrigger id="data-bundle" className="h-11">
                            <SelectValue placeholder="Choose bundle" />
                          </SelectTrigger>
                          <SelectContent>
                            {bundleOptions.map((bundle) => (
                              <SelectItem key={bundle.value} value={bundle.value}>
                                {bundle.label} · ₦{bundle.amount.toLocaleString()} ({bundle.validity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={purchaseMutation.isPending}
                    >
                      {purchaseMutation.isPending
                        ? "Processing..."
                        : purchaseMode === "airtime"
                          ? "Buy Airtime"
                          : "Buy Data"}
                    </Button>
                  </form>
                  {recentPurchases.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-sm">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">Recent telco requests</p>
                      {recentPurchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {purchase.description || "Wallet purchase"}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(purchase.createdAt)}</p>
                          </div>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            -₦{purchase.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    Submit a trash drop
                  </CardTitle>
                  <CardDescription>Log every delivery so your local vendor can confirm and credit your wallet faster.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmission}>
                    <div className="space-y-2">
                      <Label htmlFor="vendor" className="font-medium">
                        Local vendor *
                      </Label>
                      <Select value={selectedVendorId} onValueChange={setSelectedVendorId} disabled={vendorOptions.length === 0}>
                        <SelectTrigger id="vendor" className="h-11">
                          <SelectValue placeholder={vendorOptions.length ? "Select vendor" : "No vendors available"} />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorOptions.map((vendor) => (
                            <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium">{vendor.businessName}</span>
                                <span className="text-xs text-muted-foreground">{[vendor.ward, vendor.lga, vendor.state].filter(Boolean).join(", ")}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {vendorOptions.length === 0 && <p className="text-xs text-muted-foreground">No verified vendors yet. Check back soon.</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trashType" className="font-medium">
                        Trash type *
                      </Label>
                      <Select value={selectedTrashType} onValueChange={(value) => setSelectedTrashType(value as typeof selectedTrashType)}>
                        <SelectTrigger id="trashType" className="h-11">
                          <SelectValue placeholder="Choose type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRASH_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="font-medium">
                        Weight (kg) *
                      </Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={weight}
                        onChange={(event) => setWeight(event.target.value)}
                        placeholder="e.g., 12.5"
                        autoComplete="off"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="font-medium">
                        Notes (optional)
                      </Label>
                      <Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Additional details" className="h-11" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="photo" className="font-medium">
                        Upload photo (optional)
                      </Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) {
                            setPhotoPreview(null);
                            return;
                          }
                          try {
                            const preview = await handlePhotoUpload(file);
                            setPhotoPreview(preview);
                          } catch (error: any) {
                            toast({
                              title: "Image upload failed",
                              description: error?.message || "We couldn't attach the image.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="h-11"
                      />
                      {photoPreview && (
                        <div className="mt-3">
                          <img src={photoPreview} alt="Trash drop" className="h-32 w-32 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md" />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 flex justify-end pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                        disabled={createTrashMutation.isPending || !selectedVendor}
                      >
                        {createTrashMutation.isPending ? "Submitting..." : "Submit drop"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <WalletCard balance={wallet?.balance || 0} weeklyEarnings={stats?.totalEarnings || 0} onRedeem={handleRedeem} redeemDisabled={redeemMutation.isPending} redeemLabel={redeemMutation.isPending ? "Processing..." : "Withdraw 1 ₦"} />

                <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                  <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-muted-foreground font-medium">Drops submitted</span>
                      <Badge variant="secondary" className="font-bold">
                        {statsSummary.submitted}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                      <span className="text-sm text-muted-foreground font-medium">Confirmed by vendors</span>
                      <Badge className="bg-green-600 text-white font-bold">{statsSummary.confirmed}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                      <span className="text-sm text-muted-foreground font-medium">Paid out</span>
                      <Badge className="bg-blue-600 text-white font-bold">{statsSummary.paid}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="overflow-hidden xl:col-span-2 shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle>Collection history</CardTitle>
                  <CardDescription>Latest drops with live status tracking</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Vendor</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="text-center font-semibold">Weight</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p className="font-medium">No recorded drops yet</p>
                              <p className="text-sm">Submit one above to see it here</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          historyRows.map((submission) => {
                            const statusMeta = STATUS_META[submission.status];
                            const trashLabel = TRASH_TYPE_OPTIONS.find((option) => option.value === submission.trashType)?.label ?? submission.trashType;
                            const vendorLabel = submission.metadata?.vendorName ?? submission.vendorId;
                            return (
                              <TableRow key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                <TableCell className="font-medium">{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{vendorLabel}</TableCell>
                                <TableCell className="capitalize">{trashLabel}</TableCell>
                                <TableCell className="text-center font-semibold">{Number(submission.weightKg).toFixed(1)} kg</TableCell>
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

              <Card className="shadow-xl border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Available tasks
                  </CardTitle>
                  <CardDescription>Claim opportunities near you</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No live pickup requests</p>
                      <p className="text-xs">Check back soon!</p>
                    </div>
                  ) : (
                    tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold capitalize">
                            {task.type} • {task.weight} kg
                          </p>
                          <Badge variant="secondary" className="font-bold">
                            ₦{(task.reward / 1000).toFixed(3)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => toast({ title: "Coming soon", description: "Task acceptance will be re-enabled shortly." })}
                        >
                          Express interest
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-outfit mb-2">Your Achievements 🏆</h2>
              <p className="text-muted-foreground">Unlock badges by completing challenges</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`${
                    badge.earned ? "border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950" : "opacity-60 grayscale hover:grayscale-0"
                  } hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className={`text-6xl mb-4 ${!badge.earned && "grayscale hover:grayscale-0 transition-all"}`}>{badge.icon}</div>
                      <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>

                      {badge.earned ? (
                        <Badge className="bg-green-600 text-white shadow-lg">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Earned
                        </Badge>
                      ) : badge.progress !== undefined ? (
                        <div>
                          <Progress value={badge.progress} className="mb-2 h-2" />
                          <p className="text-xs font-semibold text-muted-foreground">{badge.progress}% complete</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-slate-300">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-outfit mb-2">Training Resources 📚</h2>
              <p className="text-muted-foreground">Learn best practices and improve your skills</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trainingVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center text-4xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {video.thumbnail}
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 border-green-600 text-green-600">
                          {video.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">{video.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </span>
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-green-600 hover:bg-transparent hover:text-green-700">
                            <PlayCircle className="h-5 w-5 mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Statements Tab */}
          <TabsContent value="statements" className="space-y-4">
            <PaymentStatements userRole="collector" />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-outfit mb-2">Account Settings ⚙️</h2>
              <p className="text-muted-foreground">Manage your profile and payment preferences</p>
            </div>

            <BankAccountLink />

            <Card className="shadow-xl border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your verified information</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Username</p>
                    <p className="font-semibold text-lg">{user?.username}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</p>
                    <p className="font-semibold text-lg">{collectorDisplayName}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</p>
                    <p className="font-semibold text-lg">{user?.phoneNumber || "Not set"}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Location</p>
                    <p className="font-semibold text-lg">{user?.location || "Not set"}</p>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold">
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "moments ago";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "moments ago";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears}y ago`;
}
