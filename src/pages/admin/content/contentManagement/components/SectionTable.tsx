// src/pages/admin/content/contentManagement/components/SectionTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SectionRow from "./SectionRow";

interface SectionTableProps {
  sections: Record<string, any>; // Adjust type as necessary
  expandedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
  navigate: (path: string) => void;
  hasSections: boolean;
}

const SectionTable: React.FC<SectionTableProps> = ({ sections, expandedSections, toggleSection, navigate, hasSections }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subsections</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasSections ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No sections found. Click "Add Section" to create one.
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(sections).map(([sectionId, section]) => (
              <SectionRow 
                key={sectionId} 
                sectionId={sectionId} 
                section={section} 
                expanded={expandedSections[sectionId]} 
                toggleSection={toggleSection} 
                navigate={navigate} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SectionTable;