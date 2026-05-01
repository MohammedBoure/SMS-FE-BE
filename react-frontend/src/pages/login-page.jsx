import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { authAPI } from "../api";

/**
 * Login Page
 * Split layout: left info panel, right login form
 */

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col md:flex-row">
      {/* LEFT PANEL - INFO (hidden on mobile) */}
      <div className="hidden md:flex md:w-3/5 bg-surface border-r border-border p-10 flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-semibold text-textPrimary mb-6">
            Welcome Back
          </h1>

          <p className="text-lg text-textSecondary mb-8 leading-relaxed">
            Access our school management system to stay connected with students,
            faculty, and administrative operations.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                ✓ Academic Excellence
              </h3>
              <p className="text-textSecondary text-sm">
                Comprehensive system for managing academics and student
                progress.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                ✓ Modern Learning Environment
              </h3>
              <p className="text-textSecondary text-sm">
                Digital-first tools for collaborative teaching and learning.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                ✓ Student Focused Education
              </h3>
              <p className="text-textSecondary text-sm">
                Personalized learning pathways and holistic student development.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM (full width on mobile) */}
      <div className="w-full md:w-2/5 bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h2 className="text-2xl sm:text-3xl font-semibold text-textPrimary mb-6 text-center">
              Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {error && (
                <div className="bg-surfaceLight border border-border rounded-lg p-3">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
