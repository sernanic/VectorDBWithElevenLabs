import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subsection {
  title: string;
  content: string;
  subsubsections?: Record<string, any>;
}

interface SubsectionsTableProps {
  subsections: Record<string, Subsection>;
  subsectionsCount: number;
}

export function SubsectionsTable({
  subsections,
  subsectionsCount,
}: SubsectionsTableProps) {
  if (subsectionsCount === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No subsections found. Add one to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Content Preview</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(subsections).map(([id, subsection]) => (
          <TableRow key={id}>
            <TableCell className="font-medium">
              {subsection.title.replace("##", "").trim()}
            </TableCell>
            <TableCell className="max-w-md truncate">
              {subsection.content}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default SubsectionsTable; 