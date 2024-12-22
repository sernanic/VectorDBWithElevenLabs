import Markdoc from '@markdoc/markdoc';

const API_BASE_URL = 'http://localhost:8002/api/v1';

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
  pageUrl: string;
  pageMD: string;
  tableOfContentMD: string;
}

// Helper function to format content with proper headers
const formatContentWithHeaders = (content: string): string => {
  const sections = content.split('\n\n').filter(section => section.trim());
  return sections.map((section, index) => {
    if (index === 0) {
      return `# ${section}`; // First section is title (h1)
    }
    return `## ${section}`; // Other sections are h2
  }).join('\n\n');
};

// Helper function to extract headers from markdown content
const extractHeaders = (markdown: string): TableOfContentData => {
  const lines = markdown.split('\n');
  const headers: TableOfContentHeader[] = [];
  const structure: { [key: string]: TableOfContentHeader } = {};

  lines.filter(line => line.trim().startsWith('#')).forEach(line => {
    const match = line.match(/^(#+)\s+(.+)$/);
    if (match) {
      const [, hashes, text] = match;
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const header: TableOfContentHeader = {
        id,
        title: text,
        level: hashes.length,
        children: []
      };
      
      headers.push(header);
      structure[id] = header;
    }
  });

  return { headers, structure };
};

export const getPageContent = async (pageUrl: string, language: string): Promise<PageContent | null> => {
  try {
    if (!pageUrl || !language) {
      console.warn('Missing required parameters:', { pageUrl, language });
      return null;
    }

    // Remove leading and trailing slashes and split
    const parts = pageUrl.split('/').filter(Boolean);
    if (parts.length !== 2) {
      console.warn('Invalid pageUrl format:', pageUrl);
      return null;
    }

    const [sectionId, subsectionId] = parts;
    console.log('Fetching content:', { sectionId, subsectionId, language });

    const response = await fetch(
      `${API_BASE_URL}/content/${language}/${sectionId}-${subsectionId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const tableOfContent = data.tableOfContent ? data.tableOfContent : extractHeaders(data.pageContent);

    return {
      pageUrl,
      pageMD: data.pageContent,
      tableOfContentMD: JSON.stringify(tableOfContent)
    };
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

export const savePageContent = async (pageUrl: string, markdown: string, language: string): Promise<void> => {
  try {
    if (!pageUrl || !language) {
      throw new Error('Missing required parameters');
    }

    // Remove leading and trailing slashes and split
    const parts = pageUrl.split('/').filter(Boolean);
    if (parts.length !== 2) {
      throw new Error('Invalid pageUrl format');
    }

    const [sectionId, subsectionId] = parts;
    console.log('Saving content:', { sectionId, subsectionId, language });
    
    // Format content with proper headers if they don't exist
    const formattedContent = markdown.startsWith('#') ? markdown : formatContentWithHeaders(markdown);
    
    // Extract headers for table of contents
    const tableOfContent = extractHeaders(formattedContent);

    const response = await fetch(
      `${API_BASE_URL}/content/${language}/${sectionId}-${subsectionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageContent: formattedContent,
          pageURL: pageUrl,
          tableOfContent
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    console.log('Successfully saved page content');
  } catch (error) {
    console.error('Error saving page content:', error);
    throw error;
  }
};
