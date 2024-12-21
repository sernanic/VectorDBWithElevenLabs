import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { useTranslation } from "react-i18next";
import TableOfContents from "./TableOfContents";
import { EditButton } from "./EditButton";
import { useToast } from "@/components/ui/use-toast";
import * as Markdoc from "@markdoc/markdoc";

const SubsectionContent = () => {
  const { sectionId, subsectionId } = useParams();
  const { i18n } = useTranslation();
  const [sections, setSections] = useState(getDocumentationSections());
  const { toast } = useToast();

  // Force re-render when language changes
  useEffect(() => {
    console.log('Language changed in SubsectionContent:', i18n.language);
    setSections(getDocumentationSections());
  }, [i18n.language]);

  const section = sections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);

  if (!section || !subsection) {
    return <div className="p-8">Section not found</div>;
  }

  const renderMarkdown = (content: string) => {
    const ast = Markdoc.parse(content);
    const transformed = Markdoc.transform(ast);
    return Markdoc.renderers.react(transformed, React);
  };

  const handleSaveContent = async (newContent: string) => {
    try {
      // Parse the new content to separate main content and subsubsections
      const contentLines = newContent.split('\n');
      const mainContent = contentLines[0]; // First line is the main content
      
      // The rest of the content belongs to subsubsections
      const subsubsectionContent = contentLines.slice(1).join('\n');
      
      // For development, we'll update the content in memory
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            subsections: s.subsections.map(sub => {
              if (sub.id === subsectionId) {
                return { 
                  ...sub, 
                  content: mainContent,
                  subsubsections: sub.subsubsections?.map((subsub, index) => ({
                    ...subsub,
                    content: contentLines[index + 1] || subsub.content
                  }))
                };
              }
              return sub;
            }),
          };
        }
        return s;
      });
      
      setSections(updatedSections);

      toast({
        title: "Content updated",
        description: "Changes saved successfully. Note: In development mode, changes are temporary.",
      });

      console.log('Would update locale file:', {
        language: i18n.language,
        sectionId,
        subsectionId,
        mainContent,
        subsubsectionContent
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to update the content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex justify-between gap-8">
        <div className="flex-1 max-w-3xl">
          <div className="prose prose-slate max-w-none">
            {renderMarkdown(subsection.title)}
            <div className="text-lg text-gray-600 mt-4">
              {renderMarkdown(subsection.content)}
            </div>
            {subsection.subsubsections && subsection.subsubsections.length > 0 && (
              <div className="mt-8 space-y-8">
                {subsection.subsubsections.map((subsubsection) => (
                  <section 
                    key={subsubsection.id} 
                    id={subsubsection.id}
                    className="space-y-4"
                  >
                    {renderMarkdown(subsubsection.title)}
                    <div className="text-gray-600">
                      {renderMarkdown(subsubsection.content)}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
        {subsection.subsubsections && (
          <div className="hidden lg:block w-64">
            <TableOfContents subsection={subsection} />
          </div>
        )}
      </div>
      <EditButton 
        content={[
          subsection.content,
          ...(subsection.subsubsections?.map(sub => sub.content) || [])
        ].join('\n')}
        onSave={handleSaveContent}
      />
    </div>
  );
};

export default SubsectionContent;