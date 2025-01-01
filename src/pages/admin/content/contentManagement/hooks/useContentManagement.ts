// src/pages/admin/content/contentManagement/hooks/useContentManagement.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addSection, getDocumentStructure } from "@/services/pageContent";
import { useToast } from "@/components/ui/use-toast";

export const useContentManagement = () => {
  const navigate = useNavigate();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setBreadcrumbs([{ label: "Content Management", path: "/admin/content" }]);
  }, [setBreadcrumbs]);

  const { data: contentData, isLoading, error } = useQuery({
    queryKey: ['documentStructure'],
    queryFn: async () => {
      const data = await getDocumentStructure('en');
      return data;
    }
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const addSectionMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      const sectionId = data.title.toLowerCase().replace(/\s+/g, '-');
      return addSection('en', { section_id: sectionId, title: `# ${data.title}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentStructure'] });
      setIsAddSectionOpen(false);
      toast({ title: "Success", description: "Section added successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add section. Please try again." });
    }
  });

  const onSubmit = (data: { title: string }) => {
    addSectionMutation.mutate(data);
  };

  const hasSections = contentData?.sections && Object.keys(contentData.sections).length > 0;

  return {
    navigate,
    setBreadcrumbs,
    expandedSections,
    isAddSectionOpen,
    setIsAddSectionOpen,
    toggleSection,
    addSectionMutation,
    onSubmit,
    contentData,
    isLoading,
    error,
    hasSections,
  };
};