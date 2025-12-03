import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Download, 
  Filter,
  Search,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye
} from "lucide-react";

interface PaymentStatement {
  id: string;
  reference: string;
  type: "payment" | "receipt" | "withdrawal" | "refund";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: "completed" | "pending" | "failed" | "reversed";
  paymentMethod: string;
  date: Date;
  metadata?: {
    wasteType?: string;
    weight?: number;
    collectorName?: string;
    vendorName?: string;
  };
}

const mockStatements: PaymentStatement[] = [
  {
    id: "1",
    reference: "PAY-2025-001234",
    type: "payment",
    amount: 12500,
    balanceBefore: 32250,
    balanceAfter: 44750,
    description: "Payment for Plastic (PET) collection",
    status: "completed",
    paymentMethod: "wallet",
    date: new Date(2025, 10, 12, 14, 30),
    metadata: { wasteType: "Plastic", weight: 8.5, vendorName: "GreenWaste Ventures" }
  },
  {
    id: "2",
    reference: "WTH-2025-005678",
    type: "withdrawal",
    amount: 25000,
    balanceBefore: 44750,
    balanceAfter: 19750,
    description: "Withdrawal to bank account",
    status: "completed",
    paymentMethod: "bank_transfer",
    date: new Date(2025, 10, 11, 10, 15),
  },
  {
    id: "3",
    reference: "PAY-2025-001189",
    type: "payment",
    amount: 8400,
    balanceBefore: 19750,
    balanceAfter: 28150,
    description: "Payment for Metal collection",
    status: "completed",
    paymentMethod: "wallet",
    date: new Date(2025, 10, 10, 16, 45),
    metadata: { wasteType: "Aluminum", weight: 4.0, vendorName: "MetalCycle Ltd" }
  },
  {
    id: "4",
    reference: "PAY-2025-001123",
    type: "payment",
    amount: 3600,
    balanceBefore: 28150,
    balanceAfter: 31750,
    description: "Payment for Glass collection",
    status: "pending",
    paymentMethod: "wallet",
    date: new Date(2025, 10, 12, 9, 20),
    metadata: { wasteType: "Glass", weight: 4.5, vendorName: "EcoCollect Hub" }
  },
  {
    id: "5",
    reference: "REF-2025-000891",
    type: "refund",
    amount: 2100,
    balanceBefore: 31750,
    balanceAfter: 33850,
    description: "Refund for cancelled collection",
    status: "completed",
    paymentMethod: "wallet",
    date: new Date(2025, 10, 9, 12, 0),
  },
];

interface PaymentStatementsProps {
  userRole?: "collector" | "vendor" | "factory";
}

export function PaymentStatements({ userRole = "collector" }: PaymentStatementsProps) {
  const [statements] = useState<PaymentStatement[]>(mockStatements);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredStatements = statements.filter(statement => {
    const matchesSearch = statement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         statement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || statement.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalReceived = statements
    .filter(s => (s.type === "payment" || s.type === "receipt") && s.status === "completed")
    .reduce((sum, s) => sum + s.amount, 0);

  const totalWithdrawn = statements
    .filter(s => s.type === "withdrawal" && s.status === "completed")
    .reduce((sum, s) => sum + s.amount, 0);

  const pendingAmount = statements
    .filter(s => s.status === "pending")
    .reduce((sum, s) => sum + s.amount, 0);

  const currentBalance = statements.length > 0 ? statements[0].balanceAfter : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
      case "receipt":
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
      case "refund":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300";
      case "reversed":
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300";
      default:
        return "";
    }
  };

  const downloadStatement = () => {
    // Simulate PDF download
    alert("Statement downloaded! (This would generate a PDF in production)");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">₦{currentBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">₦{totalReceived.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">₦{totalWithdrawn.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Transferred to bank</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">₦{pendingAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Processing payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Statements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Payment Statements</CardTitle>
              <CardDescription>Complete history of all your transactions</CardDescription>
            </div>
            <Button onClick={downloadStatement} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Download className="h-4 w-4 mr-2" />
              Download Statement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>

          {/* Statements List */}
          <div className="space-y-3">
            {filteredStatements.map((statement) => (
              <Card key={statement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getTypeIcon(statement.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{statement.description}</p>
                          <Badge className={getStatusColor(statement.status)}>
                            {statement.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {statement.reference}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {statement.date.toLocaleDateString()} {statement.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {statement.metadata && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {statement.metadata.wasteType && (
                              <span>Type: {statement.metadata.wasteType}</span>
                            )}
                            {statement.metadata.weight && (
                              <span className="ml-3">Weight: {statement.metadata.weight}kg</span>
                            )}
                            {statement.metadata.vendorName && (
                              <span className="ml-3">Vendor: {statement.metadata.vendorName}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        statement.type === "withdrawal" ? "text-red-600" : "text-green-600"
                      }`}>
                        {statement.type === "withdrawal" ? "-" : "+"}₦{statement.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Balance: ₦{statement.balanceAfter.toLocaleString()}
                      </p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStatements.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
