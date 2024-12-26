import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageContent } from '@/services/pageContent';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import { Loader2 } from 'lucide-react';

export function SubsectionContent() {
  const { sectionId, subsectionId } = useParams();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Documentation",
        path: "/"
      },
      {
        label: sectionId || "",
        path: `/${sectionId}`
      },
      {
        label: subsectionId || "",
        path: `/${sectionId}/${subsectionId}`
      }
    ]);
  }, [setBreadcrumbs, sectionId, subsectionId]);

  const fetchContent = async () => {
    try {
      if (!sectionId || !subsectionId) {
        throw new Error('Missing section or subsection ID');
      }

      setIsLoading(true);
      setError(null);
      const data = await getPageContent('en', sectionId, subsectionId);
      setContent(data.pageContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [sectionId, subsectionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
} 