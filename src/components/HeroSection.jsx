import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Sparkles } from "lucide-react";

const locations = ["Lagos", "Abuja", "Port Harcourt", "Lekki", "Victoria Island", "Ibadan", "Enugu"];
const heroImg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/apartments${query ? `?location=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Luxury apartment" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-white/90 text-sm font-medium">{"Nigeria's Premium Short-Let Platform"}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Find Your Perfect
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-accent">Nigerian Stay</span>
        </h1>

        <p className="text-white/70 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover luxury apartments, cozy studios, and premium short-lets in Lagos, Abuja, and beyond.
        </p>

        <div className="max-w-xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 pl-4">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <select
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-foreground text-sm font-medium outline-none py-3 appearance-none cursor-pointer"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleSearch} className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["Lagos", "Abuja", "Lekki"].map((loc) => (
            <button
              key={loc}
              onClick={() => { setQuery(loc); navigate(`/apartments?location=${loc}`); }}
              className="text-white/60 hover:text-white text-sm border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 transition"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}