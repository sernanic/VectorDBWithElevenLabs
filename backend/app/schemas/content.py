from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class TableOfContentHeader(BaseModel):
    id: str
    title: str
    level: int
    children: List[str]

class TableOfContentData(BaseModel):
    headers: List[TableOfContentHeader]
    structure: Dict[str, TableOfContentHeader]

class PageContentBase(BaseModel):
    pageContent: str = Field(..., description="The main content of the page")
    pageURL: str = Field(..., description="The URL of the page")
    tableOfContent: Optional[TableOfContentData] = Field(None, description="Table of contents data")

class PageContentCreate(PageContentBase):
    pass

class PageContentResponse(BaseModel):
    pageContent: str
    tableOfContent: Optional[TableOfContentData] = None

class PageContentInDB(PageContentBase):
    id: str = Field(..., alias="_id")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {"examples": []}
    }

class Subsubsection(BaseModel):
    title: str
    content: str

class Subsection(BaseModel):
    title: str
    content: str
    subsubsections: Optional[Dict[str, Subsubsection]] = {}

class Section(BaseModel):
    title: str
    subsections: Dict[str, Subsection] = {}

class DocumentStructure(BaseModel):
    _id: str = "document_structure"
    sections: Dict[str, Section] = {}

    model_config = {
        "json_schema_extra": {
            "example": {
                "_id": "document_structure",
                "sections": {
                    "getting-started": {
                        "title": "# Getting Started",
                        "subsections": {
                            "introduction": {
                                "title": "## Introduction",
                                "content": "Welcome to the documentation"
                            }
                        }
                    }
                }
            }
        }
    }

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
