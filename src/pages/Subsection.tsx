import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SubsectionContent from '@/components/SubsectionContent';
import { getPageContent } from '@/services/pageContent';
import { DocSubsection } from '@/types/content';

const Subsection = () => {
  const { sectionId, subsectionId } = useParams<{ sectionId: string; subsectionId: string }>();
  const pageUrl = `${sectionId}/${subsectionId}`;

  const { data: customContent, isLoading } = useQuery({
    queryKey: ['pageContent', pageUrl],
    queryFn: () => getPageContent(pageUrl),
    enabled: !!pageUrl
  });

  const subsection: DocSubsection = {
    id: subsectionId || '',
    title: '',
    content: ''
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SubsectionContent
        subsection={subsection}
        customContent={customContent?.pageMD || null}
        isLoading={isLoading}
        pageUrl={pageUrl}
      />
    </div>
  );
};

export default Subsection;