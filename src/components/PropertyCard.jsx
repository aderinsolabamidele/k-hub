import { Link } from "react-router-dom";
import { MapPin, Star, Bed, Bath, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fallbackImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80",
];

const categoryColors = {
  "Short-let": "bg-accent text-accent-foreground",
  "Long-term": "bg-foreground text-background",
  "Luxury": "bg-yellow-900 text-yellow-100",
  "Student": "bg-blue-600 text-white",
};

export default function PropertyCard({ apartment, index = 0, onSave, saved = false }) {
  const img = apartment.images?.[0] || fallbackImages[index % fallbackImages.length];

  return (
    <div className="group relative">
      <Link to={`/apartments/${apartment.id}`} className="block">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-3">
          <img src={img} alt={apartment.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {apartment.category && (
            <Badge className={`absolute top-3 left-3 text-[10px] font-semibold ${categoryColors[apartment.category] || "bg-foreground text-background"}`}>
              {apartment.category}
            </Badge>
          )}
          {apartment.verified && (
            <div className="absolute top-3 right-10 bg-white/90 rounded-full px-2 py-0.5 text-[10px] font-bold text-foreground">✓ Verified</div>
          )}
        </div>
        <div className="space-y-1 px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-accent transition-colors">{apartment.title}</h3>
            {apartment.rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-xs font-semibold text-foreground">{apartment.rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3 h-3" />
            <span>{apartment.location}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{apartment.bedrooms} bed</span>
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{apartment.bathrooms} bath</span>
          </div>
          <div className="pt-1">
            <span className="text-sm font-bold text-foreground">₦{apartment.price_per_night?.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </div>
        </div>
      </Link>
      {onSave && (
        <button onClick={() => onSave(apartment.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition">
          <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
        </button>
      )}
    </div>
  );
}