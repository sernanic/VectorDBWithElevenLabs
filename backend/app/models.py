from pydantic import BaseModel
from typing import Optional, Dict, List

class TableOfContentHeader(BaseModel):
    id: str
    title: str
    level: int
    children: List[str]

class TableOfContentData(BaseModel):
    headers: List[TableOfContentHeader]
    structure: Dict[str, TableOfContentHeader]

class PageContent(BaseModel):
    pageContent: str
    pageURL: str
    tableOfContent: TableOfContentData

class PageContentResponse(BaseModel):
    pageContent: str
    tableOfContent: Optional[TableOfContentData] = None

# New models for sections and subsections
class SubSubSection(BaseModel):
    title: str
    content: str

class SubSection(BaseModel):
    title: str
    content: str
    subsubsections: Optional[Dict[str, SubSubSection]] = None

class Section(BaseModel):
    title: str
    subsections: Dict[str, SubSection]

class DocumentStructure(BaseModel):
    sections: Dict[str, Section]

# Request models for adding sections and subsections
class AddSectionRequest(BaseModel):
    section_id: str
    title: str

class AddSubsectionRequest(BaseModel):
    section_id: str
    subsection_id: str
    title: str
    content: str

class AddSubSubsectionRequest(BaseModel):
    section_id: str
    subsection_id: str
    subsubsection_id: str
    title: str
    content: str
