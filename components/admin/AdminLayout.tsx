"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";

interface AdminLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, sidebar, title }: AdminLayoutProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="h-16 bg-primary flex items-center justify-between px-6 shadow-md flex-shrink-0">
        <Logo className="[&_span]:text-white [&_.text-primary-light]:text-blue-300" />
        <div className="flex items-center gap-4">
          {title && (
            <span className="text-white/70 text-sm hidden sm:block">{title}</span>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-primary-soft border-r border-primary-soft overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
