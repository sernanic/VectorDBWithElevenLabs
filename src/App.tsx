import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import Index from "./pages/Index";
import Subsection from "./pages/Subsection";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ChatButton } from "@/components/ChatButton";
import Header from './components/Header';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Header toggleSidebar={toggleMobileSidebar} />
              <div className="flex pt-20">
                <Sidebar isMobileOpen={isMobileOpen} onToggleMobile={toggleMobileSidebar} />
                <main className="flex-1 px-4 lg:px-8 py-8">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/:sectionId/:subsectionId" element={<Subsection />} />
                  </Routes>
                  <ChatButton />
                </main>
              </div>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;