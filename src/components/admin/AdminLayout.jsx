import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Stethoscope, Building2, Heart, FileText, MessageSquare, Users, CalendarDays, HelpCircle, Mail, Settings, Menu, X, ChevronLeft, ClipboardList, LayoutList, LogOut } from "lucide-react";
import LanguageSelector from "@/components/common/LanguageSelector";
import { LOGO_URL } from "@/lib/brand-assets";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: ClipboardList, label: "Treatment Requests", path: "/admin/treatment-requests" },
  { icon: Users, label: "Leads", path: "/admin/leads" },
  { icon: Stethoscope, label: "Doctors", path: "/admin/doctors" },
  { icon: Building2, label: "Hospitals", path: "/admin/hospitals" },
  { icon: Heart, label: "Treatments", path: "/admin/treatments" },
  { icon: CalendarDays, label: "Appointments", path: "/admin/appointments" },
  { icon: FileText, label: "Blog Posts", path: "/admin/blog" },
  { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
  { icon: HelpCircle, label: "FAQs", path: "/admin/faqs" },
  { icon: LayoutList, label: "Site Content", path: "/admin/site-content" },
  { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLoggingOut(false);
    }
  };

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 border-b flex items-center justify-between flex-shrink-0">
          <Link to="/admin">
            <img
              src={LOGO_URL}
              alt="AlHind Lifecare"
              className="h-9 w-auto rounded-lg"
            />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto overscroll-contain">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t flex-shrink-0 space-y-1">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2">
            <ChevronLeft className="w-4 h-4" /> Back to Website
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg px-3 py-2 transition-colors disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" /> {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-semibold text-lg">
            {navItems.find((n) => n.path === location.pathname)?.label || "Admin"}
          </h1>
          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}