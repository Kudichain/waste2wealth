import { preloadRoute } from "@/lib/preloadRoutes";

interface PreloadLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  role?: string;
}

export function PreloadLink({ to, children, className, role }: PreloadLinkProps) {
  const handlePrefetch = () => {
    // Map routes to their preload functions
    switch (to) {
      case "/":
        preloadRoute("landing");
        break;
      case "/login":
        preloadRoute("login");
        break;
      case "/profile":
        preloadRoute("profile");
        break;
      case "/collector":
        preloadRoute("collectorDashboard");
        break;
      case "/factory":
        preloadRoute("factoryDashboard");
        break;
      case "/vendors/dashboard":
        preloadRoute("vendorDashboard");
        break;
    }
  };

  return (
    <a
      href={to}
      className={className}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      role={role}
    >
      {children}
    </a>
  );
}