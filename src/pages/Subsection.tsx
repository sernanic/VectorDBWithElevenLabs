import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SubsectionContent from "@/components/SubsectionContent";
import { documentationSections } from "@/data/docs";
import { getPageContent } from "@/services/pageContent";
import { useToast } from "@/components/ui/use-toast";
import { PageContent } from "@/types/content";

const Subsection = () => {
  const { sectionId, subsectionId } = useParams();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const section = documentationSections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);
  const pageUrl = sectionId && subsectionId ? `${sectionId}/${subsectionId}` : '';

  useEffect(() => {
    const fetchContent = async () => {
      if (!pageUrl) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const pageContent = await getPageContent(pageUrl) as PageContent;
        
        if (pageContent) {
          setContent(pageContent.pageMD);
        } else {
          setContent(null);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: "Error",
          description: "Failed to load page content. Using default content instead.",
          variant: "destructive",
        });
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [pageUrl, toast]);

  if (!subsection) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">
            Subsection not found
          </h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {subsection && (
        <SubsectionContent 
          subsection={subsection}
          customContent={content}
          isLoading={isLoading}
          pageUrl={pageUrl}
        />
      )}
    </Layout>
  );
};

export default Subsection;