import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { useTranslation } from "react-i18next";
import TableOfContents from "./TableOfContents";
import { EditButton } from "./EditButton";
import { useToast } from "@/components/ui/use-toast";
import * as Markdoc from "@markdoc/markdoc";
import { getPageContent, savePageContent } from "@/services/pageContent";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDocumentStructure } from "@/hooks/useDocumentStructure";

interface TableOfContentHeader {
  id: string;
  title: string;
  level: number;
  children: string[];
}

interface TableOfContentData {
  headers: TableOfContentHeader[];
  structure: { [key: string]: TableOfContentHeader };
}

interface PageContent {
  pageMD: string;
  tableOfContentMD: string;
}

interface SubsectionItem {
  id: string;
  title: string;
}

interface SectionItem {
  id: string;
  title: string;
  items?: SubsectionItem[];
}

interface DocumentStructure {
  sections: {
    [key: string]: {
      title: string;
      subsections: {
        [key: string]: {
          title: string;
          content: string;
          subsubsections: Record<string, any>;
        };
      };
    };
  };
}

interface PageContentResponse {
  pageContent: string;
  tableOfContent: TableOfContentData | null;
  _id: string;
  pageURL: string;
  headers: any[];
  structure: Record<string, any>;
}

const SubsectionContent = () => {
  const { sectionId, subsectionId } = useParams();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  
  const [content, setContent] = useState<string | null>(null);
  const [tableOfContent, setTableOfContent] = useState<TableOfContentData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const { 
    data: documentStructure, 
    isLoading: isLoadingStructure, 
    error: structureError 
  } = useDocumentStructure(i18n.language);

  useEffect(() => {
    if (structureError) {
      toast({
        title: "Error",
        description: "Failed to load documentation structure",
        variant: "destructive",
      });
    }
  }, [structureError, toast]);

  const fetchContent = useCallback(async () => {
    if (!i18n.language) {
      console.warn('Missing language parameter');
      return;
    }

    try {
      setIsLoadingContent(true);
      const contentId = `${sectionId}/${subsectionId}`;
      console.log('Fetching content with ID:', contentId);
      
      const result = await getPageContent(contentId, i18n.language);
      console.log('Received content:', result);

      if (result && result.pageContent) {
        setContent(result.pageContent);
        setTableOfContent(result.tableOfContent || parseMarkdownHeaders(result.pageContent));
      } else {
        console.warn('No content received from API');
        setContent(null);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContent(false);
    }
  }, [sectionId, subsectionId, i18n.language, toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSaveContent = useCallback(async (newContent: string) => {
    if (!sectionId || !subsectionId || !i18n.language) {
      toast({
        title: "Error",
        description: "Missing required parameters for saving content",
        variant: "destructive",
      });
      return;
    }

    try {
      const contentId = `${sectionId}/${subsectionId}`;
      console.log('Saving content with ID:', contentId);
      
      const result = await savePageContent(contentId, i18n.language, newContent);
      console.log('Save result:', result);
      
      if (result) {
        setContent(result.pageContent);
        setTableOfContent(result.tableOfContent || parseMarkdownHeaders(result.pageContent));
        
        toast({
          title: "Success",
          description: "Content saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    }
  }, [sectionId, subsectionId, i18n.language, toast]);

  const renderMarkdown = (markdownContent: string) => {
    try {
      const ast = Markdoc.parse(markdownContent);
      const config = {
        nodes: {
          paragraph: {
            render: 'p',
            attributes: {
              className: 'mb-4'
            }
          },
          heading: {
            render: 'h1',
            attributes: {
              id: { type: String },
              level: { type: Number },
              className: 'scroll-mt-20'
            }
          }
        }
      };
      
      const transformedContent = Markdoc.transform(ast, config);
      return Markdoc.renderers.react(transformedContent, React);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return <div className="text-red-500">Error rendering content</div>;
    }
  };

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
              tableOfContent={tableOfContent || parseMarkdownHeaders(displayContent)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsectionContent;