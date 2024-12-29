import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ChatButton } from "@/components/ChatButton";
import { useState } from "react";
import SubsectionContent from "./components/SubsectionContent";
import AdminDashboard from "./components/AdminDashboard";
import AuthLayout from "./components/AuthLayout";
import ContentManagement from "./features/content-management/ContentManagement";
import SectionDetails from "./features/content-management/SectionDetails";
import { SubsectionDetails } from "./features/content-management/SubsectionDetails";
import { VideoManagement } from "./pages/admin/VideoManagement";

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
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<AuthLayout />} />
              <Route path="/signup" element={<AuthLayout />} />

              {/* Main Documentation Routes */}
              <Route
                path="/*"
                element={
                  <div className="min-h-screen bg-background">
                    <Header toggleSidebar={toggleMobileSidebar} />
                    <div className="flex pt-20">
                      <Sidebar isMobileOpen={isMobileOpen} toggleMobileSidebar={toggleMobileSidebar} />
                      <main className="flex-1 px-4 lg:px-8 py-8">
                        <Routes>
                          <Route path="/" element={<div className="p-8">Select a section to begin</div>} />
                          <Route path=":sectionId/:subsectionId" element={<SubsectionContent />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <ChatButton />
                      </main>
                    </div>
                  </div>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<div>Users Management</div>} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="content/section/:sectionId" element={<SectionDetails />} />
                <Route 
                  path="content/section/:sectionId/subsection/:subsectionId" 
                  element={<SubsectionDetails />} 
                />
                <Route path="videos" element={<VideoManagement />} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;