import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TableOfContents from "./components/TableOfContents";
import { EditButton } from "@/components/public/editContent/EditButton";
import { useSubsectionContent } from "./hooks/useSubsectionContent";

const SubsectionContent = () => {
  const {
    content,
    tableOfContent,
    isLoadingContent,
    isLoadingStructure,
    documentStructure,
    handleSaveContent,
    renderMarkdown,
    sectionId,
    subsectionId
  } = useSubsectionContent();

  if (isLoadingStructure) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading documentation structure...</span>
      </div>
    );
  }

  if (!documentStructure) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-800">Documentation Not Available</h2>
          <p className="text-sm text-red-600 mt-2">
            The documentation structure could not be loaded. Please try again later.
          </p>
          <div className="mt-4">
            <Link to="/" className="text-sm text-red-600 hover:text-red-800 underline">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const section = documentStructure.sections[sectionId || ''];
  const subsection = section?.subsections[subsectionId || ''];

  if (!section || !subsection) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-800">Section Not Found</h2>
          <p className="text-sm text-red-600 mt-2">
            The requested section {sectionId ? `"${sectionId}"` : ""} 
            {subsectionId ? ` or subsection "${subsectionId}"` : ""} could not be found.
          </p>
          <div className="mt-4">
            <Link to="/" className="text-sm text-red-600 hover:text-red-800 underline">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayContent = content || subsection.content;

  return (
    <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-64px)] overflow-hidden">
      <div className="w-full md:w-3/4 overflow-y-auto">
        <div className="p-8">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {isLoadingContent ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : displayContent ? (
              renderMarkdown(displayContent)
            ) : (
              <div>No content available</div>
            )}
          </div>
          <EditButton 
            content={displayContent || ''} 
            onSave={handleSaveContent} 
            key={`edit-button-${!!displayContent}`}
          />
        </div>
      </div>
      <div className="hidden md:block w-1/4 overflow-y-auto border-l border-border">
        <div className="sticky top-0 p-4">
          {displayContent && (
            <TableOfContents 
              content={displayContent} 
              tableOfContent={tableOfContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsectionContent;