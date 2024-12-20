import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    <nav className="hidden lg:block sticky top-6 self-start ml-auto w-64 pl-8">
      <div className="relative">
        <h4 className="text-sm font-semibold mb-4 text-gray-900">On this page</h4>
        <ul className="space-y-3 text-sm relative">
          {subsubsections.map((section) => (
            <li key={section.id} className="relative">
              {activeSection === section.id && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -left-2 top-0 w-0.5 h-full bg-primary"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
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
      </div>
    </nav>
  );
};

export default TableOfContents;