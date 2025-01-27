import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { renderMarkdown } from '@/utils/markdown';
import { useDocumentStructure } from "@/hooks/useDocumentStructure";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResult = {
  item: {
    id: string;
    title: string;
    parentTitle?: string;
    sectionId?: string;
    subsectionId?: string;
    isSubsubsection?: boolean;
  };
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [fuse, setFuse] = useState<Fuse<any>>();

  const { data: documentStructure, isLoading } = useDocumentStructure(i18n.language);

  // Update search data when document structure changes
  useEffect(() => {
    if (!documentStructure) return;

    // Prepare search data including subsubsections
    const searchData = Object.entries(documentStructure.sections).flatMap(([sectionId, section]) => [
      {
        id: sectionId,
        title: section.title,
        sectionId
      },
      ...Object.entries(section.subsections).flatMap(([subsectionId, subsection]) => [
        {
          id: subsectionId,
          title: subsection.title,
          parentTitle: section.title,
          sectionId,
          subsectionId,
        },
        ...(subsection.subsubsections ? Object.entries(subsection.subsubsections).map(([subsubId, subsubsection]) => ({
          id: subsubId,
          title: subsubsection.title,
          parentTitle: subsection.title,
          sectionId,
          subsectionId,
          isSubsubsection: true
        })) : []),
      ]),
    ]);

    // Initialize Fuse instance with current data
    setFuse(new Fuse(searchData, {
      keys: ["title"],
      threshold: 0.3,
    }));
  }, [documentStructure]); // Re-run when document structure changes

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim() && fuse) {
      const searchResults = fuse.search(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleResultClick = (item: SearchResult['item']) => {
    setIsOpen(false);
    let path;
    if (item.subsectionId) {
      // If it's a subsection or subsubsection
      path = `/${item.sectionId}/${item.subsectionId}`;
      if (item.isSubsubsection) {
        path += `#${item.id}`;
      }
    } else {
      // If it's a main section
      path = `/${item.sectionId}`;
    }
    navigate(path);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isLoading ? "Loading..." : "Search documentation..."}
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : results.length > 0 ? (
            results.map(({ item }) => (
              <button
                key={`${item.sectionId}-${item.id}`}
                onClick={() => handleResultClick(item)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
              >
                <div className="text-sm font-medium">
                  {renderMarkdown(item.title)}
                </div>
                {item.parentTitle && (
                  <div className="text-xs text-gray-500">
                    {renderMarkdown(item.parentTitle)}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;