import { Button } from "@/components/ui/button";
import { Globe, Plus } from "lucide-react";
import { useSectionDetails } from "./hooks/useSectionDetails";
import AddSubsectionDialog from "./components/AddSubsectionDialog";
import AddWebContentDialog from "./components/AddWebContentDialog";
import SubsectionsTable from "./components/SubsectionsTable";

export function SectionDetails() {
  const {
    sectionId,
    section,
    sectionName,
    subsections,
    subsectionsCount,
    isLoading,
    error,
    isAddSubsectionOpen,
    setIsAddSubsectionOpen,
    isAddWebContentOpen,
    setIsAddWebContentOpen,
    addSubsectionMutation,
    addWebContentMutation,
  } = useSectionDetails();

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddWebContentOpen(true)}>
            <Globe className="mr-2 h-4 w-4" />
            Add Content from Web
          </Button>
          <Button onClick={() => setIsAddSubsectionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subsection
          </Button>
        </div>
      </div>

      <AddWebContentDialog
        isOpen={isAddWebContentOpen}
        onClose={() => setIsAddWebContentOpen(false)}
        sectionId={sectionId as string}
        addWebContentMutation={addWebContentMutation}
      />

      <AddSubsectionDialog
        isOpen={isAddSubsectionOpen}
        onClose={() => setIsAddSubsectionOpen(false)}
        addSubsectionMutation={addSubsectionMutation}
      />

      <SubsectionsTable
        subsections={subsections}
        subsectionsCount={subsectionsCount}
      />
    </div>
  );
}

export default SectionDetails; 