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
