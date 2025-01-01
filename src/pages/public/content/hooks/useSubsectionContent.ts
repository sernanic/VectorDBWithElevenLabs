import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { getPageContent, savePageContent } from "@/services/pageContent";
import { useDocumentStructure } from "@/hooks/useDocumentStructure";
import * as Markdoc from "@markdoc/markdoc";
import React from "react";

export interface TableOfContentHeader {
  id: string;
  title: string;
  level: number;
  children: string[];
}

export interface TableOfContentData {
  headers: TableOfContentHeader[];
  structure: { [key: string]: TableOfContentHeader };
}

export function parseMarkdownHeaders(markdown: string): TableOfContentData {
  const ast = Markdoc.parse(markdown);
  const headers: TableOfContentHeader[] = [];
  const structure: { [key: string]: TableOfContentHeader } = {};

  // Walk through the AST to find headers
  const walk = (node: any) => {
    if (node.type === 'heading') {
      const title = node.children?.[0]?.content || '';
      const id = title.toLowerCase().replace(/\s+/g, '-');
      const header = {
        id,
        title,
        level: node.attributes?.level || 1,
        children: []
      };
      headers.push(header);
      structure[id] = header;
    }
    node.children?.forEach(walk);
  };

  walk(ast);
  return { headers, structure };
}

export function useSubsectionContent() {
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
      const result = await getPageContent(contentId, i18n.language);

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
      const result = await savePageContent(contentId, i18n.language, newContent);
      
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

  const renderMarkdown = useCallback((markdownContent: string) => {
    try {
      const ast = Markdoc.parse(markdownContent);
      const config = {
        nodes: {
          paragraph: {
            render: 'p',
            attributes: {
              className: { type: String, default: 'mb-4' }
            }
          },
          heading: {
            render: 'h1',
            attributes: {
              id: { type: String },
              level: { type: Number },
              className: { type: String, default: 'scroll-mt-20' }
            }
          }
        }
      };
      
      const transformedContent = Markdoc.transform(ast, config);
      return Markdoc.renderers.react(transformedContent, React);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return React.createElement('div', { className: 'text-red-500' }, 'Error rendering content');
    }
  }, []);

  return {
    content,
    tableOfContent,
    isLoadingContent,
    isLoadingStructure,
    documentStructure,
    handleSaveContent,
    renderMarkdown,
    sectionId,
    subsectionId
  };
} 