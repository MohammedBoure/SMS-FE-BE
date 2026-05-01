/**
 * DashboardCard Component
 * Generic content card for dashboard sections
 */

export default function DashboardCard({ title, children, className = "" }) {
  return (
    <section
      className={`bg-surface border border-border rounded-xl p-4 shadow-card ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-textPrimary mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}
