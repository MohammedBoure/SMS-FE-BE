/**
 * Card Component
 * Reusable card container for content sections
 */

export default function Card({ title, description, children }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card h-full">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-textPrimary mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-textSecondary text-xs sm:text-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
