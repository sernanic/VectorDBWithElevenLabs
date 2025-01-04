import { useContentManagement } from "./hooks/useContentManagement";
import AddSectionDialog from "./components/AddSectionDialog";
import SectionTable from "./components/SectionTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ContentManagement() {
  const {
    navigate,
    setBreadcrumbs,
    expandedSections,
    toggleSection,
    addSectionMutation,
    onSubmit,
    contentData,
    isLoading,
    error,
    hasSections,
    isAddSectionOpen,
    setIsAddSectionOpen,
  } = useContentManagement();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading content structure</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Button onClick={() => setIsAddSectionOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <AddSectionDialog 
        isOpen={isAddSectionOpen} 
        onClose={() => setIsAddSectionOpen(false)} 
        onSubmit={onSubmit} 
        addSectionMutation={addSectionMutation} 
      />
      <div className="bg-white p-6 rounded-lg shadow">
        <SectionTable 
          sections={contentData?.sections || {}} 
          expandedSections={expandedSections} 
          toggleSection={toggleSection} 
          navigate={navigate} 
          hasSections={hasSections} 
        />
      </div>
    </div>
  );
}

export default ContentManagement; 