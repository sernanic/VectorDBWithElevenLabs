import React from 'react';
import { renderMarkdown } from '@/utils/markdown';
import { SubsectionContentProps } from '@/types/content';

const SubsectionContent: React.FC<SubsectionContentProps> = ({
  subsection,
  customContent,
  isLoading,
  pageUrl
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const content = customContent || subsection.content;
  const renderedContent = renderMarkdown(content);

  return (
    <div className="prose max-w-none">
      {renderedContent}
    </div>
  );
};

export default SubsectionContent;