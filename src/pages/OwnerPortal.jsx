import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, DollarSign, CalendarDays, TrendingUp, Plus, Edit2, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AMENITY_OPTIONS = ["WiFi", "AC", "Pool", "Gym", "Parking", "Generator", "Security", "Kitchen", "Washer", "TV", "Balcony", "Sea View"];

export default function OwnerPortal() {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", location: "Lagos", address: "", price_per_night: 0, bedrooms: 1, bathrooms: 1, max_guests: 2, category: "Short-let", amenities: [], status: "active", featured: false });

  const fetchData = async () => {
    if (!user) return;
    const [apts, bkgs] = await Promise.all([
      base44.entities.Apartment.filter({ created_by: user.email }, "-created_date", 50),
      base44.entities.Booking.list("-created_date", 100),
    ]);
    setApartments(apts);
    setBookings(bkgs.filter(b => apts.some(a => a.id === b.apartment_id)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const revenue = bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_price || 0), 0);
  const monthlyData = [
    { month: "Jan", rev: 120000 }, { month: "Feb", rev: 185000 }, { month: "Mar", rev: 240000 },
    { month: "Apr", rev: 195000 }, { month: "May", rev: revenue || 310000 },
  ];

  const toggleAmenity = (a) => setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error("Fill required fields"); return; }
    if (editItem) { await base44.entities.Apartment.update(editItem.id, form); toast.success("Updated"); }
    else { await base44.entities.Apartment.create(form); toast.success("Apartment listed!"); }
    setAddOpen(false); setEditItem(null);
    setForm({ title: "", description: "", location: "Lagos", address: "", price_per_night: 0, bedrooms: 1, bathrooms: 1, max_guests: 2, category: "Short-let", amenities: [], status: "active", featured: false });
    fetchData();
  };

  const openEdit = (apt) => { setEditItem(apt); setForm({ title: apt.title, description: apt.description, location: apt.location, address: apt.address || "", price_per_night: apt.price_per_night, bedrooms: apt.bedrooms, bathrooms: apt.bathrooms, max_guests: apt.max_guests || 2, category: apt.category || "Short-let", amenities: apt.amenities || [], status: apt.status, featured: apt.featured || false }); setAddOpen(true); };

  const handleDelete = async (id) => { await base44.entities.Apartment.delete(id); fetchData(); toast.success("Listing removed"); };
  const updateBooking = async (id, status) => { await base44.entities.Booking.update(id, { status }); fetchData(); toast.success(`Booking ${status}`); };

  if (!user) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="text-center"><p className="text-xl font-display font-bold mb-4">Sign in to access Owner Portal</p><Link to="/login"><Button className="bg-accent text-white rounded-full px-8">Sign In</Button></Link></div></div>;

  return (
    <div className="pt-16 lg:pt-20 pb-16 min-h-screen bg-muted/20 font-body">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between py-8">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Owner Portal</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Welcome, {user.full_name?.split(" ")[0]}</h1>
          </div>
          <Button onClick={() => { setEditItem(null); setAddOpen(true); }} className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold gap-2 px-6">
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: "My Listings", value: apartments.length, color: "text-foreground" },
            { icon: CalendarDays, label: "Total Bookings", value: bookings.length, color: "text-blue-600" },
            { icon: DollarSign, label: "Total Earnings", value: `₦${revenue.toLocaleString()}`, color: "text-accent" },
            { icon: TrendingUp, label: "Occupancy", value: bookings.filter(b => b.status === "confirmed").length > 0 ? "High" : "—", color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 space-y-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="rounded-full mb-6">
            <TabsTrigger value="listings" className="rounded-full">My Listings</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full">Bookings</TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-full">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-muted animate-pulse h-40" />)}</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {apartments.map(a => (
                  <div key={a.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground text-sm line-clamp-1">{a.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.location} · ₦{a.price_per_night?.toLocaleString()}/night</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/apartments/${a.id}`}><Button size="sm" variant="ghost" className="h-8 text-xs gap-1"><Eye className="w-3.5 h-3.5" /> View</Button></Link>
                      <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => openEdit(a)}><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
                {apartments.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground"><Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-display font-semibold">No listings yet</p><p className="text-xs mt-1">Add your first property to get started</p></div>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead className="bg-muted/50 text-muted-foreground text-xs">
                    <tr><th className="p-4 text-left">Guest</th><th className="p-4 text-left">Property</th><th className="p-4 text-left">Dates</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="p-4"><div className="font-medium text-foreground">{b.guest_name}</div><div className="text-xs text-muted-foreground">{b.guest_email}</div></td>
                        <td className="p-4 text-xs text-muted-foreground">{b.apartment_title}</td>
                        <td className="p-4 text-xs text-muted-foreground">{b.check_in} → {b.check_out}</td>
                        <td className="p-4 font-semibold text-foreground font-display">₦{b.total_price?.toLocaleString()}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{b.status}</span></td>
                        <td className="p-4">
                          {b.status === "pending" && (
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white rounded-full px-3 gap-1" onClick={() => updateBooking(b.id, "confirmed")}><CheckCircle className="w-3 h-3" /> Approve</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 rounded-full px-3 gap-1" onClick={() => updateBooking(b.id, "cancelled")}><XCircle className="w-3 h-3" /> Decline</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-foreground text-lg mb-6">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}><XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" /><YAxis axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} className="text-xs" /><Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, "Revenue"]} /><Bar dataKey="rev" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setEditItem(null); setAddOpen(false); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editItem ? "Edit Property" : "List a Property"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" /></div>
            <div><Label>Description *</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Lagos", "Lekki", "Victoria Island", "Ikoyi", "Abuja", "Maitama", "Port Harcourt", "Ibadan", "Enugu", "Calabar"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Short-let", "Long-term", "Luxury", "Student", "Creative Loft"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price/Night (₦)</Label><Input type="number" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: +e.target.value })} className="rounded-xl" /></div>
              <div><Label>Bedrooms</Label><Input type="number" min={1} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: +e.target.value })} className="rounded-xl" /></div>
              <div><Label>Bathrooms</Label><Input type="number" min={1} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: +e.target.value })} className="rounded-xl" /></div>
            </div>
            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`text-xs px-3 py-1.5 rounded-full border transition ${form.amenities.includes(a) ? "bg-accent text-white border-accent" : "border-border text-muted-foreground hover:border-accent"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl w-36"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                <Label>Featured</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-11 bg-accent hover:bg-accent/90 text-white font-semibold">{editItem ? "Save Changes" : "List Property"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}