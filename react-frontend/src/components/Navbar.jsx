import { Link } from "react-router-dom";
import Button from "./Button";

/**
 * Navbar Component
 * Top navigation with logo, school name, and login button
 */

export default function Navbar() {
  return (
    <nav className="bg-surface border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
      {/* Left: Logo and School Name */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src="/logo.png"
          alt="School Logo"
          className="h-8 sm:h-10 w-8 sm:w-10 flex-shrink-0"
        />
        <h1 className="text-sm sm:text-lg font-semibold text-textPrimary truncate">
          School Management System
        </h1>
      </div>

      {/* Right: Login Button */}
      <Link to="/login" className="flex-shrink-0">
        <Button variant="primary">Login</Button>
      </Link>
    </nav>
  );
}
