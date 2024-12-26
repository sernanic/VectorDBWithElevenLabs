import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSection, getDocumentStructure } from "@/services/pageContent";
import { useToast } from "@/components/ui/use-toast";

// Types based on backend schema
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
  sections: Record<string, Section>;
}

interface AddSectionForm {
  title: string;
}

export function ContentManagement() {
  const navigate = useNavigate();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddSectionForm>();
  const { toast } = useToast();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Content Management",
        path: "/admin/content"
      }
    ]);
  }, [setBreadcrumbs]);

  // Fetch document structure
  const { data: contentData, isLoading, error } = useQuery<DocumentStructure>({
    queryKey: ['documentStructure'],
    queryFn: async () => {
      const data = await getDocumentStructure('en');
      console.log('Fetched document structure:', data);
      return data;
    }
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const addSectionMutation = useMutation({
    mutationFn: async (data: AddSectionForm) => {
      const sectionId = data.title.toLowerCase().replace(/\s+/g, '-');
      return addSection('en', {
        section_id: sectionId,
        title: `# ${data.title}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentStructure'] });
      setIsAddSectionOpen(false);
      reset();
      toast({
        title: "Success",
        description: "Section added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add section. Please try again.",
      });
    }
  });

  const onSubmit = (data: AddSectionForm) => {
    addSectionMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading content structure</div>;
  }

  const sections = contentData?.sections || {};
  const hasSections = Object.keys(sections).length > 0;
  
  console.log('Current sections:', sections);
  console.log('Has sections:', hasSections);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
          <DialogTrigger asChild>
            <Button>Add Section</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter section title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addSectionMutation.isPending}
                >
                  {addSectionMutation.isPending ? "Adding..." : "Add Section"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                <React.Fragment key={sectionId}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleSection(sectionId)}
                      >
                        {expandedSections[sectionId] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{section.title.replace("#", "").trim()}</TableCell>
                    <TableCell>
                      {Object.keys(section.subsections || {}).length}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/content/section/${sectionId}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedSections[sectionId] && section.subsections && (
                    <>
                      {Object.entries(section.subsections).map(([subsectionId, subsection]) => (
                        <TableRow key={`${sectionId}-${subsectionId}`} className="bg-muted/50">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">
                            {subsection.title.replace("##", "").trim()}
                          </TableCell>
                          <TableCell>
                            {subsection.subsubsections ? Object.keys(subsection.subsubsections).length : 0}
                          </TableCell>
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
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ContentManagement; 