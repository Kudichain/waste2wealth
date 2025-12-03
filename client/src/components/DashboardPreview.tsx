import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Gauge, Wallet } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900/60 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Your Mission Control</h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">A modern, intuitive dashboard to track your earnings and impact.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Hero Illustration Card */}
          <Card className="lg:col-span-1 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Impact Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 rounded-xl bg-white/20 backdrop-blur-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white/15 p-3 text-center">
                    <div className="text-xs opacity-90">CO₂ Offset</div>
                    <div className="text-xl font-bold">1.2t</div>
                  </div>
                  <div className="rounded-lg bg-white/15 p-3 text-center">
                    <div className="text-xs opacity-90">Collections</div>
                    <div className="text-xl font-bold">87</div>
                  </div>
                  <div className="rounded-lg bg-white/15 p-3 text-center">
                    <div className="text-xs opacity-90">Factories</div>
                    <div className="text-xl font-bold">12</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collector Dashboard Preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4 text-green-600"/> Collector Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 dark:text-gray-400">Wallet Balance</span>
                <span className="font-bold text-lg text-green-600">250,000 KOBO</span>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Recent Tasks</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Plastic Bottles</span>
                    <Badge variant="secondary">Completed</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Cardboard</span>
                    <Badge variant="outline">In Progress</Badge>
                  </li>
                </ul>
              </div>
              <Button className="w-full">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Factory Dashboard Preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4 text-blue-600"/> Factory Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 dark:text-gray-400">Incoming Waste</span>
                <span className="font-bold text-lg text-blue-600">5,000 kg</span>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Active Zones</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Zone A</span>
                    <Badge variant="secondary">High Activity</Badge>
                  </li>
                  <li className="flex justify-between">
                    <span>Zone B</span>
                    <Badge variant="outline">Moderate Activity</Badge>
                  </li>
                </ul>
              </div>
              <Button className="w-full">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
