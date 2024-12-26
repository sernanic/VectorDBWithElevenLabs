import React, { useEffect } from "react";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";

export function UsersManagement() {
  const { setBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Users",
        path: "/admin/users"
      }
    ]);
  }, [setBreadcrumbs]);

  return (
    // Rest of the component code
  );
} 