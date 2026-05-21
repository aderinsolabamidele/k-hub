import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import ApartmentCard from "../components/ApartmentCard";

const locations = ["All", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Calabar", "Benin City", "Lekki", "Victoria Island"];

export default function Apartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get("location");
    if (loc) setLocation(loc);
  }, []);

  useEffect(() => {
    setLoading(true);
    const filter = { status: "active" };
    if (location !== "All") filter.location = location;
    base44.entities.Apartment.filter(filter, "-created_date", 50)
      .then(setApartments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [location]);

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Browse Apartments</h1>
            <p className="text-muted-foreground mt-1">{apartments.length} properties available</p>
          </div>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-48 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : apartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apartments.map((apt, i) => <ApartmentCard key={apt.id} apartment={apt} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Apartments Found</h3>
            <p className="text-muted-foreground">Try a different location or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}