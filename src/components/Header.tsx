import React from 'react';
import SearchBar from './SearchBar';
import { AuthButtons } from './AuthButtons';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-50 lg:hidden"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Mobiwork Docs</h1>
          </div>
        </div>
        <div className="flex-1 max-w-2xl mx-8">
          <SearchBar />
        </div>
        <div className="flex items-center">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
