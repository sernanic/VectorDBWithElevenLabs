import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useBreadcrumbStore } from "@/store/breadcrumbStore";

export function SubsectionDetails() {
  const { sectionId, subsectionId } = useParams();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  
  // Get section and subsection details from your content data
  const sectionDetails = contentData.sections[sectionId as string];
  const subsectionDetails = sectionDetails?.subsections[subsectionId as string];
  
  const sectionName = sectionDetails?.title.replace("#", "").trim() || "Section";
  const subsectionName = subsectionDetails?.title.replace("##", "").trim() || "Subsection";

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Content Management",
        path: "/admin/content"
      },
      {
        label: sectionName,
        path: `/admin/content/section/${sectionId}`
      },
      {
        label: subsectionName,
        path: `/admin/content/section/${sectionId}/subsection/${subsectionId}`
      }
    ]);
  }, [setBreadcrumbs, sectionId, subsectionId, sectionName, subsectionName]);

  // ... rest of the component
} 