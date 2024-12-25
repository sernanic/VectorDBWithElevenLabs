export interface PageContent {
  pageMD: string;
  tableOfContentMD?: string;
}

export interface DocSubsection {
  id: string;
  title: string;
  content: string;
}

export interface SubsectionContentProps {
  subsection: DocSubsection;
  customContent?: string | null;
  isLoading: boolean;
  pageUrl: string;
}