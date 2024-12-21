import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Markdoc from '@markdoc/markdoc';

interface PageContent {
  pageUrl: string;
  pageMD: string;
  tableOfContentMD: string;
}

// Helper function to encode the URL for Firestore
const encodeUrlForFirestore = (url: string): string => {
  return url.replace(/^\//, '').replace(/\//g, '_');
};

// Helper function to decode the Firestore ID back to URL
const decodeFirestoreId = (id: string): string => {
  return '/' + id.replace(/_/g, '/');
};

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
const extractHeaders = (markdown: string): string => {
  const lines = markdown.split('\n');
  const headers = lines
    .filter(line => line.trim().startsWith('#'))
    .map(line => {
      // Preserve the original header level and text
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        const [, hashes, text] = match;
        // Create an ID from the header text
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        return `${hashes} [${text}](#${id})`;
      }
      return line;
    })
    .join('\n');

  return headers;
};

export const getPageContent = async (pageUrl: string): Promise<PageContent | null> => {
  try {
    console.log('Getting page content for:', pageUrl);
    const encodedUrl = encodeUrlForFirestore(pageUrl);
    console.log('Encoded URL:', encodedUrl);
    
    const docRef = doc(db, 'pageContents', encodedUrl);
    const docSnap = await getDoc(docRef);
    console.log('Document exists:', docSnap.exists());
    
    if (docSnap.exists()) {
      const data = docSnap.data() as PageContent;
      console.log('Retrieved data:', data);
      return {
        pageUrl: decodeFirestoreId(encodedUrl),
        pageMD: data.pageMD,
        tableOfContentMD: data.tableOfContentMD,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
};

export const savePageContent = async (pageUrl: string, markdown: string): Promise<void> => {
  try {
    console.log('Saving page content for:', pageUrl);
    const encodedUrl = encodeUrlForFirestore(pageUrl);
    console.log('Encoded URL:', encodedUrl);
    
    // Format content with proper headers if they don't exist
    const formattedContent = markdown.startsWith('#') ? markdown : formatContentWithHeaders(markdown);
    console.log('Formatted content:', formattedContent);
    
    // Extract headers for table of contents
    const tableOfContentMD = extractHeaders(formattedContent);
    console.log('Generated table of contents:', tableOfContentMD);

    const docRef = doc(db, 'pageContents', encodedUrl);
    const content: PageContent = {
      pageUrl: decodeFirestoreId(encodedUrl),
      pageMD: formattedContent,
      tableOfContentMD,
    };
    console.log('Saving content:', content);
    
    await setDoc(docRef, content);
    console.log('Content saved successfully');
  } catch (error) {
    console.error('Error saving page content:', error);
    throw error;
  }
};
