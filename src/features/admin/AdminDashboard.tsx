import { useBreadcrumbStore } from "@/store/breadcrumbStore";
import { useEffect } from "react";

export function AdminDashboard() {
  const resetBreadcrumbs = useBreadcrumbStore((state) => state.resetBreadcrumbs);
  
  useEffect(() => {
    resetBreadcrumbs();
  }, [resetBreadcrumbs]);

  // ... rest of the component
} 