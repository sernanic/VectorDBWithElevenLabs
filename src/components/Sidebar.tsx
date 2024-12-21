import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDocumentationSections } from "@/data/docs";
import { ChevronDown, ChevronRight, Menu, ChevronLeft } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { renderMarkdown } from '@/utils/markdown';

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { i18n } = useTranslation();
  const [sections, setSections] = useState(getDocumentationSections());

  // Update sections when language changes
  useEffect(() => {
    setSections(getDocumentationSections());
  }, [i18n.language]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>

      <aside
        className={`h-screen bg-white border-r border-border transition-all duration-200 ease-in-out fixed lg:sticky top-0 z-40
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          lg:translate-x-0 
          ${isDesktopOpen ? "lg:w-64" : "lg:w-16"}
        `}
      >
        {/* Full sidebar content */}
        <div className={`h-full flex flex-col ${!isDesktopOpen ? "lg:hidden" : ""}`}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-primary">Mobiwork Docs</h1>
                <button
                  onClick={toggleDesktopSidebar}
                  className="hidden lg:flex p-2 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft size={20} className="text-gray-500" />
                </button>
              </div>
              <nav className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex-1 text-sm font-semibold">
                        {renderMarkdown(section.title)}
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
                            <span className="text-sm">
                              {renderMarkdown(subsection.title)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
          <div className={!isDesktopOpen ? "hidden lg:block" : ""}>
            <LanguageSelector />
          </div>
        </div>

        {/* Collapsed sidebar content */}
        <div className={`h-full flex flex-col ${isDesktopOpen ? "lg:hidden" : "hidden lg:flex"}`}>
          <div className="p-6">
            <div className="flex justify-center mb-8">
              <button
                onClick={toggleDesktopSidebar}
                className="p-2 rounded-md hover:bg-gray-50"
              >
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="mt-auto">
            <LanguageSelector collapsed />
          </div>
        </div>
      </aside>

      {/* Main content margin adjustment */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          main {
            margin-left: ${isDesktopOpen ? '6rem' : '4rem'};
            transition: margin-left 200ms ease-in-out;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;