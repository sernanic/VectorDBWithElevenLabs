import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";
import { useToast } from "@/components/ui/use-toast";
import { addSubsection, getDocumentStructure, addWebContent } from "@/services/pageContent";

interface AddSubsectionForm {
  title: string;
  content: string;
}

interface AddWebContentForm {
  url: string;
  title: string;
}

export function useSectionDetails() {
  const { sectionId } = useParams();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const { toast } = useToast();
  const [isAddSubsectionOpen, setIsAddSubsectionOpen] = useState(false);
  const [isAddWebContentOpen, setIsAddWebContentOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch document structure
  const { data: documentStructure, isLoading, error } = useQuery({
    queryKey: ['documentStructure'],
    queryFn: () => getDocumentStructure('en'),
  });

  const section = documentStructure?.sections[sectionId as string];
  const sectionName = section?.title.replace("#", "").trim() || "Section";
  const subsections = section?.subsections || {};
  const subsectionsCount = Object.keys(subsections).length;

  // Update breadcrumbs when section changes
  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Content Management",
        path: "/admin/content"
      },
      {
        label: sectionName,
        path: `/admin/content/section/${sectionId}`
      }
    ]);
  }, [setBreadcrumbs, sectionId, sectionName]);

  const addSubsectionMutation = useMutation({
    mutationFn: async (data: AddSubsectionForm) => {
      const subsectionId = data.title.toLowerCase().replace(/\s+/g, '-');
      return addSubsection('en', {
        section_id: sectionId as string,
        subsection_id: subsectionId,
        title: `## ${data.title}`,
        content: data.content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentStructure'] });
      setIsAddSubsectionOpen(false);
      toast({
        title: "Success",
        description: "Subsection added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add subsection. Please try again.",
      });
    }
  });

  const addWebContentMutation = useMutation({
    mutationFn: (data: AddWebContentForm & { sectionId: string }) => {
      return addWebContent({
        url: data.url,
        section_id: data.sectionId,
        title: data.title
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentStructure'] });
      setIsAddWebContentOpen(false);
      toast({
        title: "Success",
        description: "Web content imported successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      let errorMessage = 'Failed to import web content. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  });

  return {
    sectionId,
    section,
    sectionName,
    subsections,
    subsectionsCount,
    isLoading,
    error,
    isAddSubsectionOpen,
    setIsAddSubsectionOpen,
    isAddWebContentOpen,
    setIsAddWebContentOpen,
    addSubsectionMutation,
    addWebContentMutation,
  };
} 