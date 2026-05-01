/**
 * Topbar Component
 * Reusable dashboard header with menu button and user info
 */

import Button from "../Button";

export default function Topbar({ title, userName = "User", onMenuClick }) {
  return (
    <header className="bg-surface border-b border-border px-4 sm:px-6 py-4 flex justify-between items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <Button
            variant="secondary"
            onClick={onMenuClick}
            className="md:hidden px-3 py-2"
            aria-label="Open sidebar menu"
          >
            Menu
          </Button>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-textPrimary truncate">
          {title}
        </h1>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-right">
        <div>
          <p className="text-sm font-medium text-textPrimary">{userName}</p>
          <p className="text-xs text-textSecondary">Dashboard user</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
          {userName
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      </div>
    </header>
  );
}
