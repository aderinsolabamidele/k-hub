import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/Base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Star, Bed, Bath, Users, Wifi, Wind, Car, Shield, Zap, Check } from "lucide-react";
import { toast } from "sonner";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
];

const amenityIcons = { WiFi: Wifi, AC: Wind, Parking: Car, Security: Shield, Generator: Zap };

export default function ApartmentDetail() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", guests: 1 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Apartment.get(id)
      .then(setApartment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!form.guest_name || !form.guest_email || !form.check_in || !form.check_out) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const days = Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000));
    await base44.entities.Booking.create({
      ...form,
      apartment_id: id,
      apartment_title: apartment.title,
      total_price: days * apartment.price_per_night,
    });
    toast.success("Booking request submitted! We'll contact you shortly.");
    setBookingOpen(false);
    setForm({ guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", guests: 1 });
    setSubmitting(false);
  };

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!apartment) return (
    <div className="pt-24 min-h-screen flex items-center justify-center text-muted-foreground">Apartment not found.</div>
  );

  const images = apartment.images?.length ? apartment.images : placeholderImgs;

  return (
    <div className="pt-20 lg:pt-24 pb-16 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-3xl overflow-hidden mb-8">
          <div className="aspect-[4/3]">
            <img src={images[0]} alt={apartment.title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="aspect-[4/3]">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground text-sm">{apartment.location}{apartment.address ? ` · ${apartment.address}` : ""}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">{apartment.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {apartment.bedrooms} Bedrooms</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {apartment.bathrooms} Bathrooms</span>
                {apartment.max_guests && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {apartment.max_guests} Guests</span>}
                {apartment.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" /> {apartment.rating} ({apartment.review_count} reviews)</span>}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">About This Property</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{apartment.description}</p>
            </div>

            {apartment.amenities?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {apartment.amenities.map((a) => {
                    const Icon = amenityIcons[a] || Check;
                    return (
                      <div key={a} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-foreground mb-1">
                ₦{apartment.price_per_night?.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">/night</span>
              </div>
              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6 rounded-xl h-12 text-base font-semibold bg-primary hover:bg-primary/90">
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Book {apartment.title}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Full Name *</Label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} /></div>
                    <div><Label>Email *</Label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Check-in *</Label><Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
                      <div><Label>Check-out *</Label><Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
                    </div>
                    <div><Label>Guests</Label><Input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: +e.target.value })} /></div>
                    <Button onClick={handleBook} disabled={submitting} className="w-full rounded-xl h-12 font-semibold bg-primary hover:bg-primary/90">
                      {submitting ? "Submitting..." : "Confirm Booking"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-center text-xs text-muted-foreground mt-3">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}