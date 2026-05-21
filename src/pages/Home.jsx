import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Headphones, CreditCard, MapPin } from "lucide-react";
import HeroSection from "../components/HeroSection";
import ApartmentCard from "../components/ApartmentCard";

const features = [
  { icon: Shield, title: "Verified Properties", desc: "Every listing is personally inspected and verified for quality." },
  { icon: Headphones, title: "24/7 Support", desc: "Our team is always available to assist you anytime." },
  { icon: CreditCard, title: "Secure Payments", desc: "Safe and seamless payment options including bank transfer." },
  { icon: MapPin, title: "Prime Locations", desc: "Properties in the best neighborhoods across Nigeria." },
];

const cities = [
  { name: "Lagos", img: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=600&q=80" },
  { name: "Abuja", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" },
  { name: "Lekki", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80" },
  { name: "Port Harcourt", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Apartment.filter({ status: "active" }, "-created_date", 8)
      .then(setFeatured)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroSection />

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Featured</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Top Picks For You</h2>
            </div>
            <Link to="/apartments">
              <Button variant="ghost" className="text-primary font-semibold group">
                View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((apt, i) => <ApartmentCard key={apt.id} apartment={apt} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No apartments listed yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Cities */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Explore</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Popular Destinations</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link key={city.name} to={`/apartments?location=${city.name}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-xl">{city.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Ready to List Your Property?</h2>
          <p className="text-primary-foreground/70 text-lg mb-8">Join hundreds of property owners earning on NaijaStays.</p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 font-semibold text-base">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}