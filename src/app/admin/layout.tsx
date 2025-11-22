"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageCircle,
  ToggleLeft,
  BarChart3,
  MessageSquare,
  History,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 1. Try to load from cache first for instant UI
    const cachedUser = localStorage.getItem("admin_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem("admin_user");
      }
    }

    // 2. Fetch fresh user info to verify session
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (res.status === 401) {
          // Session expired
          localStorage.removeItem("admin_user");
          router.push("/admin/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // Update cache
          localStorage.setItem("admin_user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Ignore network errors, keep using cache if available
      });
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("admin_user");
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/portfolio", label: "Portfolio Data", icon: FileText },
    { href: "/admin/features", label: "Feature Flags", icon: ToggleLeft },
    { href: "/admin/blog", label: "Blog", icon: BookOpen },
    { href: "/admin/comments", label: "Comments", icon: MessageCircle }, // Added Comments nav item
    { href: "/admin/stats", label: "Visitor Stats", icon: BarChart3 },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/chat", label: "Chat History", icon: History },
  ];

  // Don't show layout on auth pages
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 0,
          opacity: isSidebarOpen ? 1 : 0,
        }}
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-gray-800 border-r border-gray-700 overflow-hidden flex flex-col ${
          !isSidebarOpen && "pointer-events-none lg:pointer-events-auto lg:w-0"
        }`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          {user && (
            <p className="text-sm text-gray-400 mt-2">
              Welcome, <span className="text-white font-medium">{user.username}</span>
            </p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-900 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
