import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, Search, X, MapPin } from "lucide-react";
import PropertyCard from "../components/PropertyCard";

const LOCATIONS = ["All", "Lagos", "Abuja", "Lekki", "Port Harcourt", "Victoria Island", "Ibadan", "Enugu"];
const TYPES = ["All", "Short-let", "Long-term", "Luxury", "Student", "Lofts", "Verified"];

export default function KhubExplore() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [bedrooms, setBedrooms] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get("location");
    const cat = params.get("category");
    if (loc) setLocation(loc);
    if (cat) setType(cat);
    base44.auth.isAuthenticated().then(async (a) => {
      if (a) {
        const me = await base44.auth.me();
        setUser(me);
        const saved = await base44.entities.SavedApartment.filter({ user_email: me.email });
        setSavedIds(saved.map(s => s.apartment_id));
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const filter = { status: "active" };
    if (location !== "All") filter.location = location;
    base44.entities.Apartment.filter(filter, "-created_date", 100)
      .then(data => {
        let filtered = data;
        if (type !== "All") filtered = filtered.filter(a => a.category === type || (type === "Verified" && a.verified));
        if (bedrooms !== "Any") filtered = filtered.filter(a => a.bedrooms >= parseInt(bedrooms));
        filtered = filtered.filter(a => (a.price_per_night || 0) <= maxPrice);
        setApartments(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location, type, maxPrice, bedrooms]);

  const handleSave = async (aptId) => {
    if (!user) return;
    if (savedIds.includes(aptId)) {
      const existing = await base44.entities.SavedApartment.filter({ apartment_id: aptId, user_email: user.email });
      if (existing.length > 0) await base44.entities.SavedApartment.delete(existing[0].id);
      setSavedIds(prev => prev.filter(id => id !== aptId));
    } else {
      await base44.entities.SavedApartment.create({ apartment_id: aptId, user_email: user.email });
      setSavedIds(prev => [...prev, aptId]);
    }
  };

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-background">
      {/* Sticky filters bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="text-sm font-medium bg-muted rounded-full px-4 py-2 outline-none cursor-pointer whitespace-nowrap border-0 appearance-none">
              {LOCATIONS.map(l => <option key={l} value={l}>{l === "All" ? "All Cities" : l}</option>)}
            </select>
            <div className="h-5 w-px bg-border flex-shrink-0" />
            {TYPES.slice(1).map(t => (
              <button key={t} onClick={() => setType(type === t ? "All" : t)} className={`text-xs font-semibold whitespace-nowrap rounded-full px-4 py-2 transition-all ${type === t ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-foreground/10"}`}>{t}</button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap rounded-full px-4 py-2 border transition ml-auto flex-shrink-0 ${showFilters ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-4 items-center py-3 border-t border-border/40 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Max price:</span>
                <span className="font-bold text-foreground">₦{maxPrice.toLocaleString()}</span>
                <input type="range" min={10000} max={1000000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-32 accent-accent" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-medium">Beds:</span>
                {["Any","1","2","3","4+"].map(b => (
                  <button key={b} onClick={() => setBedrooms(b)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${bedrooms === b ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>{b}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{apartments.length}</span> properties found</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[4/3]" />)}
          </div>
        ) : apartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apartments.map((apt, i) => <PropertyCard key={apt.id} apartment={apt} index={i} onSave={user ? handleSave : null} saved={savedIds.includes(apt.id)} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setLocation("All"); setType("All"); }}>Clear filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}