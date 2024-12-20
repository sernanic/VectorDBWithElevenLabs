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
        <ul className="space-y-3 text-sm">
          {subsubsections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id} className="relative pl-4">
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 w-1 h-full bg-primary rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <a
                  href={`#${section.id}`}
                  className={`block hover:text-primary transition-colors ${
                    isActive ? "text-primary font-medium" : "text-gray-600"
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