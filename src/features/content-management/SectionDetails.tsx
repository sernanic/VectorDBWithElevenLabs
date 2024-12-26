import { Button } from "@/components/ui/button";
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
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSubsection, getDocumentStructure } from "@/services/pageContent";
import { useToast } from "@/components/ui/use-toast";

interface Subsection {
  title: string;
  content: string;
  subsubsections?: Record<string, any>;
}

interface Section {
  title: string;
  subsections: Record<string, Subsection>;
}

interface DocumentStructure {
  sections: Record<string, Section>;
}

interface AddSubsectionForm {
  title: string;
  content: string;
}

export function SectionDetails() {
  const { sectionId } = useParams();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const { toast } = useToast();
  const [isAddSubsectionOpen, setIsAddSubsectionOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddSubsectionForm>();

  // Fetch document structure
  const { data: documentStructure, isLoading, error } = useQuery<DocumentStructure>({
    queryKey: ['documentStructure'],
    queryFn: () => getDocumentStructure('en'),
  });

  const section = documentStructure?.sections[sectionId as string];
  const sectionName = section?.title.replace("#", "").trim() || "Section";
  const subsections = section?.subsections || {};
  const subsectionsCount = Object.keys(subsections).length;

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Content Management",
        path: "/admin/content"
      },
      {
        label: sectionName,
        path: `/admin/content/section/${sectionId}`
      }
    ]);
  }, [setBreadcrumbs, sectionId, sectionName]);

  const addSubsectionMutation = useMutation({
    mutationFn: async (data: AddSubsectionForm) => {
      const subsectionId = data.title.toLowerCase().replace(/\s+/g, '-');
      return addSubsection('en', {
        section_id: sectionId as string,
        subsection_id: subsectionId,
        title: `## ${data.title}`,
        content: data.content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentStructure'] });
      setIsAddSubsectionOpen(false);
      reset();
      toast({
        title: "Success",
        description: "Subsection added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add subsection. Please try again.",
      });
    }
  });

  const onSubmit = (data: AddSubsectionForm) => {
    addSubsectionMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading section details</div>;
  }

  if (!section) {
    return <div className="p-8 text-red-500">Section not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{sectionName}</h1>
        <p className="text-muted-foreground">
          Total Subsections: {subsectionsCount}
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Subsections</h2>
        <Dialog open={isAddSubsectionOpen} onOpenChange={setIsAddSubsectionOpen}>
          <DialogTrigger asChild>
            <Button>Add Subsection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subsection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Subsection Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter subsection title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "Content is required" })}
                  placeholder="Enter subsection content"
                  rows={5}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSubsectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addSubsectionMutation.isPending}
                >
                  {addSubsectionMutation.isPending ? "Adding..." : "Add Subsection"}
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
              <TableHead>Name</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(subsections).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No subsections found. Click "Add Subsection" to create one.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(subsections).map(([subsectionId, subsection]) => (
                <TableRow key={subsectionId}>
                  <TableCell>{subsection.title.replace("##", "").trim()}</TableCell>
                  <TableCell className="max-w-md truncate">{subsection.content}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="h-4 w-4" />
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SectionDetails; 