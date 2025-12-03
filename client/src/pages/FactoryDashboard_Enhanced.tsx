import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Factory,
  TrendingUp, 
  Package, 
  Truck, 
  FileCheck, 
  BarChart3, 
  Leaf, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  Activity,
  Award,
  FileText,
  Users,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SupplyRequest {
  id: string;
  vendorName: string;
  wasteType: string;
  quantity: number;
  location: string;
  distance: string;
  requestedDate: string;
  status: "pending" | "approved" | "in_transit" | "delivered";
  estimatedValue: number;
}

interface ComplianceItem {
  id: string;
  title: string;
  type: "certificate" | "report" | "inspection";
  status: "valid" | "expiring_soon" | "expired";
  expiryDate: string;
  lastUpdated: string;
}

export default function FactoryDashboard_Enhanced() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("supply");

  // Mock data
  const stats = {
    monthlyCapacity: 500,
    currentUtilization: 342,
    activeSuppliers: 12,
    pendingDeliveries: 5,
    co2Offset: 8540,
    complianceScore: 98,
    monthlyRevenue: 4250000,
    processingEfficiency: 87
  };

  const supplyRequests: SupplyRequest[] = [
    {
      id: "1",
      vendorName: "GreenWaste Ventures",
      wasteType: "Plastic (PET)",
      quantity: 150,
      location: "Ikeja, Lagos",
      distance: "8.5 km",
      requestedDate: "Today",
      status: "pending",
      estimatedValue: 225000
    },
    {
      id: "2",
      vendorName: "MetalCycle Ltd",
      wasteType: "Aluminum",
      quantity: 200,
      location: "Victoria Island",
      distance: "12.3 km",
      requestedDate: "Today",
      status: "approved",
      estimatedValue: 420000
    },
    {
      id: "3",
      vendorName: "EcoCollect Hub",
      wasteType: "Mixed Plastic",
      quantity: 180,
      location: "Surulere",
      distance: "6.2 km",
      requestedDate: "Yesterday",
      status: "in_transit",
      estimatedValue: 270000
    }
  ];

  const compliance: ComplianceItem[] = [
    { id: "1", title: "Environmental Impact Assessment", type: "report", status: "valid", expiryDate: "2026-08-15", lastUpdated: "2025-02-10" },
    { id: "2", title: "NESREA Operating License", type: "certificate", status: "expiring_soon", expiryDate: "2025-12-20", lastUpdated: "2024-12-15" },
    { id: "3", title: "ISO 14001 Certification", type: "certificate", status: "valid", expiryDate: "2027-03-10", lastUpdated: "2024-03-10" },
    { id: "4", title: "Quarterly Safety Inspection", type: "inspection", status: "expired", expiryDate: "2025-10-30", lastUpdated: "2025-07-28" },
  ];

  const sustainabilityMetrics = [
    { label: "CO₂ Emissions Offset", value: "8,540 kg", change: "+12%", trend: "up", icon: Leaf, color: "text-green-600" },
    { label: "Waste Diverted from Landfills", value: "342 tons", change: "+18%", trend: "up", icon: Package, color: "text-blue-600" },
    { label: "Energy Efficiency", value: "87%", change: "+5%", trend: "up", icon: Activity, color: "text-purple-600" },
    { label: "Water Recycled", value: "12,400 L", change: "+8%", trend: "up", icon: TrendingUp, color: "text-cyan-600" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300";
      case "approved": return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
      case "in_transit": return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300";
      case "delivered": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300";
      default: return "";
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "valid": return { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-300", label: "Valid" };
      case "expiring_soon": return { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300", label: "Expiring Soon" };
      case "expired": return { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-300", label: "Expired" };
      default: return { bg: "", text: "", label: "" };
    }
  };

  const utilizationPercentage = (stats.currentUtilization / stats.monthlyCapacity) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-outfit mb-2">
            Welcome, <span className="text-purple-600">{user?.username || "Factory"}</span>! 🏭
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor operations, track compliance, and optimize your processing facility
          </p>
        </div>

        {/* Capacity Banner */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none">
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Factory className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Monthly Processing Capacity</p>
                  <p className="text-3xl font-bold">{stats.currentUtilization} / {stats.monthlyCapacity} tons</p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Capacity Utilization</span>
                  <span className="text-sm font-medium">{utilizationPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={utilizationPercentage} className="bg-white/20" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                {stats.processingEfficiency}% Efficiency
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">₦{(stats.monthlyRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-muted-foreground mt-1">Processing & sales</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.activeSuppliers}</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.pendingDeliveries} pending deliveries</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                CO₂ Offset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.co2Offset} kg</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.complianceScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">Regulatory compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Alert */}
        {compliance.some(c => c.status === "expired" || c.status === "expiring_soon") && (
          <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-950">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      Compliance Action Required
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {compliance.filter(c => c.status === "expired").length} expired, {compliance.filter(c => c.status === "expiring_soon").length} expiring soon
                    </p>
                  </div>
                </div>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => setSelectedTab("compliance")}>
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[700px]">
            <TabsTrigger value="supply">
              <Package className="h-4 w-4 mr-2" />
              Supply Requests
            </TabsTrigger>
            <TabsTrigger value="logistics">
              <Truck className="h-4 w-4 mr-2" />
              Logistics
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileCheck className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="sustainability">
              <Leaf className="h-4 w-4 mr-2" />
              Sustainability
            </TabsTrigger>
          </TabsList>

          {/* Supply Requests Tab */}
          <TabsContent value="supply" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold font-outfit">Supply Requests</h2>
                <p className="text-muted-foreground">Manage incoming waste supply from vendors</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Package className="h-4 w-4 mr-2" />
                Create New Request
              </Button>
            </div>

            {supplyRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{request.wasteType}</Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">{request.vendorName}</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{request.quantity} tons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{request.distance} away</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{request.requestedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>₦{(request.estimatedValue / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        📍 {request.location}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="outline">
                            Negotiate
                          </Button>
                        </>
                      )}
                      {request.status === "approved" && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Truck className="h-4 w-4 mr-2" />
                          Schedule Pickup
                        </Button>
                      )}
                      {request.status === "in_transit" && (
                        <Button variant="outline">
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Shipment
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-outfit mb-2">Logistics Management</h2>
              <p className="text-muted-foreground">Track shipments and deliveries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">In Transit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">5</p>
                  <p className="text-xs text-muted-foreground mt-1">Active shipments</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Delivered Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">12</p>
                  <p className="text-xs text-muted-foreground mt-1">158 tons received</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">8</p>
                  <p className="text-xs text-muted-foreground mt-1">Next 48 hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { vendor: "GreenWaste Ventures", type: "Plastic", weight: 150, time: "2 hours ago", status: "delivered" },
                    { vendor: "MetalCycle Ltd", type: "Aluminum", weight: 200, time: "5 hours ago", status: "delivered" },
                    { vendor: "EcoCollect Hub", type: "Mixed", weight: 180, time: "1 day ago", status: "delivered" },
                  ].map((delivery, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{delivery.vendor}</p>
                          <p className="text-sm text-muted-foreground">{delivery.type} • {delivery.weight} tons</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950">Delivered</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{delivery.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-outfit mb-2">Compliance & Certifications</h2>
              <p className="text-muted-foreground">Manage regulatory requirements and certifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compliance.map((item) => {
                const statusInfo = getComplianceColor(item.status);
                const IconComponent = item.type === "certificate" ? Award : item.type === "inspection" ? FileCheck : FileText;
                
                return (
                  <Card key={item.id} className={`hover:shadow-lg transition-shadow ${item.status === "expired" ? "border-red-300" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${statusInfo.text}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription className="text-xs">{item.type.replace("_", " ")}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expiry Date:</span>
                          <span className="font-medium">{new Date(item.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-3 w-3 mr-1" />
                          View Document
                        </Button>
                        {item.status !== "valid" && (
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <ChevronRight className="h-3 w-3 mr-1" />
                            Renew
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-outfit mb-2">Sustainability Report</h2>
              <p className="text-muted-foreground">Environmental impact and green metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {sustainabilityMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full bg-${metric.color.split('-')[1]}-100 dark:bg-${metric.color.split('-')[1]}-900 flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 ${metric.color}`} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                            <p className="text-2xl font-bold">{metric.value}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950">
                          {metric.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Impact Breakdown</CardTitle>
                <CardDescription>Environmental contributions this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: "Plastic Recycled", amount: "125 tons", impact: "3,750 kg CO₂ saved", percentage: 36 },
                  { category: "Metal Processed", amount: "98 tons", impact: "2,940 kg CO₂ saved", percentage: 29 },
                  { category: "Glass Recycled", amount: "75 tons", impact: "1,125 kg CO₂ saved", percentage: 22 },
                  { category: "E-Waste Handled", amount: "44 tons", impact: "725 kg CO₂ saved", percentage: 13 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.amount} • {item.impact}</p>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
