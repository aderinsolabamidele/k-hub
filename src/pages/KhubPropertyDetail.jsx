import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Star, Bed, Bath, Users, Wifi, Wind, Car, Shield, Zap, Check, Heart, Share2, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const FALLBACK = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=80",
];

const AMENITY_ICONS = { WiFi: Wifi, AC: Wind, Parking: Car, Security: Shield, Generator: Zap };

export default function KhubPropertyDetail() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", guests: 1 });
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Apartment.get(id),
      base44.entities.Review.filter({ apartment_id: id }, "-created_date"),
    ]).then(([apt, revs]) => { setApartment(apt); setReviews(revs); })
      .catch(() => {}).finally(() => setLoading(false));
    base44.auth.isAuthenticated().then(async (a) => {
      if (a) {
        const me = await base44.auth.me();
        setUser(me);
        setForm(f => ({ ...f, guest_name: me.full_name || "", guest_email: me.email || "" }));
        const saved = await base44.entities.SavedApartment.filter({ apartment_id: id, user_email: me.email });
        setSaved(saved.length > 0);
      }
    });
  }, [id]);

  const images = apartment?.images?.length ? apartment.images : FALLBACK;

  const handleBook = async () => {
    if (!form.guest_name || !form.guest_email || !form.check_in || !form.check_out) { toast.error("Fill in all fields"); return; }
    setSubmitting(true);
    const days = Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000));
    await base44.entities.Booking.create({ ...form, apartment_id: id, apartment_title: apartment.title, total_price: days * apartment.price_per_night });
    toast.success("Booking request sent! We'll confirm shortly.");
    setBookOpen(false);
    setSubmitting(false);
  };

  const handleReview = async () => {
    if (!reviewForm.reviewer_name || !reviewForm.comment) { toast.error("Fill in all fields"); return; }
    await base44.entities.Review.create({ ...reviewForm, apartment_id: id });
    toast.success("Review submitted!");
    setReviewOpen(false);
    setReviews(prev => [reviewForm, ...prev]);
  };

  const toggleSave = async () => {
    if (!user) { toast.error("Sign in to save apartments"); return; }
    if (saved) {
      const existing = await base44.entities.SavedApartment.filter({ apartment_id: id, user_email: user.email });
      if (existing.length) await base44.entities.SavedApartment.delete(existing[0].id);
    } else {
      await base44.entities.SavedApartment.create({ apartment_id: id, user_email: user.email });
    }
    setSaved(!saved);
    toast.success(saved ? "Removed from saved" : "Saved!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  if (!apartment) return <div className="min-h-screen flex items-center justify-center pt-20 text-muted-foreground">Apartment not found.</div>;

  const nights = (form.check_in && form.check_out) ? Math.max(1, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000)) : 1;

  return (
    <div className="pt-20 lg:pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {apartment.category && <span className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-full">{apartment.category}</span>}
              {apartment.verified && <span className="text-xs font-semibold bg-foreground/10 text-foreground px-3 py-1 rounded-full">✓ Verified</span>}
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-foreground tracking-tight">{apartment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{apartment.location}{apartment.address ? `, ${apartment.address}` : ""}</span>
              {apartment.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent text-accent" />{apartment.rating} <span className="text-muted-foreground">({apartment.review_count} reviews)</span></span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" className="rounded-full" onClick={toggleSave}>
              <Heart className={`w-4 h-4 mr-1 ${saved ? "fill-red-500 text-red-500" : ""}`} /> Save
            </Button>
            <a href={`https://wa.me/2348000000000?text=Hi, I'm interested in ${encodeURIComponent(apartment.title)}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="rounded-full"><MessageCircle className="w-4 h-4 mr-1 text-green-600" /> WhatsApp</Button>
            </a>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] mb-10 group">
          <img src={images[imgIndex]} alt="" className="w-full h-full object-cover transition-all duration-700" />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIndex((imgIndex - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setImgIndex((imgIndex + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"><ChevronRight className="w-5 h-5" /></button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => <button key={i} onClick={() => setImgIndex(i)} className={`w-1.5 h-1.5 rounded-full transition ${i === imgIndex ? "bg-white w-4" : "bg-white/50"}`} />)}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[{ icon: Bed, label: "Bedrooms", val: apartment.bedrooms }, { icon: Bath, label: "Bathrooms", val: apartment.bathrooms }, { icon: Users, label: "Max Guests", val: apartment.max_guests || "—" }].map(item => (
                <div key={item.label} className="text-center p-4 rounded-2xl bg-muted">
                  <item.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="font-display font-bold text-foreground text-xl">{item.val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-3">About this space</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{apartment.description}</p>
            </div>

            {/* Amenities */}
            {apartment.amenities?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {apartment.amenities.map((a) => {
                    const Icon = AMENITY_ICONS[a] || Check;
                    return <div key={a} className="flex items-center gap-3 p-3 rounded-xl bg-muted"><Icon className="w-4 h-4 text-accent flex-shrink-0" /><span className="text-sm font-medium">{a}</span></div>;
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-foreground">Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full">Write a review</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Leave a Review</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div><Label>Name</Label><Input value={reviewForm.reviewer_name} onChange={e => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })} /></div>
                      <div><Label>Rating</Label>
                        <div className="flex gap-2 mt-1">{[1,2,3,4,5].map(r => <button key={r} onClick={() => setReviewForm({ ...reviewForm, rating: r })} className={`text-xl ${r <= reviewForm.rating ? "text-accent" : "text-muted"}`}>★</button>)}</div>
                      </div>
                      <div><Label>Comment</Label><Input value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} /></div>
                      <Button onClick={handleReview} className="w-full rounded-xl bg-foreground text-background">Submit Review</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground text-sm">{r.reviewer_name}</span>
                        <div className="flex gap-0.5">{[...Array(5)].map((_, s) => <Star key={s} className={`w-3.5 h-3.5 ${s < r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />)}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 rounded-3xl p-6 shadow-xl">
              <div className="mb-4">
                <span className="font-display font-bold text-3xl text-foreground">₦{apartment.price_per_night?.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm"> / night</span>
              </div>
              {apartment.rating > 0 && (
                <div className="flex items-center gap-1 mb-5 pb-5 border-b border-border">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-semibold text-sm">{apartment.rating}</span>
                  <span className="text-muted-foreground text-sm">· {apartment.review_count} reviews</span>
                </div>
              )}
              <Dialog open={bookOpen} onOpenChange={setBookOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full rounded-xl h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold">Reserve Now</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle className="font-display font-bold">Book {apartment.title}</DialogTitle></DialogHeader>
                  <div className="space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Full Name *</Label><Input value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} /></div>
                      <div><Label className="text-xs">Email *</Label><Input value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} /></div>
                    </div>
                    <div><Label className="text-xs">Phone</Label><Input value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} placeholder="+234..." /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs">Check-in *</Label><Input type="date" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} /></div>
                      <div><Label className="text-xs">Check-out *</Label><Input type="date" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} /></div>
                    </div>
                    <div><Label className="text-xs">Guests</Label><Input type="number" min={1} value={form.guests} onChange={e => setForm({ ...form, guests: +e.target.value })} /></div>
                    {form.check_in && form.check_out && (
                      <div className="p-3 rounded-xl bg-muted text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">₦{apartment.price_per_night?.toLocaleString()} × {nights} nights</span><span className="font-semibold">₦{(apartment.price_per_night * nights).toLocaleString()}</span></div>
                        <div className="flex justify-between font-bold pt-1 border-t border-border"><span>Total</span><span>₦{(apartment.price_per_night * nights).toLocaleString()}</span></div>
                      </div>
                    )}
                    <Button onClick={handleBook} disabled={submitting} className="w-full rounded-xl h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold">
                      {submitting ? "Submitting..." : "Confirm Booking"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">You won't be charged yet</p>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-medium flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Protected by Khub Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}