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
