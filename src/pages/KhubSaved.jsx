import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "../components/PropertyCard";

export default function KhubSaved() {
  const [saved, setSaved] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      if (a) {
        const me = await base44.auth.me();
        setUser(me);
        const savedRecords = await base44.entities.SavedApartment.filter({ user_email: me.email });
        setSaved(savedRecords);
        const aptPromises = savedRecords.map(s => base44.entities.Apartment.get(s.apartment_id).catch(() => null));
        const apts = (await Promise.all(aptPromises)).filter(Boolean);
        setApartments(apts);
      }
      setLoading(false);
    });
  }, []);

  const handleUnsave = async (aptId) => {
    const record = saved.find(s => s.apartment_id === aptId);
    if (record) await base44.entities.SavedApartment.delete(record.id);
    setSaved(s => s.filter(r => r.apartment_id !== aptId));
    setApartments(a => a.filter(apt => apt.id !== aptId));
  };

  if (!user && !loading) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-5">
      <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <h2 className="font-display font-bold text-2xl mb-2">Sign in to see your saved homes</h2>
      <p className="text-muted-foreground mb-6">Create an account to save and revisit your favourite listings.</p>
      <Link to="/login"><Button className="rounded-full bg-foreground text-background px-8">Sign In</Button></Link>
    </div>
  );

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mb-8">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Your Wishlist</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Saved Homes</h1>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[4/3]" />)}
          </div>
        ) : apartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {apartments.map((apt, i) => <PropertyCard key={apt.id} apartment={apt} index={i} onSave={handleUnsave} saved={true} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl mb-2">Nothing saved yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Tap the heart on any listing to save it here.</p>
            <Link to="/apartments"><Button className="rounded-full bg-foreground text-background px-8"><Search className="w-4 h-4 mr-2" /> Explore Listings</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}