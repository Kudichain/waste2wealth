// Critical route components that should be preloaded
const criticalRoutes = {
  // Auth flows
  landing: () => import("../pages/Landing"),
  login: () => import("../pages/Login"),
  home: () => import("../pages/Home"),
  
  // Core features
  profile: () => import("../pages/ProfilePage"),
  collectorDashboard: () => import("../pages/CollectorDashboard"),
  factoryDashboard: () => import("../pages/FactoryDashboard"),
  vendorDashboard: () => import("../pages/VendorDashboard"),

  // Common components
  header: () => import("../components/Header"),
  footer: () => import("../components/Footer"),
};

export const preloadRoute = (route: keyof typeof criticalRoutes) => {
  const preloadComponent = criticalRoutes[route];
  if (preloadComponent) {
    preloadComponent();
  }
};

export const preloadAuthenticatedRoutes = () => {
  // Preload core authenticated routes
  preloadRoute("home");
  preloadRoute("profile");
};

export const preloadDashboardRoute = (role: string) => {
  switch (role) {
    case "collector":
      preloadRoute("collectorDashboard");
      break;
    case "factory":
      preloadRoute("factoryDashboard");
      break;
    case "vendor":
      preloadRoute("vendorDashboard");
      break;
  }
};

export const preloadCommonComponents = () => {
  // Preload shared components
  preloadRoute("header");
  preloadRoute("footer");
};

export default criticalRoutes;