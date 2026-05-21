import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Building2, Phone, LogIn } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NaijaStays</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/apartments" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Apartments</Link>
            <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">Sign In</Button>
            </Link>
            <Link to="/apartments">
              <Button size="sm" className="text-sm font-semibold bg-primary hover:bg-primary/90 rounded-full px-6">Explore</Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition"><Home className="w-4 h-4" /> Home</Link>
          <Link to="/apartments" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition"><Building2 className="w-4 h-4" /> Apartments</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition"><Phone className="w-4 h-4" /> Contact</Link>
          <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition"><LogIn className="w-4 h-4" /> Sign In</Link>
        </div>
      )}
    </nav>
  );
}