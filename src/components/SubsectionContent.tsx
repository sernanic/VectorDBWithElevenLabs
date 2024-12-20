import React from "react";
import { DocSubsection } from "@/data/docs";
import TableOfContents from "./TableOfContents";

interface SubsectionContentProps {
  subsection: DocSubsection;
}

const SubsectionContent = ({ subsection }: SubsectionContentProps) => {
  return (
    <div className="flex">
      <div className="flex-1 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">{subsection.title}</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-8">{subsection.content}</p>
          
          {subsection.subsubsections?.map((subsubsection) => (
            <section
              key={subsubsection.id}
              id={subsubsection.id}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {subsubsection.title}
              </h2>
              <p className="text-gray-600">{subsubsection.content}</p>
            </section>
          ))}
        </div>
      </div>
      {subsection.subsubsections && (
        <TableOfContents subsubsections={subsection.subsubsections} />
      )}
    </div>
  );
};

export default SubsectionContent;