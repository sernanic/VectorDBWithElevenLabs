import React, { useState } from "react";
import { Link } from "react-router-dom";
import { documentationSections } from "@/data/docs";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 z-40 w-64 bg-white border-r border-border transition-transform duration-200 ease-in-out overflow-y-auto`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-8">Mobiwork Docs</h1>
          <nav>
            {documentationSections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {section.title}
                  </span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <Link
                        key={subsection.id}
                        to={`/${section.id}/${subsection.id}`}
                        className="block px-2 py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                      >
                        {subsection.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;