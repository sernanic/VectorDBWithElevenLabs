import { create } from 'zustand';

export interface Breadcrumb {
  label: string;
  path: string;
}

interface BreadcrumbStore {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  resetBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  addBreadcrumb: (breadcrumb) =>
    set((state) => ({
      breadcrumbs: [...state.breadcrumbs, breadcrumb],
    })),
  resetBreadcrumbs: () => set({ breadcrumbs: [] }),
})); 