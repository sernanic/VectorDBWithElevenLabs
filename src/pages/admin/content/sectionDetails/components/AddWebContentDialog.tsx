import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { UseMutationResult } from "@tanstack/react-query";

interface AddWebContentForm {
  url: string;
  title: string;
}

interface AddWebContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  addWebContentMutation: UseMutationResult<any, any, AddWebContentForm & { sectionId: string }>;
}

export function AddWebContentDialog({
  isOpen,
  onClose,
  sectionId,
  addWebContentMutation,
}: AddWebContentDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddWebContentForm>();

  const onSubmit = (data: AddWebContentForm) => {
    addWebContentMutation.mutate({ ...data, sectionId });
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Web Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { 
                required: "Title is required"
              })}
              placeholder="Enter a title for this content"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              {...register("url", { 
                required: "URL is required",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Please enter a valid URL starting with http:// or https://"
                }
              })}
              placeholder="https://example.com/docs"
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addWebContentMutation.isPending}
            >
              {addWebContentMutation.isPending ? "Importing..." : "Import Content"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddWebContentDialog; 