import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import PropertyCard from "../components/PropertyCard";

export default function SavedHomes() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchSaved = async () => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { setLoading(false); return; }
    const u = await base44.auth.me();
    setUser(u);
    const saved = await base44.entities.SavedApartment.filter({ user_email: u.email });
    const ids = saved.map(s => s.apartment_id);
    const apts = await Promise.all(ids.map(id => base44.entities.Apartment.get(id).catch(() => null)));
    setApartments(apts.filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { fetchSaved(); }, []);

  const removeSaved = async (id) => {
    if (!user) return;
    const saved = await base44.entities.SavedApartment.filter({ apartment_id: id, user_email: user.email });
    if (saved[0]) await base44.entities.SavedApartment.delete(saved[0].id);
    setApartments(prev => prev.filter(a => a.id !== id));
  };

  if (!user && !loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-background font-body">
      <div className="text-center"><Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><h2 className="text-xl font-display font-bold mb-2">Sign in to see saved homes</h2><Link to="/login"><Button className="rounded-full bg-accent text-white mt-4 px-8">Sign In</Button></Link></div>
    </div>
  );

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20 font-body">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="py-8">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Your Wishlist</p>
          <h1 className="text-3xl font-display font-bold text-foreground">Saved Homes</h1>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[4/5]" />)}</div>
        ) : apartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apartments.map((apt, i) => <PropertyCard key={apt.id} apartment={apt} index={i} onSave={removeSaved} saved={true} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No saved homes yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Tap the heart on any property to save it here.</p>
            <Link to="/apartments"><Button className="rounded-full bg-accent text-white px-8">Browse Homes</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}