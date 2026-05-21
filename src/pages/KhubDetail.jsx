import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/Base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Bed, Bath, Users, Wifi, Wind, Car, Shield, Zap, Check, Share2, Heart, MessageCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const IMGS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
];
const AMENITY_ICONS = { WiFi: Wifi, AC: Wind, Parking: Car, Security: Shield, Generator: Zap };

export default function KhubDetail() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", guests: 1 });

  useEffect(() => {
    base44.entities.Apartment.get(id).then(setApartment).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const nights = form.check_in && form.check_out ? Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000)) : 1;

  const handleBook = async () => {
    if (!form.guest_name || !form.guest_email || !form.check_in || !form.check_out) { toast.error("Fill in all required fields"); return; }
    setSubmitting(true);
    await base44.entities.Booking.create({ ...form, apartment_id: id, apartment_title: apartment.title, total_price: nights * apartment.price_per_night });
    toast.success("Booking requested! We'll confirm shortly.");
    setBookOpen(false);
    setSubmitting(false);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi, I'm interested in "${apartment?.title}" on Khub. Can we discuss?`);
    window.open(`https://wa.me/2348000000000?text=${msg}`, "_blank");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" /></div>;
  if (!apartment) return <div className="min-h-screen flex items-center justify-center pt-20 text-muted-foreground font-body">Property not found.</div>;

  const images = apartment.images?.length ? apartment.images : IMGS;

  return (
    <div className="pt-16 lg:pt-20 bg-background font-body">
      {/* Image gallery */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 lg:h-[60vh] max-h-[500px]">
          <div className="lg:col-span-2 overflow-hidden cursor-pointer" onClick={() => setImgIdx((imgIdx + 1) % images.length)}>
            <img src={images[imgIdx]} alt={apartment.title} className="w-full h-64 lg:h-full object-cover hover:scale-[1.02] transition-transform duration-700" />
          </div>
          <div className="hidden lg:grid grid-rows-2 gap-1">
            {images.slice(1, 3).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => setImgIdx(i + 1)}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
        <Link to="/apartments" className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {apartment.category && <Badge variant="outline" className="text-xs border-accent text-accent">{apartment.category}</Badge>}
                {apartment.verified && <Badge className="text-xs bg-foreground text-background">✓ Verified</Badge>}
              </div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight mb-3">{apartment.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" />{apartment.location}{apartment.address ? `, ${apartment.address}` : ""}</span>
                {apartment.rating > 0 && <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-accent text-accent" />{apartment.rating} <span className="text-muted-foreground">({apartment.review_count} reviews)</span></span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 py-6 border-y border-border text-sm">
              <span className="flex items-center gap-2"><Bed className="w-5 h-5 text-accent" /><span className="font-semibold text-foreground">{apartment.bedrooms}</span> Bedrooms</span>
              <span className="flex items-center gap-2"><Bath className="w-5 h-5 text-accent" /><span className="font-semibold text-foreground">{apartment.bathrooms}</span> Bathrooms</span>
              {apartment.max_guests && <span className="flex items-center gap-2"><Users className="w-5 h-5 text-accent" /><span className="font-semibold text-foreground">{apartment.max_guests}</span> Guests max</span>}
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">About this property</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{apartment.description}</p>
            </div>

            {apartment.amenities?.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {apartment.amenities.map((a) => {
                    const Icon = AMENITY_ICONS[a] || Check;
                    return <div key={a} className="flex items-center gap-3 p-3 rounded-xl border border-border text-sm"><Icon className="w-4 h-4 text-accent flex-shrink-0" />{a}</div>;
                  })}
                </div>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-muted/50 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-display font-bold text-lg">H</div>
                <div><p className="font-display font-semibold text-foreground text-sm">Hosted by Khub</p><p className="text-xs text-muted-foreground">Member since 2024 · Verified Host</p></div>
              </div>
              <Button onClick={handleWhatsApp} variant="outline" className="w-full rounded-xl gap-2 text-sm border-green-500 text-green-700 hover:bg-green-50">
                <MessageCircle className="w-4 h-4" /> WhatsApp Host
              </Button>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="mb-5">
                <span className="text-3xl font-display font-bold text-foreground">₦{apartment.price_per_night?.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground font-body"> / night</span>
              </div>
              <div className="space-y-3 mb-5 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs text-muted-foreground">Check-in</Label><Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} className="mt-1 rounded-xl" /></div>
                  <div><Label className="text-xs text-muted-foreground">Check-out</Label><Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} className="mt-1 rounded-xl" /></div>
                </div>
                {form.check_in && form.check_out && (
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">₦{apartment.price_per_night?.toLocaleString()} × {nights} nights</span>
                    <span className="font-bold text-foreground">₦{(apartment.price_per_night * nights).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Dialog open={bookOpen} onOpenChange={setBookOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full rounded-xl h-12 bg-accent hover:bg-accent/90 text-white font-semibold font-body">Reserve Now</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle className="font-display">Complete Booking</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div><Label>Full Name *</Label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} className="rounded-xl" /></div>
                    <div><Label>Email *</Label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} className="rounded-xl" /></div>
                    <div><Label>Phone (WhatsApp)</Label><Input value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} placeholder="+234..." className="rounded-xl" /></div>
                    <div><Label>Guests</Label><Input type="number" min={1} max={apartment.max_guests || 10} value={form.guests} onChange={(e) => setForm({ ...form, guests: +e.target.value })} className="rounded-xl" /></div>
                    <div className="bg-muted rounded-xl p-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{nights} nights</span><span className="font-bold">₦{(apartment.price_per_night * nights).toLocaleString()}</span></div></div>
                    <Button onClick={handleBook} disabled={submitting} className="w-full rounded-xl h-12 bg-accent hover:bg-accent/90 text-white font-semibold">{submitting ? "Confirming..." : "Confirm Booking"}</Button>
                    <p className="text-center text-xs text-muted-foreground">Payment via Paystack on confirmation</p>
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-center text-xs text-muted-foreground mt-3">No charge until host confirms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}