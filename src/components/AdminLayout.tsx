import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { isAdminEmail } from "@/config/constants";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Breadcrumbs } from "./Breadcrumbs";

const AdminLayout = () => {
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
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Users
              </Link>
            </li>
            <li>
              <Link
                to="/admin/content"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Content Management
              </Link>
            </li>
            <li>
              <Link
                to="/admin/videos"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
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

export default AdminLayout; 