import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Search,
  Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface BarcodeAuthenticationProps {
  barcodeId?: string;
  userId?: string;
}

interface DropRecord {
  id: string;
  vendorName: string;
  vendorId: string;
  trashType: string;
  weight: number;
  amount: number;
  status: "pending" | "confirmed" | "paid" | "disputed";
  createdAt: string;
  confirmedAt?: string;
  paidAt?: string;
}

export default function BarcodeAuthentication({ barcodeId, userId }: BarcodeAuthenticationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Generate QR code using canvas
  useEffect(() => {
    if (barcodeId && qrCanvasRef.current) {
      generateQRCode(barcodeId, qrCanvasRef.current);
    }
  }, [barcodeId]);

  // Fetch drop history
  const { data: dropHistory } = useQuery<DropRecord[]>({
    queryKey: ["barcodeDrops", userId],
    queryFn: async () => {
      const response = await fetch(`/api/barcode-drops/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch drop history");
      return response.json();
    },
    enabled: !!userId,
  });

  const generateQRCode = (text: string, canvas: HTMLCanvasElement) => {
    // Simple QR code generation (in production, use a library like qrcode or qrcode.react)
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Generate simple pattern based on text
    const gridSize = 32;
    const cellSize = size / gridSize;
    
    ctx.fillStyle = "#000000";
    
    // Create deterministic pattern from barcodeId
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const hash = simpleHash(`${text}-${x}-${y}`);
        if (hash % 2 === 0) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);

    // Add text below
    ctx.fillStyle = "#000000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, size / 2, size - 8);
  };

  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = `barcode-${barcodeId}.png`;
    link.href = qrCanvasRef.current.toDataURL();
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: "Your barcode has been saved to your device.",
    });
  };

  const handlePrintQR = () => {
    if (!qrCanvasRef.current) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow pop-ups to print your barcode.",
        variant: "destructive",
      });
      return;
    }
    
    const imageUrl = qrCanvasRef.current.toDataURL();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Collector Barcode - ${barcodeId}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              margin-bottom: 10px;
              font-size: 24px;
            }
            .barcode-id {
              font-size: 20px;
              font-weight: bold;
              margin: 20px 0;
              font-family: monospace;
            }
            img {
              border: 2px solid #000;
              border-radius: 8px;
            }
            .instructions {
              margin-top: 30px;
              max-width: 500px;
              text-align: left;
              font-size: 14px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Waste2Wealth Collector</h1>
            <div class="barcode-id">${barcodeId}</div>
            <img src="${imageUrl}" alt="Collector Barcode" />
            <div class="instructions">
              <h3>Instructions:</h3>
              <ol>
                <li>Present this barcode to the vendor when dropping waste</li>
                <li>Vendor will scan to log your drop</li>
                <li>Payment will be credited to your wallet after confirmation</li>
                <li>Keep this barcode secure and don't share with others</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "disputed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "disputed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Disputed</Badge>;
      default:
        return null;
    }
  };

  const filteredDrops = dropHistory?.filter((drop) => {
    const matchesSearch = 
      drop.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.trashType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || drop.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: dropHistory?.length || 0,
    pending: dropHistory?.filter((d) => d.status === "pending").length || 0,
    confirmed: dropHistory?.filter((d) => d.status === "confirmed").length || 0,
    paid: dropHistory?.filter((d) => d.status === "paid").length || 0,
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Barcode Authentication</CardTitle>
            <CardDescription>
              Your unique barcode for waste drop verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="barcode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="barcode">My Barcode</TabsTrigger>
            <TabsTrigger value="history">Drop History</TabsTrigger>
          </TabsList>
          
          {/* Barcode Tab */}
          <TabsContent value="barcode" className="space-y-6">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-muted">
                <canvas ref={qrCanvasRef} className="rounded" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Your Barcode ID</p>
                <p className="text-lg font-mono font-bold">{barcodeId || "Loading..."}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownloadQR} variant="outline" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handlePrintQR} variant="outline" size="lg">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                How to Use Your Barcode
              </h4>
              <ol className="text-xs space-y-2 ml-4 list-decimal">
                <li>Save or print your barcode for quick access</li>
                <li>When you arrive at a vendor location with waste, show your barcode</li>
                <li>Vendor scans your barcode to log the drop details</li>
                <li>Vendor confirms the trash type and weight</li>
                <li>System automatically calculates payment</li>
                <li>Wallet is credited instantly after vendor confirmation</li>
                <li>You receive a notification and can track the drop in your history</li>
              </ol>
            </div>

            {/* Security Note */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-yellow-200">
                🔒 Keep Your Barcode Secure
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                This barcode is unique to you. Don't share it with others as it's tied to your 
                wallet and used for payment verification. If you suspect unauthorized use, 
                contact support immediately.
              </p>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Drops</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-500">{stats.confirmed}</div>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-500">{stats.paid}</div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor, type, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="paid">Paid</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            {/* Drop History List */}
            <div className="space-y-3">
              {filteredDrops && filteredDrops.length > 0 ? (
                filteredDrops.map((drop) => (
                  <Card key={drop.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getStatusIcon(drop.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{drop.vendorName}</h4>
                              {getStatusBadge(drop.status)}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>
                                <span className="font-medium">Type:</span> {drop.trashType} • 
                                <span className="font-medium"> Weight:</span> {drop.weight} kg
                              </p>
                              <p>
                                <span className="font-medium">Date:</span> {new Date(drop.createdAt).toLocaleString()}
                              </p>
                              {drop.paidAt && (
                                <p className="text-green-600 dark:text-green-400">
                                  <span className="font-medium">Paid:</span> {new Date(drop.paidAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₦{drop.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">KOBO</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No drop records found</p>
                  <p className="text-sm mt-2">
                    {searchQuery || filterStatus !== "all" 
                      ? "Try adjusting your filters" 
                      : "Start dropping waste at vendors to see your history"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
