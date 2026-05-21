import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function KhubNavbar({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => { if (a) setUser(await base44.auth.me()); });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = transparent && !scrolled;
  const isAdmin = user?.role === "admin";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isTransparent ? "bg-transparent" : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-border/40"}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-1.5">
            <span className={`text-2xl font-display font-bold tracking-[-0.03em] ${isTransparent ? "text-white" : "text-foreground"}`}>K</span>
            <span className={`text-2xl font-display font-bold tracking-[-0.03em] ${isTransparent ? "text-white/60" : "text-accent"}`}>hub</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[["Explore", "/apartments"], ["Cities", "/cities"], ["How it works", "/how-it-works"]].map(([label, path]) => (
              <Link key={path} to={path} className={`text-sm font-medium transition-colors ${isTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>{label}</Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && <Link to="/admin"><Button variant="ghost" size="sm" className={`text-xs font-semibold ${isTransparent ? "text-white hover:bg-white/10" : ""}`}>Admin</Button></Link>}
                <Link to="/owner"><Button variant="ghost" size="sm" className={`text-xs font-medium ${isTransparent ? "text-white hover:bg-white/10" : ""}`}>Owner Portal</Button></Link>
                <Link to="/account"><Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">{user.full_name?.split(" ")[0]}</Button></Link>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className={`text-sm font-medium ${isTransparent ? "text-white hover:bg-white/10" : ""}`}>Sign In</Button></Link>
                <Link to="/register"><Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold">Join Khub</Button></Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-lg ${isTransparent ? "text-white" : "text-foreground"}`}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-border px-5 py-5 space-y-1">
          {[["Explore", "/apartments"], ["Cities", "/cities"], ["How it works", "/how-it-works"], ["Owner Portal", "/owner"]].map(([label, path]) => (
            <Link key={path} to={path} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-foreground hover:text-accent transition border-b border-border/40 last:border-0">{label}</Link>
          ))}
          {user ? (
            <Link to="/account" onClick={() => setOpen(false)} className="block pt-3 text-sm font-semibold text-accent">My Account</Link>
          ) : (
            <div className="flex gap-3 pt-3">
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" size="sm" className="rounded-full">Sign In</Button></Link>
              <Link to="/register" onClick={() => setOpen(false)}><Button size="sm" className="rounded-full bg-primary text-primary-foreground">Join Khub</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}