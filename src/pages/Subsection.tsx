import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SubsectionContent from "@/components/SubsectionContent";
import { documentationSections } from "@/data/docs";
import { getPageContent } from "@/services/pageContent";
import { useToast } from "@/components/ui/use-toast";

const Subsection = () => {
  const { sectionId, subsectionId } = useParams();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const section = documentationSections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);
  const pageUrl = sectionId && subsectionId ? `/${sectionId}/${subsectionId}` : '';

  useEffect(() => {
    const fetchContent = async () => {
      if (!pageUrl) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching content for URL:', pageUrl);
        const pageContent = await getPageContent(pageUrl);
        console.log('Fetched content:', pageContent);
        
        if (pageContent) {
          console.log('Setting custom content from Firestore');
          setContent(pageContent.pageMD);
        } else {
          console.log('No custom content found, using default');
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
      <SubsectionContent 
        subsection={subsection} 
        customContent={content}
        isLoading={isLoading}
        pageUrl={pageUrl}
      />
    </Layout>
  );
};

export default Subsection;