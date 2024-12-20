import React from "react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <SearchBar />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;