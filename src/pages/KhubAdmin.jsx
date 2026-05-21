import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, DollarSign, MessageSquare, CheckCircle, XCircle, Send, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export default function KhubAdmin() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDialog, setReplyDialog] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchAll = async () => {
    const [b, m, a] = await Promise.all([
      base44.entities.Booking.list("-created_date", 200),
      base44.entities.Message.list("-created_date", 100),
      base44.entities.Apartment.list("-created_date", 200),
    ]);
    setBookings(b); setMessages(m); setApartments(a);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  if (!user) return null;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const totalRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + (b.total_price || 0), 0);
  const pendingApprovals = apartments.filter(a => a.status === "inactive").length;
  const unread = messages.filter(m => m.status === "unread").length;

  const updateBooking = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    fetchAll();
    toast.success("Booking updated");
  };

  const approveApartment = async (id) => {
    await base44.entities.Apartment.update(id, { status: "active", verified: true });
    fetchAll();
    toast.success("Apartment approved");
  };

  const rejectApartment = async (id) => {
    await base44.entities.Apartment.update(id, { status: "inactive" });
    fetchAll();
    toast.success("Apartment rejected");
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await base44.entities.Message.update(replyDialog.id, { status: "replied", admin_reply: replyText });
    try { await base44.integrations.Core.SendEmail({ to: replyDialog.sender_email, subject: `Re: ${replyDialog.subject}`, body: replyText }); } catch {}
    setReplyDialog(null);
    setReplyText("");
    fetchAll();
    toast.success("Reply sent");
  };

  const statusColors = { pending: "text-yellow-700 bg-yellow-50", confirmed: "text-green-700 bg-green-50", cancelled: "text-red-700 bg-red-50", completed: "text-blue-700 bg-blue-50" };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mb-8">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">Control Centre</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Building2, label: "Apartments", value: apartments.length, color: "text-accent" },
            { icon: CheckCircle, label: "Pending", value: pendingApprovals, color: "text-yellow-600" },
            { icon: TrendingUp, label: "Bookings", value: bookings.length, color: "text-blue-600" },
            { icon: DollarSign, label: "Revenue", value: `₦${(totalRevenue / 1000000).toFixed(1)}M`, color: "text-green-600" },
            { icon: MessageSquare, label: "Unread", value: unread, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border/40 rounded-2xl p-5 shadow-sm">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 bg-muted flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="apartments">Apartments {pendingApprovals > 0 && <span className="ml-1 bg-yellow-500 text-white rounded-full text-[10px] px-1.5">{pendingApprovals}</span>}</TabsTrigger>
            <TabsTrigger value="messages">Messages {unread > 0 && <span className="ml-1 bg-accent text-white rounded-full text-[10px] px-1.5">{unread}</span>}</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="bg-white border border-border/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>{["Guest", "Apartment", "Dates", "Amount", "Status", "Action"].map(h => <th key={h} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="p-4"><p className="font-medium">{b.guest_name}</p><p className="text-xs text-muted-foreground">{b.guest_email}</p></td>
                        <td className="p-4 text-xs text-muted-foreground max-w-[120px] truncate">{b.apartment_title}</td>
                        <td className="p-4 text-xs text-muted-foreground">{b.check_in}<br />{b.check_out}</td>
                        <td className="p-4 font-bold">₦{b.total_price?.toLocaleString()}</td>
                        <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] || ""}`}>{b.status}</span></td>
                        <td className="p-4">
                          <Select value={b.status} onValueChange={v => updateBooking(b.id, v)}>
                            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{["pending","confirmed","cancelled","completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apartments">
            <div className="space-y-3">
              {apartments.map(a => (
                <div key={a.id} className="bg-white border border-border/40 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "active" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{a.verified ? "Verified" : a.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.location} · ₦{a.price_per_night?.toLocaleString()}/night · {a.category} · by {a.created_by}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => approveApartment(a.id)} className="text-green-600 hover:bg-green-50 rounded-full text-xs"><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => rejectApartment(a.id)} className="text-red-600 hover:bg-red-50 rounded-full text-xs"><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                  </div>
                </div>
              ))}
              {apartments.length === 0 && <div className="text-center py-12 text-muted-foreground">No apartments yet</div>}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`bg-white border rounded-2xl p-5 ${m.status === "unread" ? "border-accent/40" : "border-border/40"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{m.sender_name}</span>
                        <span className="text-xs text-muted-foreground">{m.sender_email}</span>
                        {m.status === "unread" && <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{m.subject}</p>
                      <p className="text-sm text-muted-foreground">{m.body}</p>
                      {m.admin_reply && <div className="mt-2 p-3 bg-muted rounded-xl text-xs"><span className="font-semibold">Reply sent:</span> {m.admin_reply}</div>}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full flex-shrink-0" onClick={() => { setReplyDialog(m); setReplyText(""); }}>
                      <Send className="w-3.5 h-3.5 mr-1" /> Reply
                    </Button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="text-center py-12 text-muted-foreground">No messages yet</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display font-bold">Reply to {replyDialog?.sender_name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 bg-muted rounded-xl text-sm"><strong>{replyDialog?.subject}:</strong> {replyDialog?.body}</div>
            <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Your reply..." />
            <Button onClick={handleReply} className="w-full rounded-xl bg-foreground text-background"><Send className="w-4 h-4 mr-2" /> Send Reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}