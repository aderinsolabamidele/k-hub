import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, DollarSign, CalendarDays, TrendingUp, Plus, Trash2, Edit, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Calabar", "Benin City", "Lekki", "Victoria Island"];
const CATEGORIES = ["Short-let", "Long-term", "Luxury", "Student", "Lofts"];
const AMENITY_OPTIONS = ["WiFi", "AC", "Pool", "Gym", "Parking", "Generator", "Security", "Kitchen", "Washer", "TV", "Balcony", "Sea View"];

export default function KhubOwnerPortal() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [form, setForm] = useState({ title: "", description: "", location: "Lagos", address: "", price_per_night: "", bedrooms: 1, bathrooms: 1, max_guests: 2, category: "Short-let", amenities: [], status: "active", featured: false, verified: false });

  const fetchData = async () => {
    if (!user) return;
    const [apts, bkgs, msgs] = await Promise.all([
      base44.entities.Apartment.filter({ created_by: user.email }, "-created_date"),
      base44.entities.Booking.list("-created_date", 100),
      base44.entities.Message.list("-created_date", 50),
    ]);
    setListings(apts);
    setBookings(bkgs.filter(b => apts.some(a => a.id === b.apartment_id)));
    setMessages(msgs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const totalRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_price || 0), 0);

  const handleAdd = async () => {
    if (!form.title || !form.description || !form.price_per_night) { toast.error("Fill required fields"); return; }
    await base44.entities.Apartment.create({ ...form, price_per_night: +form.price_per_night, rating: 0, review_count: 0 });
    toast.success("Listing added!");
    setAddOpen(false);
    setForm({ title: "", description: "", location: "Lagos", address: "", price_per_night: "", bedrooms: 1, bathrooms: 1, max_guests: 2, category: "Short-let", amenities: [], status: "active", featured: false, verified: false });
    fetchData();
  };

  const toggleStatus = async (apt) => {
    const newStatus = apt.status === "active" ? "inactive" : "active";
    await base44.entities.Apartment.update(apt.id, { status: newStatus });
    toast.success(`Listing ${newStatus}`);
    fetchData();
  };

  const deleteListing = async (id) => {
    await base44.entities.Apartment.delete(id);
    toast.success("Listing deleted");
    fetchData();
  };

  const updateBooking = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    toast.success(`Booking ${status}`);
    fetchData();
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    await base44.entities.Message.update(replyOpen.id, { status: "replied", admin_reply: replyText });
    toast.success("Reply sent!");
    setReplyOpen(null);
    setReplyText("");
    fetchData();
  };

  const toggleAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const statusColors = { pending: "text-yellow-700 bg-yellow-50", confirmed: "text-green-700 bg-green-50", cancelled: "text-red-700 bg-red-50", completed: "text-blue-700 bg-blue-50" };

  if (!user) return <div className="min-h-screen flex items-center justify-center pt-20"><p className="text-muted-foreground">Please sign in to access the Owner Portal.</p></div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Owner Portal</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Welcome, {user.full_name?.split(" ")[0]}</h1>
          </div>
          <Button onClick={() => setAddOpen(true)} className="rounded-full bg-foreground hover:bg-foreground/90 text-background">
            <Plus className="w-4 h-4 mr-2" /> Add Listing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: "Listings", value: listings.length, color: "text-accent" },
            { icon: CalendarDays, label: "Bookings", value: bookings.length, color: "text-blue-600" },
            { icon: DollarSign, label: "Revenue", value: `₦${(totalRevenue/1000).toFixed(0)}k`, color: "text-green-600" },
            { icon: TrendingUp, label: "Active", value: listings.filter(l => l.status === "active").length, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border/40 rounded-2xl p-5 shadow-sm">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-border/40">
                <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg mb-2">No listings yet</h3>
                <p className="text-muted-foreground text-sm mb-5">Add your first apartment to start earning</p>
                <Button onClick={() => setAddOpen(true)} className="rounded-full bg-foreground text-background"><Plus className="w-4 h-4 mr-2" /> Add Listing</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map(apt => (
                  <div key={apt.id} className="bg-white border border-border/40 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-sm truncate">{apt.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt.status === "active" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{apt.location} · ₦{apt.price_per_night?.toLocaleString()}/night · {apt.bedrooms} bed · {apt.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(apt)} className="text-xs rounded-full">{apt.status === "active" ? "Deactivate" : "Activate"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteListing(apt.id)} className="text-destructive hover:bg-destructive/10 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <div className="bg-white border border-border/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    {["Guest", "Apartment", "Dates", "Amount", "Status", "Action"].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="p-4"><p className="font-medium">{b.guest_name}</p><p className="text-xs text-muted-foreground">{b.guest_email}</p></td>
                        <td className="p-4 text-xs text-muted-foreground max-w-[120px] truncate">{b.apartment_title}</td>
                        <td className="p-4 text-xs text-muted-foreground">{b.check_in}<br/>{b.check_out}</td>
                        <td className="p-4 font-bold text-sm">₦{b.total_price?.toLocaleString()}</td>
                        <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] || ""}`}>{b.status}</span></td>
                        <td className="p-4">
                          {b.status === "pending" && (
                            <div className="flex gap-1">
                              <button onClick={() => updateBooking(b.id, "confirmed")} className="p-1 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => updateBooking(b.id, "cancelled")} className="p-1 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground text-sm">No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`bg-white border rounded-2xl p-5 ${m.status === "unread" ? "border-accent/30" : "border-border/40"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{m.sender_name}</span>
                        <span className="text-xs text-muted-foreground">{m.sender_email}</span>
                        {m.status === "unread" && <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{m.subject}</p>
                      <p className="text-sm text-muted-foreground">{m.body}</p>
                      {m.admin_reply && <div className="mt-2 p-3 bg-muted rounded-xl text-xs"><span className="font-semibold">Your reply: </span>{m.admin_reply}</div>}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full flex-shrink-0" onClick={() => { setReplyOpen(m); setReplyText(""); }}>
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Reply
                    </Button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="text-center py-12 text-muted-foreground">No messages yet</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Listing Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display font-bold text-xl">Add New Listing</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Modern 2-bed in Lekki Phase 1" /></div>
            <div><Label>Description *</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label>
                <Select value={form.location} onValueChange={v => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price/Night (₦) *</Label><Input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} /></div>
              <div><Label>Bedrooms</Label><Input type="number" min={1} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} /></div>
              <div><Label>Bathrooms</Label><Input type="number" min={1} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} /></div>
            </div>
            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${form.amenities.includes(a) ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded" /> Featured listing</label>
            </div>
            <Button onClick={handleAdd} className="w-full rounded-xl h-12 bg-foreground hover:bg-foreground/90 text-background font-semibold">Publish Listing</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={!!replyOpen} onOpenChange={() => setReplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reply to {replyOpen?.sender_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 bg-muted rounded-xl text-sm"><strong>{replyOpen?.subject}:</strong> {replyOpen?.body}</div>
            <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Your reply..." />
            <Button onClick={sendReply} className="w-full rounded-xl bg-foreground text-background">Send Reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}