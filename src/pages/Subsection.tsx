import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SubsectionContent from "@/components/SubsectionContent";
import { documentationSections } from "@/data/docs";

const Subsection = () => {
  const { sectionId, subsectionId } = useParams();
  
  const section = documentationSections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);

  if (!subsection) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">
            Subsection not found
          </h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SubsectionContent subsection={subsection} />
    </Layout>
  );
};

export default Subsection;