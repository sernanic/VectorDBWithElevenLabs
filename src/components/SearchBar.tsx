import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { documentationSections } from "@/data/docs";
import { Search, X } from "lucide-react";

type SearchResult = {
  item: {
    id: string;
    title: string;
    parentTitle?: string;
    sectionId?: string;
    subsectionId?: string;
  };
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Prepare search data including subsubsections
  const searchData = documentationSections.flatMap((section) => [
    { id: section.id, title: section.title },
    ...section.subsections.flatMap((subsection) => [
      {
        id: subsection.id,
        title: subsection.title,
        parentTitle: section.title,
        sectionId: section.id,
      },
      ...(subsection.subsubsections?.map((subsubsection) => ({
        id: subsubsection.id,
        title: subsubsection.title,
        parentTitle: subsection.title,
        sectionId: section.id,
        subsectionId: subsection.id,
      })) || []),
    ]),
  ]);

  // Initialize Fuse instance
  const fuse = new Fuse(searchData, {
    keys: ["title"],
    threshold: 0.3,
  });

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
    if (value.trim()) {
      const searchResults = fuse.search(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative mb-8">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search documentation..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {results.map(({ item }) => (
            <a
              key={item.id}
              href={item.subsectionId ? `/${item.sectionId}/${item.subsectionId}#${item.id}` : `#${item.id}`}
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-medium text-gray-900">
                {item.title}
              </div>
              {item.parentTitle && (
                <div className="text-xs text-gray-500">{item.parentTitle}</div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;