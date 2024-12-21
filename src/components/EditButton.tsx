import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdoc from '@markdoc/markdoc';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React from 'react';

interface EditButtonProps {
  content: string;
  onSave: (newContent: string) => Promise<void>;
}

const ADMIN_EMAILS = [
  'sernanic100@gmail.com',
  // Add other admin emails here
];

export const EditButton = ({ content, onSave }: EditButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Check if user has edit permissions
  const hasEditPermission = user && ADMIN_EMAILS.includes(user.email || '');

  if (!user || !hasEditPermission) return null;

  const validateMarkdown = (content: string): string[] => {
    const errors: string[] = [];
    
    // Basic validation
    if (content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }

    // Markdoc validation
    try {
      const ast = Markdoc.parse(content);
      const errors = Markdoc.validate(ast);
      
      errors.forEach(error => {
        errors.push(`Line ${error.lines[0]}: ${error.error}`);
      });
    } catch (error) {
      errors.push('Invalid markdown syntax');
    }

    return errors;
  };

  const handleContentChange = (newContent: string) => {
    setEditableContent(newContent);
    setValidationErrors(validateMarkdown(newContent));
  };

  const handleSave = async () => {
    const errors = validateMarkdown(editableContent);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the markdown errors before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editableContent);
      setIsOpen(false);
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    try {
      const ast = Markdoc.parse(editableContent);
      const content = Markdoc.transform(ast);
      return (
        <div className="prose dark:prose-invert max-w-none">
          {Markdoc.renderers.react(content, React)}
        </div>
      );
    } catch (error) {
      return <div>Error rendering preview</div>;
    }
  };

  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-6 w-6 text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page Content</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="edit" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-0">
              <div className="space-y-4">
                <Textarea
                  value={editableContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[300px] font-mono"
                  placeholder="Enter your content in Markdown format..."
                />
                
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="text-sm text-gray-500">
                  <p>Content Format:</p>
                  <ul className="list-disc pl-4">
                    <li>First line: Main section content</li>
                    <li>Following lines: Subsection content (one per line)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              {renderPreview()}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || validationErrors.length > 0}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
