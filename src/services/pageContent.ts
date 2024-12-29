import { environment } from '@/config/environment';

interface PageContentResponse {
  pageContent: string;
  tableOfContent: any;
}

interface Subsubsection {
  title: string;
  content: string;
}

interface Subsection {
  title: string;
  content: string;
  subsubsections?: Record<string, Subsubsection>;
}

interface Section {
  title: string;
  subsections: Record<string, Subsection>;
}

interface DocumentStructure {
  _id: string;
  sections: Record<string, Section>;
}

interface AddSectionRequest {
  section_id: string;
  title: string;
}

interface AddSubsectionRequest {
  section_id: string;
  subsection_id: string;
  title: string;
  content: string;
}

export async function getPageContent(contentId: string, language: string) {
  try {
    const response = await fetch(`/api/content/${language}/${contentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching page content:', error);
    throw error;
  }
}

export async function savePageContent(contentId: string, language: string, content: string) {
  try {
    const payload = {
      pageContent: content,
      pageURL: contentId,
      tableOfContent: {}
    };

    const response = await fetch(`/api/content/${language}/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving page content:', error);
    throw error;
  }
}

export async function getDocumentStructure(language: string): Promise<DocumentStructure> {
  if (!language) {
    throw new Error('Language parameter is required');
  }

  try {
    console.log('Fetching document structure from:', `${environment.apiBaseUrl}/api/v1/content/structure/${language}`);
    
    const response = await fetch(`${environment.apiBaseUrl}/api/v1/content/structure/${language}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received document structure:', data);
    return data;
  } catch (error) {
    console.error('Error fetching document structure:', error);
    throw error;
  }
}

export async function addSection(language: string, sectionData: AddSectionRequest): Promise<DocumentStructure> {
  if (!language || !sectionData.section_id || !sectionData.title) {
    throw new Error('Missing required parameters');
  }

  try {
    const payload = {
      section_id: sectionData.section_id,
      title: sectionData.title
    };

    const response = await fetch(`${environment.apiBaseUrl}/api/v1/content/structure/${language}/section`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding section:', error);
    throw error;
  }
}

export async function addSubsection(language: string, subsectionData: AddSubsectionRequest): Promise<DocumentStructure> {
  if (!language || !subsectionData.section_id || !subsectionData.subsection_id || !subsectionData.title) {
    throw new Error('Missing required parameters');
  }

  try {
    const response = await fetch(`${environment.apiBaseUrl}/api/v1/content/structure/${language}/subsection`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subsectionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding subsection:', error);
    throw error;
  }
}
