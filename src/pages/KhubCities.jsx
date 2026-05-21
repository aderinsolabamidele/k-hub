import { Link } from "react-router-dom";

const CITIES = [
  { name: "Lagos", state: "Lagos State", desc: "Nigeria's commercial capital — from Lekki to Victoria Island.", img: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800&q=80", count: "120+" },
  { name: "Abuja", state: "FCT", desc: "The seat of power, home to diplomatic residences and luxury estates.", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", count: "80+" },
  { name: "Lekki", state: "Lagos State", desc: "The new Lagos — beaches, malls, and premium gated estates.", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", count: "65+" },
  { name: "Port Harcourt", state: "Rivers State", desc: "The Garden City — oil hub with a growing premium real estate scene.", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", count: "45+" },
  { name: "Victoria Island", state: "Lagos State", desc: "Lagos's most cosmopolitan address — business, leisure and culture.", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", count: "55+" },
  { name: "Ibadan", state: "Oyo State", desc: "The ancient city embracing modern living with emerging short-lets.", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", count: "30+" },
];

export default function KhubCities() {
  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Destinations</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">Your City, Your Space</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">From the Lagos shoreline to the Abuja highlands — Khub has your perfect stay covered.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CITIES.map(city => (
            <Link key={city.name} to={`/apartments?location=${city.name}`} className="group relative rounded-3xl overflow-hidden bg-foreground cursor-pointer">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-xs mb-0.5">{city.state} · {city.count} listings</p>
                <h3 className="font-display font-bold text-white text-2xl mb-1">{city.name}</h3>
                <p className="text-white/60 text-sm leading-snug">{city.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}