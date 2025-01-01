import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/config/constants";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Home, LayoutDashboard, FileText, Video, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const hasAdminPermission = isAdminEmail(user?.email);

  useEffect(() => {
    if (!hasAdminPermission) {
      navigate('/');
    }
  }, [hasAdminPermission, navigate]);

  if (!hasAdminPermission) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <Link to="/" className="text-xl font-bold text-primary">
            Mobiwork Admin
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/content"
                className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FileText className="mr-2" />
                Content
              </Link>
            </li>
            <li>
              <Link
                to="/admin/videos"
                className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Video className="mr-2" />
                Videos
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Settings className="mr-2" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="flex items-center block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <Home className="mr-2" />
                Back to Docs
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Admin Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
          </div>
        </header>
        <main className="p-8">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminSidebar; 