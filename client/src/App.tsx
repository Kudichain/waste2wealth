import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { lazy, Suspense, useEffect } from "react";
import NotFound from "@/pages/not-found";
import { useKeyboardNavigation } from "@/lib/accessibility";

// Landing and auth pages
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const VendorLogin = lazy(() => import("@/pages/VendorLogin"));

// Core authenticated pages
const Home = lazy(() => import("@/pages/Home"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

// Dashboard pages
const CollectorDashboard = lazy(() => import("@/pages/CollectorDashboard"));
const FactoryDashboard = lazy(() => import("@/pages/FactoryDashboard"));
const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

// Onboarding pages
const RegisterFactory = lazy(() => import("@/pages/RegisterFactory"));
const CollectorOnboarding = lazy(() => import("@/pages/CollectorOnboarding"));
const VendorOnboarding = lazy(() => import("@/pages/VendorOnboarding"));

// Information pages
const ForCollectors = lazy(() => import("@/pages/ForCollectors"));
const ForFactories = lazy(() => import("@/pages/ForFactories"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const Partners = lazy(() => import("@/pages/Partners"));
const Impact = lazy(() => import("@/pages/Impact"));
const Projects = lazy(() => import("@/pages/Projects"));
const GetInvolved = lazy(() => import("@/pages/GetInvolved"));
const Resources = lazy(() => import("@/pages/Resources"));
const WhatsNew = lazy(() => import("@/pages/WhatsNew"));
const EventGallery = lazy(() => import("@/pages/EventGallery"));

// Utility pages
const Shop = lazy(() => import("@/pages/Shop"));
const Careers = lazy(() => import("@/pages/Careers"));
const Contact = lazy(() => import("@/pages/Contact"));
const OfficeLocations = lazy(() => import("@/pages/OfficeLocations"));

// Legal pages
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));

function RoleProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

import { preloadAuthenticatedRoutes, preloadDashboardRoute, preloadCommonComponents } from "@/lib/preloadRoutes";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Preload critical routes based on auth state
  React.useEffect(() => {
    if (isAuthenticated) {
      // Preload authenticated routes
      preloadAuthenticatedRoutes();
      
      // Preload role-specific dashboard
      if (user?.role) {
        preloadDashboardRoute(user.role);
      }
    }
    
    // Always preload common components
    preloadCommonComponents();
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const protectedRoutes = [
        "/admin/dashboard",
        "/collector",
        "/factory",
        "/profile",
        "/vendors/dashboard",
      ];

      const isProtectedPath = protectedRoutes.some((route) => {
        if (location === route) {
          return true;
        }
        return location.startsWith(`${route}/`);
      });

      if (isProtectedPath) {
        setLocation("/");
      }
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/for-collectors" component={ForCollectors} />
        <Route path="/for-factories" component={ForFactories} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/about" component={AboutUs} />
        <Route path="/partners" component={Partners} />
        <Route path="/impact" component={Impact} />
        <Route path="/contact" component={Contact} />
        <Route path="/office-locations" component={OfficeLocations} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/cookies" component={CookiePolicy} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard">
          {() => <RoleProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
        </Route>
        <Route path="/projects" component={Projects} />
        <Route path="/get-involved" component={GetInvolved} />
        <Route path="/resources" component={Resources} />
        <Route path="/whats-new" component={WhatsNew} />
        <Route path="/event-gallery" component={EventGallery} />
        <Route path="/shop" component={Shop} />
        <Route path="/careers" component={Careers} />
        <Route path="/register-factory" component={RegisterFactory} />
        <Route path="/collectors/register" component={CollectorOnboarding} />
        <Route path="/vendors/login" component={VendorLogin} />
        <Route path="/vendors/register" component={VendorOnboarding} />
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/collector">
              {() => <RoleProtectedRoute component={CollectorDashboard} allowedRoles={["collector", "admin"]} />}
            </Route>
            <Route path="/factory">
              {() => <RoleProtectedRoute component={FactoryDashboard} allowedRoles={["factory", "admin"]} />}
            </Route>
            <Route path="/vendors/dashboard">
              {() => <RoleProtectedRoute component={VendorDashboard} allowedRoles={["vendor", "admin"]} />}
            </Route>
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

import { PreloadRouter } from "@/lib/PreloadRouter";
import React from "react";

function App() {
  // Initialize keyboard navigation detection
  useKeyboardNavigation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <PreloadRouter>
              <Toaster />
              <Router />
            </PreloadRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
