import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Phone, Radio, ShieldCheck, TrendingUp } from "lucide-react";

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

const STATUS_META: Record<TrashRecord["status"], { label: string; badgeClass: string }> = {
  pending_vendor_confirmation: {
    label: "Awaiting confirmation",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  vendor_confirmed: {
    label: "Confirmed",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  in_transit: {
    label: "In transit",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  factory_received: {
    label: "With factory",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  payout_released: {
    label: "Paid",
    badgeClass: "bg-primary/10 text-primary",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
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

  const [purchaseCategory, setPurchaseCategory] = useState<typeof PURCHASE_CATEGORIES[number]["value"]>(
    PURCHASE_CATEGORIES[1].value,
  );
  const [purchaseAmount, setPurchaseAmount] = useState("1000");
  const [transferUsername, setTransferUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("0.5");
  const [transferNote, setTransferNote] = useState("");

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
        description: data?.recipient?.username
          ? `Funds sent to ${data.recipient.username}.`
          : "Funds transferred successfully.",
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
    };
  }, [trashRecords]);

  const recentRecords = useMemo(() => {
    return [...trashRecords]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 6);
  }, [trashRecords]);

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

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
    <div className="min-h-screen bg-background">
      <Header balance={wallet?.balance || 0} showWallet />
  <main className="max-w-7xl mx-auto px-6 pt-32 pb-10 space-y-10">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold">Vendor workspace</p>
          <h1 className="font-outfit font-bold text-3xl md:text-4xl">
            Hello, {profile?.profile?.businessName || user?.firstName || user?.username}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Confirm drops, release payouts, and keep your wallet ready for airtime, data, or direct transfers to your collectors.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => setShowIdCardModal(true)}>
            Request ID Card
          </Button>
        </section>

        {showIdCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="font-bold text-lg mb-2">Request ID Card</h2>
              <p className="text-sm text-muted-foreground mb-4">Explain why you need a new or replacement ID card.</p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!idCardReason.trim()) {
                    toast({ title: "Reason required", description: "Please provide a reason for your request.", variant: "destructive" });
                    return;
                  }
                  idCardRequestMutation.mutate(idCardReason.trim());
                }}
                className="space-y-4"
              >
                <Label htmlFor="id-card-reason">Reason</Label>
                <Input
                  id="id-card-reason"
                  name="id-card-reason"
                  value={idCardReason}
                  onChange={e => setIdCardReason(e.target.value)}
                  placeholder="e.g., Lost my previous card, need a new one."
                  required
                />
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowIdCardModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={idCardRequestMutation.isPending}>
                    {idCardRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Outstanding confirmations</CardDescription>
              <CardTitle className="text-3xl">{stats.submitted}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Awaiting your validation
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Confirmed today</CardDescription>
              <CardTitle className="text-3xl">{stats.confirmed}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" /> Ready to schedule logistics
            </CardContent>
          </Card>
          <Card className="border-blue-500/20">
            <CardHeader className="pb-2">
              <CardDescription>In transit</CardDescription>
              <CardTitle className="text-3xl">{stats.inTransit}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-blue-500" /> En route to factories
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Weight processed</CardDescription>
              <CardTitle className="text-3xl">{stats.totalWeight.toFixed(1)} kg</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-500" /> Eligible for payouts
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Buy credit or data</CardTitle>
              <CardDescription>Use wallet balance to top-up airtime, data, or energy credit instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchaseSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase-category">Category</Label>
                  <Select
                    value={purchaseCategory}
                    onValueChange={(value) =>
                      setPurchaseCategory(value as typeof PURCHASE_CATEGORIES[number]["value"])
                    }
                  >
                    <SelectTrigger id="purchase-category">
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
                  <Label htmlFor="purchase-amount">Amount (₦)</Label>
                  <Input
                    id="purchase-amount"
                    type="number"
                    min="0"
                    step="0.5"
                    value={purchaseAmount}
                    onChange={(event) => setPurchaseAmount(event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full" disabled={purchaseMutation.isPending}>
                    {purchaseMutation.isPending ? "Processing..." : "Complete purchase"}
                  </Button>
                </div>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                Purchases log to your transaction history for audit purposes. Airtime and data top-ups are auto-fulfilled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet snapshot</CardTitle>
              <CardDescription>Monitor balance movements and pending transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-semibold">₦{(wallet?.balance || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Available in wallet</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Drop confirmations</p>
                  <p className="font-semibold">{stats.confirmed}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Transfers sent</p>
                  <p className="font-semibold">
                    {recentTransactions.filter((txn) => txn.amount < 0).length}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Link a payout account soon to enjoy same-day settlements for verified drops.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward a collector</CardTitle>
              <CardDescription>Send coins directly to a collector&apos;s wallet for fast payouts.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="transfer-username">Collector username *</Label>
                  <Input
                    id="transfer-username"
                    placeholder="e.g., collector_amos"
                    value={transferUsername}
                    onChange={(event) => setTransferUsername(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">Amount (₦)</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    min="0"
                    step="0.5"
                    value={transferAmount}
                    onChange={(event) => setTransferAmount(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-note">Note</Label>
                  <Input
                    id="transfer-note"
                    placeholder="Optional description"
                    value={transferNote}
                    onChange={(event) => setTransferNote(event.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="px-6" disabled={transferMutation.isPending}>
                    {transferMutation.isPending ? "Sending..." : "Transfer"}
                  </Button>
                </div>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                Transfers settle instantly in the collector wallet and are logged as bonus payouts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor directory</CardTitle>
              <CardDescription>Your public profile collectors see when submitting drops.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> {profile?.profile?.businessName || "Complete your profile"}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> {profile?.user?.phoneNumber || "Add contact number"}
              </p>
              <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                {[profile?.profile?.ward, profile?.profile?.lga, profile?.profile?.state]
                  .filter(Boolean)
                  .join(", ") || "Set your ward and LGA to appear in collector search"}
              </div>
              <p className="text-xs">
                Update vendor details anytime from Settings (coming soon). Accuracy builds trust with collectors and factories.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Recent trash records</CardTitle>
              <CardDescription>Latest collector submissions assigned to your vendor account.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No records yet. Collectors will appear here once they submit drops to you.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRecords.map((record) => {
                      const statusMeta = STATUS_META[record.status];
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">
                            {record.metadata?.collectorName || record.collectorId}
                          </TableCell>
                          <TableCell className="capitalize">{record.trashType}</TableCell>
                          <TableCell className="text-center">{Number(record.weightKg).toFixed(1)} kg</TableCell>
                          <TableCell>
                            <Badge className={statusMeta.badgeClass}>{statusMeta.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Wallet activity</CardTitle>
              <CardDescription>Track debits, credits, and manual transfers.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        No wallet activity yet. Purchases and transfers will appear here instantly.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">
                          {transaction.description || "Wallet activity"}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-rose-600"}`}>
                          {transaction.amount >= 0 ? "+" : "-"}
                          {(Math.abs(transaction.amount) / 1000).toFixed(3)} KOBO
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
