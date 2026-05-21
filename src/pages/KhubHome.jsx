import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "../api/Base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Sparkles, Shield, TrendingUp, Home, Zap } from "lucide-react";
import PropertyCard from "../components/PropertyCard";

const heroImg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800";
const interiorImg = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
const hostImg = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800";

const CITIES = [
  { name: "Lagos", img: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=800", count: "120+" },
  { name: "Abuja", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", count: "80+" },
  { name: "Lekki", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", count: "60+" },
  { name: "Port Harcourt", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", count: "40+" },
];

const CATEGORIES = [
  { label: "Short-let", icon: "⚡", desc: "Days or weeks" },
  { label: "Luxury", icon: "✦", desc: "5-star living" },
  { label: "Long-term", icon: "🏡", desc: "Monthly leases" },
  { label: "Student", icon: "📚", desc: "Campus-close" },
  { label: "Lofts", icon: "🎨", desc: "Creative spaces" },
  { label: "Verified", icon: "✓", desc: "Khub certified" },
];

export default function KhubHome() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Lagos");
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Apartment.filter({ status: "active" }, "-created_date", 8)
      .then(setFeatured).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="font-body">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 w-full">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Modern Living Starts Here</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.9] tracking-[-0.03em] mb-6">
              Homes<br />
              <span className="text-accent">Beyond</span><br />
              Ordinary
            </h1>
            <p className="text-white/60 text-lg sm:text-xl max-w-lg leading-relaxed">
              Discover premium apartments, short-lets, and serviced homes across Nigeria's finest cities.
            </p>
          </div>
          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 flex-1 px-4">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none py-3 cursor-pointer appearance-none">
                <option value="">All Cities</option>
                {["Lagos", "Abuja", "Lekki", "Port Harcourt", "Victoria Island", "Ibadan", "Enugu"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-border mx-2" />
            <div className="flex items-center gap-3 flex-1 px-4">
              <Home className="w-4 h-4 text-accent flex-shrink-0" />
              <select className="w-full bg-transparent text-sm font-medium text-foreground outline-none py-3 cursor-pointer appearance-none">
                <option>Any type</option>
                <option>Short-let</option>
                <option>Long-term</option>
                <option>Luxury</option>
                <option>Student</option>
              </select>
            </div>
            <Button onClick={() => navigate(`/apartments${selectedCity ? `?location=${selectedCity}` : ""}`)} className="rounded-xl px-8 h-12 bg-foreground hover:bg-foreground/90 text-background text-sm font-semibold">
              Search
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur" />)}
            </div>
            <p className="text-white/50 text-sm"><span className="text-white font-semibold">2,400+</span> happy guests this month</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Browse by type</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Find Your Space</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} to={`/apartments?category=${cat.label}`} className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer text-center">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-background">{cat.label}</span>
                <span className="text-[10px] text-muted-foreground group-hover:text-background/60">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Handpicked</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Top Picks in Nigeria</h2>
            </div>
            <Link to="/apartments"><Button variant="ghost" className="text-sm font-semibold group">All Listings <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Button></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[4/3]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((apt, i) => <PropertyCard key={apt.id} apartment={apt} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* CITIES */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Explore</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Your City Awaits</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CITIES.map((city) => (
              <Link key={city.name} to={`/apartments?location=${city.name}`} className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white/60 text-xs mb-1">{city.count} listings</p>
                  <h3 className="font-display font-bold text-white text-xl">{city.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY KHUB */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">Why Khub</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">Built for Nigeria.<br />Trusted by Thousands.</h2>
              <p className="text-background/60 leading-relaxed mb-10">We combine local expertise with global design standards to give you the most trusted apartment discovery experience in Nigeria.</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: "Verified Homes", desc: "Every listing is physically inspected" },
                  { icon: Star, label: "Curated Quality", desc: "Only the best make it to Khub" },
                  { icon: Zap, label: "Instant Booking", desc: "Book in under 60 seconds" },
                  { icon: TrendingUp, label: "Best Prices", desc: "No hidden fees, ever" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <item.icon className="w-5 h-5 text-accent mb-2" />
                    <p className="text-sm font-semibold text-background">{item.label}</p>
                    <p className="text-xs text-background/50">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src={interiorImg} alt="Interior" className="w-full rounded-3xl object-cover aspect-[4/5]" />
              <div className="absolute -bottom-6 -left-6 bg-accent text-white rounded-2xl p-5 shadow-2xl">
                <p className="text-3xl font-display font-bold">98%</p>
                <p className="text-xs text-white/70 mt-0.5">Guest satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOST CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="relative bg-muted rounded-3xl overflow-hidden px-8 lg:px-16 py-16">
            <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
              <img src={hostImg} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/80 to-transparent" />
            </div>
            <div className="relative max-w-lg">
              <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">For Hosts</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">Earn on Your Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">List your apartment on Khub and reach thousands of qualified tenants and guests. Simple listing, smart tools, guaranteed payments.</p>
              <Link to="/owner">
                <Button className="rounded-full px-10 h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold">
                  Start Hosting <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}