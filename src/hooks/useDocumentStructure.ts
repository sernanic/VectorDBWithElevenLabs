import { useQuery } from "@tanstack/react-query";
import { getDocumentStructure } from "@/services/pageContent";

interface Subsubsection {
  title: string;
  content: string;
}

interface Subsection {
  title: string;
  content: string;
  subsubsections?: Record<string, Subsubsection>;
}

interface Section {
  title: string;
  subsections: Record<string, Subsection>;
}

interface DocumentStructure {
  sections: Record<string, Section>;
}

export function useDocumentStructure(language: string = 'en') {
  return useQuery<DocumentStructure>({
    queryKey: ['documentStructure', language],
    queryFn: () => getDocumentStructure(language),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });
}

// Helper function to convert document structure to sidebar format
export function convertToSidebarFormat(documentStructure: DocumentStructure) {
  return Object.entries(documentStructure.sections).map(([sectionId, section]) => ({
    id: sectionId,
    title: section.title,
    subsections: Object.entries(section.subsections).map(([subsectionId, subsection]) => ({
      id: subsectionId,
      title: subsection.title,
      content: subsection.content
    }))
  }));
} 