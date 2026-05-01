/**
 * Input Component
 * Reusable text input field with consistent theming
 */

export default function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textPrimary mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-surfaceLight border border-border rounded-lg px-3 py-2 text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
