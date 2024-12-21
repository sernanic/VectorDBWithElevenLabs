import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import * as Markdoc from "@markdoc/markdoc";

interface TableOfContentsProps {
  content: string;
}

interface Section {
  id: string;
  title: string;
  level: number;
}

const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Parse the markdown content to find headers
    const ast = Markdoc.parse(content);
    const headers: Section[] = [];
    
    // Walk through the AST to find all headers
    const walk = (node: any) => {
      if (node.type === 'heading') {
        const title = node.children?.[0]?.content || '';
        const level = node.attributes?.level || 1;
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headers.push({ id, title, level });
      }
      node.children?.forEach(walk);
    };
    
    walk(ast);
    setSections(headers);
  }, [content]);

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

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block sticky top-6 self-start ml-auto w-64 pl-8">
      <div className="relative">
        <h4 className="text-sm font-semibold mb-4 text-gray-900">{t("on_this_page")}</h4>
        <ul className="space-y-3 text-sm">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li 
                key={section.id} 
                className="relative pl-4"
                style={{ marginLeft: `${(section.level - 2) * 12}px` }}
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