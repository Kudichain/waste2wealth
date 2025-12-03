import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ProfileEditor } from "@/components/ProfileEditor";
import { VendorProfileEditor } from "@/components/VendorProfileEditor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

export default function ProfilePage() {
  const [, setLocation] = useRoute("/profile");
  const [user, setUser] = useState<User | null>(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Not authenticated");
      return res.json() as Promise<User>;
    },
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const isVendor = user.role === "vendor";
  const isCollector = user.role === "collector";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          {isVendor && <TabsTrigger value="business">Business Details</TabsTrigger>}
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information, including photo and bio-data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditor userId={user.id} userRole={user.role || "collector"} />
            </CardContent>
          </Card>
        </TabsContent>

        {isVendor && (
          <TabsContent value="business" className="space-y-4">
            <Card className="border-none">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details, including logo and certification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VendorProfileEditor userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
