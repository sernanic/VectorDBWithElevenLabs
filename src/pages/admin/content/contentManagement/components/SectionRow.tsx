// src/pages/admin/content/contentManagement/components/SectionRow.tsx
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronRight, ChevronDown, Eye } from "lucide-react";

interface SubSubSection {
  title: string;
  content: string;
}

interface SubSection {
  title: string;
  subsubsections?: Record<string, SubSubSection>;
}

interface Section {
  title: string;
  subsections?: Record<string, SubSection>;
}

interface SectionRowProps {
  sectionId: string;
  section: Section;
  expanded: boolean;
  toggleSection: (sectionId: string) => void;
  navigate: (path: string) => void;
}

const SectionRow: React.FC<SectionRowProps> = ({ sectionId, section, expanded, toggleSection, navigate }) => {
  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => toggleSection(sectionId)}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell>{section.title.replace("#", "").trim()}</TableCell>
        <TableCell>{Object.keys(section.subsections || {}).length}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/admin/content/section/${sectionId}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {expanded && section.subsections && (
        <>
          {Object.entries(section.subsections).map(([subsectionId, subsection]) => (
            <TableRow key={`${sectionId}-${subsectionId}`} className="bg-muted/50">
              <TableCell></TableCell>
              <TableCell className="pl-8">{subsection.title.replace("##", "").trim()}</TableCell>
              <TableCell>{subsection.subsubsections ? Object.keys(subsection.subsubsections).length : 0}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </>
      )}
    </>
  );
};

export default SectionRow;