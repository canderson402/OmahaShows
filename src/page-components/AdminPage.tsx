import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { AdminDashboard, type AdminTab } from "../components/AdminDashboard";

export function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();
  const [tab, setTabState] = useState<AdminTab>("pending");

  const setTab = (newTab: AdminTab) => {
    setTabState(newTab);
  };

  // Protected route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
      <div className="max-w-4xl mx-auto md:p-6">
        <div className="text-center py-4 md:py-0 md:mb-6 bg-[#050506] md:bg-transparent">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 bg-clip-text text-transparent">OMAHA</span>
              <span className="text-white ml-2">SHOWS</span>
            </h1>
          </Link>
        </div>

        <div className="content-container md:border md:border-gray-800 md:rounded-xl p-4 md:p-6">
          <AdminDashboard onLogout={handleLogout} tab={tab} setTab={setTab} />
        </div>
      </div>
    </div>
  );
}
