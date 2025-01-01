import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { UseMutationResult } from "@tanstack/react-query";

interface AddSubsectionForm {
  title: string;
  content: string;
}

interface AddSubsectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  addSubsectionMutation: UseMutationResult<any, any, AddSubsectionForm>;
}

export function AddSubsectionDialog({
  isOpen,
  onClose,
  addSubsectionMutation,
}: AddSubsectionDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddSubsectionForm>();

  const onSubmit = (data: AddSubsectionForm) => {
    addSubsectionMutation.mutate(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subsection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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
              onClick={onClose}
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
  );
}

export default AddSubsectionDialog; 