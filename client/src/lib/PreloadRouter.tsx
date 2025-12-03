import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { preloadRoute } from "./preloadRoutes";

// Map of routes to their neighboring routes that should be preloaded
const ROUTE_NEIGHBORS: Record<string, string[]> = {
  "/": ["login", "landing"],
  "/login": ["home", "landing"],
  "/profile": ["home", "collectorDashboard", "factoryDashboard", "vendorDashboard"],
  "/collector": ["profile", "home"],
  "/factory": ["profile", "home"],
  "/vendors/dashboard": ["profile", "home"],
  "/about": ["projects", "contact"],
  "/projects": ["about", "getInvolved"],
  "/get-involved": ["projects", "resources"],
  "/resources": ["getInvolved", "whatsNew"],
  "/whats-new": ["resources", "shop"],
  "/shop": ["whatsNew", "careers"],
  "/careers": ["shop", "contact"],
  "/contact": ["careers", "about"],
};

export function PreloadRouter({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const preloadNeighbors = useCallback((currentPath: string) => {
    const neighbors = ROUTE_NEIGHBORS[currentPath];
    if (neighbors) {
      neighbors.forEach(route => {
        requestIdleCallback(() => {
          preloadRoute(route as any);
        });
      });
    }
  }, []);

  useEffect(() => {
    preloadNeighbors(location);
  }, [location, preloadNeighbors]);

  return <>{children}</>;
}