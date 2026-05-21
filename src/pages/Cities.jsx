import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CITIES = [
  { name: "Lagos", neighborhoods: ["Lekki", "Victoria Island", "Ikoyi", "Ikeja", "Surulere"], img: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800&q=80", desc: "Nigeria's commercial heartbeat with premier short-let options." },
  { name: "Abuja", neighborhoods: ["Maitama", "Wuse 2", "Asokoro", "Garki"], img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", desc: "The capital city with serene residential districts." },
  { name: "Port Harcourt", neighborhoods: ["GRA", "Old GRA", "Rumuola"], img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", desc: "The garden city known for oil wealth and great properties." },
  { name: "Ibadan", neighborhoods: ["Bodija", "Jericho", "Ring Road"], img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", desc: "A vast city with affordable and spacious accommodations." },
  { name: "Enugu", neighborhoods: ["GRA", "Independence Layout"], img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", desc: "The Coal City — peaceful and rising in real estate." },
  { name: "Calabar", neighborhoods: ["GRA", "State Housing", "Satellite Town"], img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", desc: "Nigeria's cleanest city with a warm, relaxed atmosphere." },
];

export default function Cities() {
  return (
    <div className="pt-20 lg:pt-24 pb-16 bg-background font-body">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center py-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3">Destinations</p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight">Your City, Your Space</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">Browse premium apartments in Nigeria's most vibrant cities. From Lagos to Calabar, find your perfect stay.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CITIES.map((city) => (
            <Link key={city.name} to={`/apartments?location=${city.name}`} className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-display font-bold text-foreground">{city.name}</h2>
                  <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{city.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {city.neighborhoods.map(n => <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{n}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}