import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "react-i18next";
import { renderMarkdown } from '@/utils/markdown';
import { useAuthStore } from '@/store/useAuthStore';
import { isAdminEmail } from '@/config/constants';
import { useDocumentStructure } from '@/hooks/useDocumentStructure';
import { Skeleton } from "../../ui/skeleton";

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
}

const Sidebar = ({ isMobileOpen, toggleMobileSidebar }: SidebarProps) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const hasAdminPermission = isAdminEmail(user?.email);

  const { sidebarItems, isLoading, error } = useDocumentStructure();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading structure</div>;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
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
        className={`h-[calc(100vh-64px)] bg-white border-r border-border transition-all duration-200 ease-in-out fixed lg:sticky top-16 z-40
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
          lg:translate-x-0 
          ${isDesktopOpen ? "lg:w-64" : "lg:w-16"}
        `}
      >
        {/* Full sidebar content */}
        <div className={`h-full flex flex-col ${!isDesktopOpen ? "lg:hidden" : ""}`}>
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              <nav className="space-y-4">
                {sidebarItems.map((section) => (
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
                        {section.items?.map((subsection) => (
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
          {/* Fixed bottom area */}
          <div className="shrink-0 p-4 border-t border-border flex items-center justify-between">
            <LanguageSelector />
            {hasAdminPermission && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2 mt-2 text-sm text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
              >
                <span>Admin Portal</span>
              </Link>
            )}
          </div>
        </div>

        {/* Collapsed sidebar content */}
        <div className={`h-full flex flex-col ${isDesktopOpen ? "lg:hidden" : "hidden lg:flex"}`}>
          <div className="flex-1 min-h-0">
            <div className="p-4">
              <button
                onClick={toggleDesktopSidebar}
                className="p-2 rounded-md hover:bg-gray-50 mx-auto block"
              >
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          {/* Fixed bottom area for collapsed state */}
          <div className="shrink-0 p-4 border-t border-border">
            <LanguageSelector collapsed />
            {hasAdminPermission && (
              <Link 
                to="/admin" 
                className="flex items-center justify-center px-2 py-2 mt-2 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main content margin adjustment */}
      <style data-jsx="true" data-global="true">{`
        @media (min-width: 1024px) {
          main {
            margin-left: ${isDesktopOpen ? '0rem' : '4rem'};
            transition: margin-left 200ms ease-in-out;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;