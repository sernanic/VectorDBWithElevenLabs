import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import SubsectionContent from "@/components/SubsectionContent";
import { useQuery } from "@tanstack/react-query";
import { getPageContent } from "@/services/pageContent";

const Subsection = () => {
  const { sectionId, subsectionId } = useParams<{ sectionId: string; subsectionId: string }>();
  const pageUrl = `${sectionId}/${subsectionId}`;

  const { data: customContent, isLoading } = useQuery({
    queryKey: ['pageContent', pageUrl],
    queryFn: async () => getPageContent(pageUrl),
    enabled: !!pageUrl,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const subsection = {
    id: subsectionId || '',
    title: '',
    content: ''
  };

  const sections = getDocumentationSections();
  const section = sections.find(s => s.id === sectionId);
  const currentSubsection = section?.subsections.find(s => s.id === subsectionId);

  if (currentSubsection) {
    subsection.title = currentSubsection.title;
    subsection.content = currentSubsection.content;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <SubsectionContent 
        subsection={subsection} 
        customContent={customContent?.pageMD || ''} 
        isLoading={isLoading} 
        pageUrl={pageUrl} 
      />
    </div>
  );
};

export default Subsection;