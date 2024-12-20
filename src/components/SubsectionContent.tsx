import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { useTranslation } from "react-i18next";
import TableOfContents from "./TableOfContents";

const SubsectionContent = () => {
  const { sectionId, subsectionId } = useParams();
  const { i18n } = useTranslation();
  const [sections, setSections] = useState(getDocumentationSections());

  // Force re-render when language changes
  useEffect(() => {
    console.log('Language changed in SubsectionContent:', i18n.language);
    setSections(getDocumentationSections());
  }, [i18n.language]);

  const section = sections.find((s) => s.id === sectionId);
  const subsection = section?.subsections.find((s) => s.id === subsectionId);

  if (!section || !subsection) {
    return <div className="p-8">Section not found</div>;
  }

  return (
    <div className="flex justify-between gap-8">
      <div className="flex-1 max-w-3xl">
        <div className="prose prose-slate max-w-none">
          <h1>{subsection.title}</h1>
          <p className="text-lg text-gray-600 mt-4">{subsection.content}</p>

          {subsection.subsubsections && subsection.subsubsections.length > 0 && (
            <div className="mt-8 space-y-8">
              {subsection.subsubsections.map((subsubsection) => (
                <section 
                  key={subsubsection.id} 
                  id={subsubsection.id}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {subsubsection.title}
                  </h2>
                  <p className="text-gray-600">{subsubsection.content}</p>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
      {subsection.subsubsections && (
        <div className="hidden lg:block w-64">
          <TableOfContents subsection={subsection} />
        </div>
      )}
    </div>
  );
};

export default SubsectionContent;