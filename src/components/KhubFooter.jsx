import { Link } from "react-router-dom";

export default function KhubFooter() {
  return (
    <footer className="bg-foreground text-white/60 font-body">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
          <div className="lg:col-span-2">
            <div className="flex items-baseline gap-0.5 mb-4">
              <span className="text-3xl font-display font-bold text-white tracking-[-0.03em]">K</span>
              <span className="text-3xl font-display font-bold text-accent tracking-[-0.03em]">hub</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">Modern Living Starts Here. Discover premium apartments, short-lets, and serviced homes across Nigeria.</p>
            <p className="text-xs mt-6 text-white/30">© 2026 Khub Technologies Ltd. Nigeria.</p>
          </div>
          {[
            { title: "Platform", links: [["Explore", "/apartments"], ["Cities", "/cities"], ["How it Works", "/how-it-works"], ["Saved Homes", "/saved"]] },
            { title: "Hosts", links: [["List Your Property", "/owner"], ["Owner Portal", "/owner"], ["Host Resources", "/owner"]] },
            { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Press", "#"], ["Contact", "/contact"]] },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">{col.title}</h5>
              <div className="space-y-3">
                {col.links.map(([label, path]) => (
                  <Link key={label} to={path} className="block text-sm hover:text-white transition">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex gap-6">
            <span>Privacy Policy</span><span>Terms of Service</span><span>Cookie Policy</span>
          </div>
          <span className="text-white/30">Lagos · Abuja · Port Harcourt · Ibadan</span>
        </div>
      </div>
    </footer>
  );
}