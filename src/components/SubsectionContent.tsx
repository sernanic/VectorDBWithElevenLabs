import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { useTranslation } from "react-i18next";
import TableOfContents from "./TableOfContents";
import { EditButton } from "./EditButton";
import { useToast } from "@/components/ui/use-toast";
import * as Markdoc from "@markdoc/markdoc";
import { getPageContent, savePageContent } from "@/services/pageContent";
import { Loader2 } from "lucide-react";
import { PageContent, DocSubsection } from '@/types/content';

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

const SubsectionContent = () => {
  const { sectionId, subsectionId } = useParams();
  const { i18n } = useTranslation();
  const [sections, setSections] = useState(getDocumentationSections());
  const [content, setContent] = useState<string | null>(null);
  const [tableOfContent, setTableOfContent] = useState<TableOfContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const section = sections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);

  const fetchContent = async () => {
    if (!sectionId || !subsectionId || !i18n.language) {
      return;
    }

    try {
      setIsLoading(true);
      const pageContent = await getPageContent(`${sectionId}/${subsectionId}`, i18n.language) as PageContent;

      if (pageContent) {
        setContent(pageContent.pageMD);
        setTableOfContent(pageContent.tableOfContentMD ? JSON.parse(pageContent.tableOfContentMD) : null);
      } else {
        if (subsection?.content) {
          setContent(subsection.content);
          setTableOfContent(parseMarkdownHeaders(subsection.content));
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
      if (subsection?.content) {
        setContent(subsection.content);
        setTableOfContent(parseMarkdownHeaders(subsection.content));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [i18n.language, sectionId, subsectionId]);

  if (!section || !subsection) {
    return <div className="p-8">Section not found</div>;
  }

  const renderMarkdown = (content: string) => {
    if (!content) {
      return null;
    }

    const ast = Markdoc.parse(content);
    const transformed = Markdoc.transform(ast, {
      nodes: {
        heading: {
          transform(node, config) {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            const title = children.map(child => 
              typeof child === 'string' ? child : child.content
            ).join('');
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            return new Markdoc.Tag(
              'h' + (node.attributes['level'] || 1),
              { 
                ...attributes, 
                id,
                className: 'target:bg-secondary target:transition-colors target:duration-300',
                style: { 
                  scrollMarginTop: '100px',
                  scrollBehavior: 'smooth'
                }
              },
              children
            );
          },
        },
      },
    });
    return Markdoc.renderers.react(transformed, React);
  };

  const parseMarkdownHeaders = (content: string): TableOfContentData => {
    const lines = content.split('\n');
    const headers: TableOfContentHeader[] = [];
    const structure: { [key: string]: TableOfContentHeader } = {};
    
    let currentLevel1: string | null = null;
    let currentLevel2: string | null = null;
    let currentLevel3: string | null = null;

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        const title = line.substring(2).trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const header: TableOfContentHeader = {
          id,
          title,
          level: 1,
          children: []
        };
        headers.push(header);
        structure[id] = header;
        currentLevel1 = id;
        currentLevel2 = null;
        currentLevel3 = null;
      } else if (line.startsWith('## ')) {
        const title = line.substring(3).trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const header: TableOfContentHeader = {
          id,
          title,
          level: 2,
          children: []
        };
        headers.push(header);
        structure[id] = header;
        if (currentLevel1) {
          structure[currentLevel1].children.push(id);
        }
        currentLevel2 = id;
        currentLevel3 = null;
      } else if (line.startsWith('### ')) {
        const title = line.substring(4).trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const header: TableOfContentHeader = {
          id,
          title,
          level: 3,
          children: []
        };
        headers.push(header);
        structure[id] = header;
        if (currentLevel2) {
          structure[currentLevel2].children.push(id);
        }
        currentLevel3 = id;
      }
    });

    return { headers, structure };
  };

  const handleSaveContent = async (newContent: string) => {
    if (!sectionId || !subsectionId || !i18n.language) {
      return;
    }

    try {
      await savePageContent(`${sectionId}/${subsectionId}`, newContent, i18n.language);
      setContent(newContent);
      const parsedTableOfContent = parseMarkdownHeaders(newContent);
      setTableOfContent(parsedTableOfContent);

      toast({
        title: "Success",
        description: "Content saved successfully",
      });

      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            subsections: s.subsections.map(sub => {
              if (sub.id === subsectionId) {
                return { ...sub, content: newContent };
              }
              return sub;
            }),
          };
        }
        return s;
      });
      setSections(updatedSections);
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayContent = content || subsection.content;

  return (
    <div className="flex flex-col md:flex-row relative">
      <div className="w-full md:w-3/4 p-8">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {isLoading ? (
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
        />
      </div>
      <div className="hidden md:block w-1/4 fixed top-20 right-0 h-[calc(100vh-5rem)] overflow-y-auto p-4">
        {displayContent && (
          <TableOfContents 
            content={displayContent} 
            tableOfContent={tableOfContent || parseMarkdownHeaders(displayContent)}
          />
        )}
      </div>
    </div>
  );
};

export default SubsectionContent;
