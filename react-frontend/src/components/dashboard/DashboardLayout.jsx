import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * DashboardLayout Component
 * Shared responsive shell for all dashboard roles
 */

export default function DashboardLayout({
  title,
  userName,
  sidebarItems,
  onSidebarItemClick,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleItemClick = (item) => {
    onSidebarItemClick?.(item);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-textPrimary relative overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/80 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 md:static md:z-auto transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <Sidebar items={sidebarItems} onItemClick={handleItemClick} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          userName={userName}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
