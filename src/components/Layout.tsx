import React from "react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import { AuthButtons } from "./AuthButtons";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
            <AuthButtons />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;