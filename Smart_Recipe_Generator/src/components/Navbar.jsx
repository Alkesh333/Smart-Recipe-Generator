import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

// Responsive, accessible Navbar with hamburger menu (React + Tailwind)
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-700 ${
        location.pathname === to ? "text-emerald-700" : "text-gray-800"
      }`}
      role="menuitem"
      tabIndex={0}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur shadow-sm">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 md:py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-emerald-700">
          <span role="img" aria-label="chef">👨‍🍳</span>
          Smart Recipes
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex" role="menubar" aria-label="Primary">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/favorites", "Favorite")}
          {navLink("/recommendation", "Recommendation")}
          {navLink("/top20", "Top 20 Recipes")}
          <Link
            to="/logout"
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            role="menuitem"
            tabIndex={0}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-800 hover:bg-gray-100 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu panel (anchored to top-right) */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className={`md:hidden absolute right-4 top-full z-40 mt-2 w-64 origin-top-right rounded-lg border border-gray-200 bg-white p-2 shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
        role="menubar"
        aria-label="Primary mobile"
      >
        <div className="flex flex-col gap-1">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/favorites", "Favorite")}
          {navLink("/recommendation", "Recommendation")}
          {navLink("/top20", "Top 20 Recipes")}
          <Link
            to="/logout"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            role="menuitem"
            tabIndex={0}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}


