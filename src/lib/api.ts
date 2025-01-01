import { useQuery } from 'react-query';

const API_BASE_URL = 'http://localhost:8001/api';

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

export interface DocumentStructure {
  sections: Record<string, {
    title: string;
    subsections: Record<string, {
      title: string;
      content: string;
      subsubsections?: Record<string, any>;
    }>;
  }>;
}

export interface AddSectionRequest {
  section_id: string;
  title: string;
}

export interface AddSubsectionRequest {
  section_id: string;
  subsection_id: string;
  title: string;
  content: string;
}

export interface AddWebContentRequest {
  url: string;
  section_id: string;
  title: string;
}

export async function addSection(language: string, data: AddSectionRequest): Promise<DocumentStructure> {
  const response = await fetch(`${API_BASE_URL}/v1/content/structure/${language}/section`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to add section: ${response.statusText}`);
  }

  return await response.json();
}

export async function addSubsection(language: string, data: AddSubsectionRequest): Promise<DocumentStructure> {
  const response = await fetch(`${API_BASE_URL}/v1/content/structure/${language}/subsection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to add subsection: ${response.statusText}`);
  }

  return await response.json();
}

export async function addWebContent(data: AddWebContentRequest): Promise<DocumentStructure> {
  const response = await fetch(`${API_BASE_URL}/v1/webContent/add`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: data.url,
      section_id: data.section_id,
      title: data.title
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to import web content');
  }

  return (await response.json()).structure;
}

export interface PageContentResponse {
  pageContent: string;
  tableOfContent: TableOfContentData | null;
}

export async function getPageContent(language: string, sectionId: string, subsectionId: string): Promise<PageContentResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/content/${language}/${sectionId}/${subsectionId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return { pageContent: '', tableOfContent: null };
    }
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    pageContent: data.pageContent || '',
    tableOfContent: data.tableOfContent || null
  };
}

export async function savePageContent(
  language: string,
  sectionId: string,
  subsectionId: string,
  content: PageContent
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/v1/content/${language}/${sectionId}/${subsectionId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API request failed: ${response.statusText}`);
  }
}

export async function getDocumentStructure(language: string): Promise<DocumentStructure> {
  const response = await fetch(`${API_BASE_URL}/content/structure/${language}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch document structure: ${response.statusText}`);
  }
  
  return await response.json();
}
