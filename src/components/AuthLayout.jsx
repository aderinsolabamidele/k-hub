import { Link } from "react-router-dom";
import { MapPin, Star, Bed, Bath, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
];

export default function ApartmentCard({ apartment, index = 0 }) {
  const img = apartment.images?.[0] || placeholderImages[index % placeholderImages.length];

  return (
    <Link to={`/apartments/${apartment.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={img} alt={apartment.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          {apartment.featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold text-xs">Featured</Badge>
          )}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-bold text-foreground">
            ₦{apartment.price_per_night?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/night</span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">{apartment.title}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{apartment.location}</span>
            {apartment.rating > 0 && (
              <>
                <span className="mx-1">·</span>
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <span className="text-foreground font-medium">{apartment.rating}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {apartment.bedrooms} Bed</span>
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {apartment.bathrooms} Bath</span>
            {apartment.max_guests && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {apartment.max_guests}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}