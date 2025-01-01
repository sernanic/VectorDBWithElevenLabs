import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./components/private/AdminSidebar";
import Sidebar from "./components/public/sidebar/Sidebar";
import Header from "./components/public/header/Header";
import { ChatButton } from "@/components/public/ChatButton";
import { useState } from "react";
import SubsectionContent from "./pages/public/content/SubsectionContent";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AuthLayout from "./pages/public/auth/AuthLayout";
import ContentManagement from "./pages/admin/content/contentManagement/ContentManagement";
import SectionDetails from "./pages/admin/content/sectionDetails/SectionDetails";
import { VideoManagement } from "./pages/admin/video/VideoManagement/VideoManagement";
import { VideoDetail } from "./pages/admin/video/videoDetails/VideoDetail";
import { toast } from "@/components/ui/use-toast";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Only retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add global error handler
queryClient.setDefaultOptions({
  queries: {
    onError: (error: Error) => {
      console.error('Query Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while fetching data",
        variant: "destructive",
      });
    },
  },
  mutations: {
    onError: (error: Error) => {
      console.error('Mutation Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating data",
        variant: "destructive",
      });
    },
  },
});

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
              <Route path="/admin/*" element={<AdminSidebar />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<div>Users Management</div>} />
                <Route path="content" element={<ContentManagement />} />
                <Route path="content/section/:sectionId" element={<SectionDetails />} />
                <Route path="videos" element={<VideoManagement />} />
                <Route path="videos/:videoId" element={<VideoDetail />} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="top"
          buttonPosition="top"
          styleNonce="rq-devtools"
        />
      )}
    </QueryClientProvider>
  );
}

export default App;