/**
 * SidebarItem Component
 * Reusable navigation item for dashboard sidebars
 */

export default function SidebarItem({ icon, label, active = false, onClick }) {
  const baseStyles =
    "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors";
  const activeStyles = "bg-primary text-white";
  const inactiveStyles = "text-textSecondary hover:bg-surfaceLight";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${active ? activeStyles : inactiveStyles}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
