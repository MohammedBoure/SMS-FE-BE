/**
 * Button Component
 * Reusable button with multiple variants
 * Variants: primary, secondary, danger
 */

export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  ...props
}) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";

  const variants = {
    primary: "bg-primary hover:bg-primaryDark text-white",
    secondary: "border border-border text-textPrimary hover:bg-surfaceLight",
    danger: "bg-danger text-white hover:opacity-90",
  };

  const variantStyles = variants[variant] || variants.primary;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
