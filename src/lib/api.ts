const API_BASE_URL = 'http://localhost:8000/api';

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

export interface PageContent {
  pageContent: string;
  pageURL: string;
  tableOfContent: TableOfContentData;
}

export interface PageContentResponse {
  pageContent: string;
  tableOfContent: TableOfContentData | null;
}

export async function getPageContent(language: string, sectionId: string, subsectionId: string): Promise<PageContentResponse> {
  const response = await fetch(`${API_BASE_URL}/content/${language}/${sectionId}-${subsectionId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return { pageContent: '', tableOfContent: null };
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function savePageContent(
  language: string,
  sectionId: string,
  subsectionId: string,
  content: PageContent
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/content/${language}/${sectionId}-${subsectionId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
}
