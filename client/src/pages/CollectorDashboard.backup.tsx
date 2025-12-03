import { useCallback, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, Package, TrendingUp } from "lucide-react";
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

const STATUS_META: Record<
  TrashRecordStatus,
  { label: string; badgeClass: string; stage: "submitted" | "confirmed" | "paid" | "other" }
> = {
  pending_vendor_confirmation: {
    label: "Submitted",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    stage: "submitted",
  },
  vendor_confirmed: {
    label: "Confirmed",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400",
    stage: "confirmed",
  },
  in_transit: {
    label: "In transit",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    stage: "confirmed",
  },
  factory_received: {
    label: "Received",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
    stage: "confirmed",
  },
  payout_released: {
    label: "Paid",
    badgeClass: "bg-primary/10 text-primary",
    stage: "paid",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
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

  const historyRows = useMemo(
    () =>
      [...trashRecords]
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 6),
    [trashRecords],
  );

  const recentTickets = useMemo(() => supportTickets.slice(0, 4), [supportTickets]);

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
    <div className="min-h-screen bg-background">
      <Header balance={wallet?.balance || 0} showWallet />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-2">Hello, {collectorDisplayName}</h1>
          <p className="text-muted-foreground">
            Track your drops, manage vendor relationships, and convert waste into KOBO rewards.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => setShowIdCardModal(true)}>
            Request ID Card
          </Button>
        </div>

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
                <Textarea
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Profile & readiness</CardTitle>
              <CardDescription>
                Keep your details current so vendors can reach you quickly when confirming drops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Collector ID</p>
                  <p className="font-semibold">{user?.username}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Primary contact</p>
                  <p className="font-semibold">{collectorDisplayName}</p>
                  <p className="text-sm text-muted-foreground">{user?.phoneNumber || "Add phone number"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Service area</p>
                  <p className="font-semibold">{user?.location || "Update from onboarding"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weekly performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">{statsSummary.totalWeight.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">Total collected</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Drops submitted</span>
                <Badge variant="secondary">{statsSummary.submitted}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confirmed by vendors</span>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">{statsSummary.confirmed}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid out</span>
                <Badge className="bg-primary/10 text-primary">{statsSummary.paid}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Submit a trash drop</CardTitle>
              <CardDescription>
                Log every delivery so your local vendor can confirm and credit your wallet faster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmission}>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Local vendor *</Label>
                  <Select
                    value={selectedVendorId}
                    onValueChange={setSelectedVendorId}
                    disabled={vendorOptions.length === 0}
                  >
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder={vendorOptions.length ? "Select vendor" : "No vendors available"} />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorOptions.map((vendor) => (
                        <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                          <div className="flex flex-col">
                            <span className="font-medium">{vendor.businessName}</span>
                            <span className="text-xs text-muted-foreground">
                              {[vendor.ward, vendor.lga, vendor.state].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vendorOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No verified vendors yet. Check back soon.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trashType">Trash type *</Label>
                  <Select value={selectedTrashType} onValueChange={(value) => setSelectedTrashType(value as typeof selectedTrashType)}>
                    <SelectTrigger id="trashType">
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
                  <Label htmlFor="weight">Weight (kg) *</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Additional details for the vendor"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Upload photo (optional)</Label>
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
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Trash drop" className="mt-2 h-24 w-24 rounded-lg object-cover border" />
                  )}
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="px-8" disabled={createTrashMutation.isPending || !selectedVendor}>
                    {createTrashMutation.isPending ? "Submitting..." : "Submit drop"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <WalletCard
              balance={wallet?.balance || 0}
              weeklyEarnings={stats?.totalEarnings || 0}
              onRedeem={handleRedeem}
              redeemDisabled={redeemMutation.isPending}
              redeemLabel={redeemMutation.isPending ? "Processing..." : "Withdraw 1 ₦"}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor service level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Use the form to notify partners instantly.
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" /> Vendors mark confirmed within 2 hours on average.
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Paid drops appear in your wallet immediately after verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader>
              <CardTitle>Collection history</CardTitle>
              <CardDescription>Latest drops with live status tracking.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Trash type</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No recorded drops yet. Submit one to see it here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyRows.map((submission) => {
                      const statusMeta = STATUS_META[submission.status];
                      const trashLabel =
                        TRASH_TYPE_OPTIONS.find((option) => option.value === submission.trashType)?.label ?? submission.trashType;
                      const vendorLabel = submission.metadata?.vendorName ?? submission.vendorId;
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{vendorLabel}</TableCell>
                          <TableCell className="capitalize">{trashLabel}</TableCell>
                          <TableCell className="text-center">{Number(submission.weightKg).toFixed(1)} kg</TableCell>
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available pickups near you</CardTitle>
                <CardDescription>Claim opportunities that match your capacity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No live pickup requests right now. Check back soon or submit a new drop above.
                  </div>
                ) : (
                  tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg hover-elevate transition">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold capitalize">
                          {task.type} • {task.weight} kg
                        </p>
                        <Badge variant="secondary">Reward: {(task.reward / 1000).toFixed(3)} KOBO</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.location}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: "Coming soon", description: "Task acceptance will be re-enabled shortly." })}
                      >
                        Express interest
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need help?</CardTitle>
                <CardDescription>Raise a support ticket or review recent responses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form className="space-y-3" onSubmit={handleCreateTicket}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="support-category">Category *</Label>
                      <Select
                        value={supportCategory}
                        onValueChange={(value) => setSupportCategory(value as SupportCategory)}
                      >
                        <SelectTrigger id="support-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORT_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="support-subject">Subject *</Label>
                      <Input
                        id="support-subject"
                        name="support-subject"
                        autoComplete="off"
                        value={supportSubject}
                        onChange={(event) => setSupportSubject(event.target.value)}
                        placeholder="e.g., Pending payout"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="support-description">Describe the issue</Label>
                    <Textarea
                      id="support-description"
                      value={supportDescription}
                      onChange={(event) => setSupportDescription(event.target.value)}
                      placeholder="Add context or screenshots if helpful"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? "Submitting..." : "Submit ticket"}
                    </Button>
                  </div>
                </form>

                <div className="space-y-2">
                  <p className="text-xs uppercase text-muted-foreground">Recent tickets</p>
                  {recentTickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tickets yet. We're here if you need us.</p>
                  ) : (
                    recentTickets.map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium">{ticket.subject}</span>
                          <Badge className={SUPPORT_STATUS_META[ticket.status].badgeClass}>
                            {SUPPORT_STATUS_META[ticket.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {SUPPORT_CATEGORIES.find((category) => category.value === ticket.category)?.label ?? ticket.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
