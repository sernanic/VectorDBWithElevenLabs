import React, { useEffect, useState } from "react";
import { DocSubsubsection } from "@/data/docs";

interface TableOfContentsProps {
  subsubsections: DocSubsubsection[];
}

const TableOfContents = ({ subsubsections }: TableOfContentsProps) => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    subsubsections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [subsubsections]);

  return (
    <nav className="hidden lg:block sticky top-6 w-64 ml-8">
      <h4 className="text-sm font-semibold mb-4 text-gray-900">On this page</h4>
      <ul className="space-y-3 text-sm">
        {subsubsections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`block text-sm hover:text-primary transition-colors ${
                activeSection === section.id
                  ? "text-primary font-medium"
                  : "text-gray-600"
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;