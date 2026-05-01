import SidebarItem from "./SidebarItem";

/**
 * Sidebar Component
 * Reusable dashboard sidebar for role-based navigation
 */

export default function Sidebar({ items = [], onItemClick }) {
  return (
    <aside className="h-full bg-primary/10 border-r border-border p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3 px-4 py-2 mb-2">
        <img src="/logo.svg" alt="School Logo" className="h-10 w-10" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-textPrimary truncate">
            School Management System
          </h2>
          <p className="text-xs text-textSecondary truncate">Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={item.active}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </nav>
    </aside>
  );
}
