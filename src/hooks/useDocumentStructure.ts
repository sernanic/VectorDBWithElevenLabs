import { useQuery } from '@tanstack/react-query';
import { getDocumentStructure } from '@/lib/api';
import { DocumentStructure } from '@/lib/api';

interface SidebarItem {
  id: string;
  title: string;
  items?: SidebarItem[];
}

function convertToSidebarFormat(structure: DocumentStructure): SidebarItem[] {
  return Object.entries(structure.sections).map(([sectionId, section]) => ({
    id: sectionId,
    title: section.title,
    items: Object.entries(section.subsections).map(([subsectionId, subsection]) => ({
      id: subsectionId,
      title: subsection.title,
      items: subsection.subsubsections 
        ? Object.entries(subsection.subsubsections).map(([subsubId, subsub]) => ({
            id: subsubId,
            title: subsub.title
          }))
        : undefined
    }))
  }));
}

export function useDocumentStructure(language: string = 'en') {
  const query = useQuery({
    queryKey: ['documentStructure', language],
    queryFn: () => getDocumentStructure(language),
  });

  return {
    ...query,
    sidebarItems: query.data ? convertToSidebarFormat(query.data) : []
  };
} 