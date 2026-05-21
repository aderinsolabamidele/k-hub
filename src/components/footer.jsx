import { Link } from "react-router-dom";
import { Building2, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">NaijaStays</span>
            </div>
            <p className="text-sm leading-relaxed">Premium short-let apartments across Nigeria. Your home away from home.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link to="/" className="block hover:text-white transition">Home</Link>
              <Link to="/apartments" className="block hover:text-white transition">Apartments</Link>
              <Link to="/contact" className="block hover:text-white transition">Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Locations</h4>
            <div className="space-y-3 text-sm">
              <p>{"Lagos & Lekki"}</p>
              <p>Abuja</p>
              <p>Port Harcourt</p>
              <p>Victoria Island</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm">
          <p>© 2026 NaijaStays. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}