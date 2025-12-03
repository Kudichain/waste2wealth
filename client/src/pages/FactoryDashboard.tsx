import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Coins, PackageCheck, Shield, Truck, Users } from "lucide-react";

type SubmissionStatus = "submitted" | "confirmed" | "shipped" | "paid";

interface TrashSubmission {
  id: string;
  collectorName: string;
  vendorId: string;
  vendorName: string;
  trashType: string;
  weight: number;
  notes?: string;
  status: SubmissionStatus;
  submittedAt: string;
  photo?: string | null;
  confirmedAt?: string;
  shippedAt?: string;
  paidAt?: string;
}

const STORAGE_KEY = "motech_trash_submissions";
const COIN_RATE_PER_KG = 12;

function readSubmissions(): TrashSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TrashSubmission[];
  } catch {
    return [];
  }
}

function persistSubmissions(submissions: TrashSubmission[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

export default function FactoryDashboard() {
  const { toast } = useToast();
  const { data: wallet } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
  });

  const [submissions, setSubmissions] = useState<TrashSubmission[]>(() => readSubmissions());

  useEffect(() => {
    persistSubmissions(submissions);
  }, [submissions]);

  const updateSubmissionStatus = (id: string, status: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((submission) => {
        if (submission.id !== id) return submission;
        const timestamp = new Date().toISOString();
        return {
          ...submission,
          status,
          confirmedAt: status === "confirmed" ? timestamp : submission.confirmedAt,
          shippedAt: status === "shipped" ? timestamp : submission.shippedAt,
          paidAt: status === "paid" ? timestamp : submission.paidAt,
        };
      }),
    );
  };

  const queue = useMemo(() => submissions.filter((item) => item.status === "submitted"), [submissions]);
  const inProcessing = useMemo(
    () => submissions.filter((item) => item.status === "confirmed" || item.status === "shipped"),
    [submissions],
  );
  const paidOut = useMemo(() => submissions.filter((item) => item.status === "paid"), [submissions]);

  const totalWeightThisMonth = submissions.reduce((acc, item) => acc + item.weight, 0);
  const totalCoinsCommitted = submissions.reduce((acc, item) => acc + item.weight * COIN_RATE_PER_KG, 0);
  const totalCollectors = new Set(submissions.map((item) => item.collectorName)).size;

  const upcomingShipments = inProcessing.slice(0, 5);
  const interactionLog = submissions
    .slice()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8);

  const handleConfirm = (id: string) => {
    updateSubmissionStatus(id, "confirmed");
    toast({
      title: "Drop confirmed",
      description: "Status updated and collector notified.",
    });
  };

  const handleShip = (id: string) => {
    updateSubmissionStatus(id, "shipped");
    toast({
      title: "Shipment marked",
      description: "Factory logistics updated successfully.",
    });
  };

  const handleMarkPaid = (id: string) => {
    updateSubmissionStatus(id, "paid");
    toast({
      title: "Payout recorded",
      description: "Coins released to collector's wallet.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header balance={wallet?.balance || 0} showWallet />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-2">
            Local Vendor Control Center
          </h1>
          <p className="text-muted-foreground">
            Manage collector submissions, coordinate shipments, and monitor payouts in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard
            title="Pending confirmations"
            value={queue.length}
            icon={Shield}
            trend="Awaiting verification"
          />
          <StatsCard
            title="Active shipments"
            value={inProcessing.length}
            icon={Truck}
            trend="In movement"
          />
          <StatsCard
            title="Collectors served"
            value={totalCollectors}
            icon={Users}
            trend="Across all time"
          />
          <StatsCard
            title="Intake this month"
            value={`${totalWeightThisMonth.toFixed(1)} kg`}
            icon={PackageCheck}
            trend="Tracked weight"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Trash confirmation queue</CardTitle>
              <CardDescription>Verify collector submissions to trigger payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {queue.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-10 border rounded-lg">
                  No pending submissions at the moment. Collectors will appear here once they submit a drop.
                </div>
              ) : (
                queue.map((submission) => (
                  <div key={submission.id} className="p-5 border rounded-xl hover-elevate transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{submission.collectorName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {submission.trashType} • {submission.weight} kg • {submission.vendorName}
                        </p>
                        {submission.notes && <p className="text-xs text-muted-foreground mt-2">Note: {submission.notes}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary">Committed payout {submission.weight * COIN_RATE_PER_KG} GC</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleConfirm(submission.id)}>Confirm drop</Button>
                          <Button size="sm" variant="outline" onClick={() => handleMarkPaid(submission.id)}>
                            Fast-track payout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet summary</CardTitle>
              <CardDescription>
                Track coins distributed to collectors and monitor outstanding liabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-semibold">{totalCoinsCommitted.toLocaleString()} GC</p>
                <p className="text-xs text-muted-foreground">Total coins committed</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payouts completed</span>
                <Badge className="bg-primary/10 text-primary">{paidOut.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Outstanding confirmations</span>
                <Badge variant="secondary">{queue.length}</Badge>
              </div>
              <Button className="w-full" variant="outline" onClick={() => toast({ title: "Coming soon", description: "Connect to KOBO treasury in the next release." })}>
                Manage KOBO payouts
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Shipping tracker</CardTitle>
              <CardDescription>Monitor the status of confirmed drops heading to factories.</CardDescription>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingShipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No items currently in transit.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingShipments.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{submission.collectorName}</TableCell>
                        <TableCell>{submission.trashType}</TableCell>
                        <TableCell className="text-center">{submission.weight} kg</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              submission.status === "shipped"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-green-500/10 text-green-700 dark:text-green-400"
                            }
                          >
                            {submission.status === "confirmed" ? "Confirmed" : "Shipped"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {submission.status === "confirmed" ? (
                            <Button size="sm" variant="outline" onClick={() => handleShip(submission.id)}>
                              Mark shipped
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleMarkPaid(submission.id)}>
                              Confirm payout
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Collector interaction log</CardTitle>
              <CardDescription>Most recent engagements across your vendor network.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Trash type</TableHead>
                    <TableHead className="text-center">Weight</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactionLog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                        No activity recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interactionLog.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{submission.collectorName}</TableCell>
                        <TableCell>{submission.trashType}</TableCell>
                        <TableCell className="text-center">{submission.weight} kg</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              submission.status === "paid"
                                ? "bg-primary/10 text-primary"
                                : submission.status === "confirmed"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : submission.status === "shipped"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                            }
                          >
                            {submission.status === "submitted" && "Submitted"}
                            {submission.status === "confirmed" && "Confirmed"}
                            {submission.status === "shipped" && "Shipped"}
                            {submission.status === "paid" && "Paid"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
