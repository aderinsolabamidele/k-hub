import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Building2, CalendarDays, MessageSquare, DollarSign, Plus, Send, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [aptDialog, setAptDialog] = useState(false);
  const [aptForm, setAptForm] = useState({ title: "", description: "", location: "Lagos", price_per_night: 0, bedrooms: 1, bathrooms: 1, max_guests: 2, status: "active", featured: false });

  const fetchAll = async () => {
    const [b, m, a] = await Promise.all([
      base44.entities.Booking.list("-created_date", 100),
      base44.entities.Message.list("-created_date", 100),
      base44.entities.Apartment.list("-created_date", 100),
    ]);
    setBookings(b);
    setMessages(m);
    setApartments(a);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const totalRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_price || 0), 0);
  const unreadCount = messages.filter(m => m.status === "unread").length;

  const updateBookingStatus = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    fetchAll();
    toast.success(`Booking ${status}`);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await base44.entities.Message.update(replyDialog.id, { status: "replied", admin_reply: replyText });
    await base44.integrations.Core.SendEmail({ to: replyDialog.sender_email, subject: `Re: ${replyDialog.subject}`, body: replyText });
    setReplyDialog(null);
    setReplyText("");
    fetchAll();
    toast.success("Reply sent!");
  };

  const handleAddApartment = async () => {
    if (!aptForm.title || !aptForm.description) { toast.error("Fill required fields"); return; }
    await base44.entities.Apartment.create(aptForm);
    setAptDialog(false);
    setAptForm({ title: "", description: "", location: "Lagos", price_per_night: 0, bedrooms: 1, bathrooms: 1, max_guests: 2, status: "active", featured: false });
    fetchAll();
    toast.success("Apartment added!");
  };

  const deleteApartment = async (id) => {
    await base44.entities.Apartment.delete(id);
    fetchAll();
    toast.success("Deleted");
  };

  const statusColors = { pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800", completed: "bg-blue-100 text-blue-800" };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name || "Admin"}</p>
          </div>
          <Button onClick={() => setAptDialog(true)} className="rounded-xl bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> Add Apartment</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: "Apartments", value: apartments.length, color: "text-primary" },
            { icon: CalendarDays, label: "Bookings", value: bookings.length, color: "text-blue-600" },
            { icon: DollarSign, label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, color: "text-green-600" },
            { icon: MessageSquare, label: "Unread", value: unreadCount, color: "text-orange-600" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-2xl p-5">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages {unreadCount > 0 && <Badge className="ml-2 bg-destructive text-white text-xs h-5 px-1.5">{unreadCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="apartments">Apartments</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left text-muted-foreground">
                    <th className="p-4 font-medium">Guest</th><th className="p-4 font-medium">Apartment</th><th className="p-4 font-medium">Dates</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/30">
                        <td className="p-4"><div className="font-medium">{b.guest_name}</div><div className="text-xs text-muted-foreground">{b.guest_email}</div></td>
                        <td className="p-4 text-muted-foreground">{b.apartment_title}</td>
                        <td className="p-4 text-muted-foreground text-xs">{b.check_in} → {b.check_out}</td>
                        <td className="p-4 font-semibold">₦{b.total_price?.toLocaleString()}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status] || ""}`}>{b.status}</span></td>
                        <td className="p-4">
                          <Select value={b.status} onValueChange={(val) => updateBookingStatus(b.id, val)}>
                            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["pending","confirmed","cancelled","completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`bg-card border rounded-2xl p-5 ${m.status === "unread" ? "border-primary/30 bg-primary/5" : "border-border/50"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{m.sender_name}</span>
                        <span className="text-xs text-muted-foreground">{m.sender_email}</span>
                        <Badge variant={m.status === "unread" ? "default" : "secondary"} className="text-xs">{m.status}</Badge>
                      </div>
                      <p className="font-medium text-sm text-foreground mb-1">{m.subject}</p>
                      <p className="text-sm text-muted-foreground">{m.body}</p>
                      {m.admin_reply && <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm"><span className="font-medium text-primary">Your reply:</span> {m.admin_reply}</div>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setReplyDialog(m); setReplyText(""); }} className="rounded-xl"><Send className="w-3.5 h-3.5 mr-1" /> Reply</Button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="text-center py-12 text-muted-foreground">No messages yet</div>}
            </div>
          </TabsContent>

          <TabsContent value="apartments">
            <div className="space-y-3">
              {apartments.map(a => (
                <div key={a.id} className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-foreground">{a.title}</div>
                    <div className="text-sm text-muted-foreground">{a.location} · ₦{a.price_per_night?.toLocaleString()}/night · {a.bedrooms} bed · {a.status}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteApartment(a.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              {apartments.length === 0 && <div className="text-center py-12 text-muted-foreground">No apartments yet</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reply to {replyDialog?.sender_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 bg-muted rounded-xl text-sm"><strong>{replyDialog?.subject}</strong><br/>{replyDialog?.body}</div>
            <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
            <Button onClick={handleReply} className="w-full rounded-xl bg-primary hover:bg-primary/90"><Send className="w-4 h-4 mr-2" /> Send Reply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Apartment Dialog */}
      <Dialog open={aptDialog} onOpenChange={setAptDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>Add Apartment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Title *</Label><Input value={aptForm.title} onChange={(e) => setAptForm({...aptForm, title: e.target.value})} /></div>
            <div><Label>Description *</Label><Textarea value={aptForm.description} onChange={(e) => setAptForm({...aptForm, description: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label>
                <Select value={aptForm.location} onValueChange={(v) => setAptForm({...aptForm, location: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Enugu","Calabar","Benin City","Lekki","Victoria Island"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Price/Night (₦)</Label><Input type="number" value={aptForm.price_per_night} onChange={(e) => setAptForm({...aptForm, price_per_night: +e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bedrooms</Label><Input type="number" min={1} value={aptForm.bedrooms} onChange={(e) => setAptForm({...aptForm, bedrooms: +e.target.value})} /></div>
              <div><Label>Bathrooms</Label><Input type="number" min={1} value={aptForm.bathrooms} onChange={(e) => setAptForm({...aptForm, bathrooms: +e.target.value})} /></div>
              <div><Label>Max Guests</Label><Input type="number" min={1} value={aptForm.max_guests} onChange={(e) => setAptForm({...aptForm, max_guests: +e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={aptForm.featured} onChange={(e) => setAptForm({...aptForm, featured: e.target.checked})} className="rounded" />
              <Label>Featured listing</Label>
            </div>
            <Button onClick={handleAddApartment} className="w-full rounded-xl bg-primary hover:bg-primary/90">Add Apartment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}