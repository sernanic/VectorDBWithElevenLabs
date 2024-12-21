import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { useTranslation } from "react-i18next";
import TableOfContents from "./TableOfContents";
import { EditButton } from "./EditButton";
import { useToast } from "@/components/ui/use-toast";
import * as Markdoc from "@markdoc/markdoc";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface TableOfContentHeader {
  id: string;
  title: string;
  level: number;
  children: string[]; // Array of child header IDs
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

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, i18n.language, `${sectionId}-${subsectionId}`);
      
      // Create a promise that resolves after 3 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });

      // Race between the Firestore fetch and the timeout
      const result = await Promise.race([
        getDoc(docRef),
        timeoutPromise
      ]);

      if (result && 'exists' in result && result.exists()) {
        const data = result.data();
        setContent(data.pageContent);
        setTableOfContent(data.tableOfContent || null);
      } else {
        // If timeout won or document doesn't exist, use default content
        const section = sections.find((s) => s.id === sectionId);
        const subsection = section?.subsections.find((s) => s.id === subsectionId);
        const newContent = subsection?.content || null;
        setContent(newContent);
        if (newContent) {
          setTableOfContent(parseMarkdownHeaders(newContent));
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
      // On error, fall back to default content
      const section = sections.find((s) => s.id === sectionId);
      const subsection = section?.subsections.find((s) => s.id === subsectionId);
      const newContent = subsection?.content || null;
      setContent(newContent);
      if (newContent) {
        setTableOfContent(parseMarkdownHeaders(newContent));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch content when component mounts or language/section/subsection changes
  useEffect(() => {
    if (sectionId && subsectionId) {
      fetchContent();
    }
  }, [i18n.language, sectionId, subsectionId]);

  useEffect(() => {
    // Initialize table of contents when content changes
    if (content) {
      const newTableOfContent = parseMarkdownHeaders(content);
      setTableOfContent(newTableOfContent);
    }
  }, [content]);

  const section = sections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);

  if (!section || !subsection) {
    return <div className="p-8">Section not found</div>;
  }

  const renderMarkdown = (content: string) => {
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
        if (currentLevel1) {
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
        }
      } else if (line.startsWith('### ')) {
        if (currentLevel1 && currentLevel2) {
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
      }
    });

    return { headers, structure };
  };

  const handleSaveContent = async (newContent: string) => {
    try {
      const currentLanguage = i18n.language;
      const tableOfContent = parseMarkdownHeaders(newContent);

      // Create the document data
      const docData = {
        pageContent: newContent,
        pageURL: `/${sectionId}/${subsectionId}`,
        tableOfContent
      };

      // Reference to the language collection and document
      const languageCollectionRef = collection(db, currentLanguage);
      const docRef = doc(languageCollectionRef, `${sectionId}-${subsectionId}`);

      // Save to Firestore
      await setDoc(docRef, docData);
      
      // Update local state
      setContent(newContent);
      setTableOfContent(tableOfContent);

      // Show success toast
      toast({
        title: "Content saved",
        description: "The content has been saved to the database",
      });

      // Update sections state
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

  return (
    <div className="flex flex-col md:flex-row relative">
      <div className="w-full md:w-3/4 p-8">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            content !== null ? renderMarkdown(content) : renderMarkdown(subsection.content)
          )}
        </div>
        <EditButton 
          content={content || subsection.content} 
          onSave={handleSaveContent} 
        />
      </div>
      <div className="hidden md:block w-1/4 fixed top-20 right-0 h-[calc(100vh-5rem)] overflow-y-auto p-4">
        <TableOfContents 
          content={content || subsection.content} 
          tableOfContent={tableOfContent}
        />
      </div>
    </div>
  );
};

export default SubsectionContent;