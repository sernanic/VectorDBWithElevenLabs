import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface TableOfContentHeader {
  id: string;
  title: string;
  level: number;
  children: string[]; // Array of child header IDs
}

interface TableOfContentData {
  headers: TableOfContentHeader[];
  structure: { [key: string]: TableOfContentHeader };
}

interface TableOfContentsProps {
  content: string;
  tableOfContent?: TableOfContentData;
}

interface Section {
  id: string;
  title: string;
  level: number;
}

const TableOfContents = ({ content, tableOfContent }: TableOfContentsProps) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (tableOfContent?.headers) {
      // Use the ordered headers array directly
      setSections(tableOfContent.headers.map(header => ({
        id: header.id,
        title: header.title,
        level: header.level
      })));
    }
  }, [tableOfContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-20% 0px -35% 0px'
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Adjust this value based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update the URL hash without scrolling (scrolling is handled above)
      window.history.pushState(null, '', `#${sectionId}`);
      setActiveSection(sectionId);
    }
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block sticky top-6 self-start ml-auto w-64 pl-8">
      <div className="relative">
        <ul className="space-y-3 text-sm">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li 
                key={section.id} 
                className="relative pl-4"
                style={{ marginLeft: `${(section.level - 1) * 12}px` }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute left-0 w-0.5 h-full bg-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  className={`hover:text-blue-500 ${
                    isActive ? "text-blue-500 font-medium" : "text-gray-500"
                  }`}
                >
                  {section.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;