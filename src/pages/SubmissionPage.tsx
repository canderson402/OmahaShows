import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SubmitShowForm } from "../components/SubmitShowForm";

export function SubmissionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Protected route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-texture flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-texture">
      <div className="md:py-8">
        <div className="mx-auto md:px-4 max-w-5xl">
          <div className="content-container md:rounded-2xl p-6">
            {/* Header */}
            <div className="text-center mb-8 -mx-6 -mt-6 px-6 pt-6 pb-6 bg-[#050506] md:rounded-t-2xl border-b border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Admin
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-amber-400 text-xs font-medium tracking-wide uppercase">Admin</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  Submit
                </span>
                <span className="text-white ml-2">Show</span>
              </h1>
              <p className="text-gray-500 mt-2 text-sm">Manually add shows to the database</p>
            </div>

            <SubmitShowForm />
          </div>
        </div>
      </div>
    </div>
  );
}
