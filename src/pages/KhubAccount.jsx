import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Heart, CalendarDays, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function KhubAccount() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      if (!a) { navigate("/login"); return; }
      const me = await base44.auth.me();
      setUser(me);
      setForm({ full_name: me.full_name || "", email: me.email || "" });
      const bkgs = await base44.entities.Booking.filter({ guest_email: me.email }, "-created_date");
      setBookings(bkgs);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const statusColors = { pending: "text-yellow-700 bg-yellow-50", confirmed: "text-green-700 bg-green-50", cancelled: "text-red-700 bg-red-50", completed: "text-blue-700 bg-blue-50" };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center text-background text-xl font-display font-bold">
              {user?.full_name?.[0] || "K"}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">{user?.full_name}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground rounded-full">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="bg-muted mb-6">
            <TabsTrigger value="bookings"><CalendarDays className="w-4 h-4 mr-1.5" />My Trips</TabsTrigger>
            <TabsTrigger value="saved"><Heart className="w-4 h-4 mr-1.5" />Saved</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1.5" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-white border border-border/40 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.apartment_title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{b.check_in} → {b.check_out}</p>
                      <p className="text-sm font-bold text-foreground mt-1">₦{b.total_price?.toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${statusColors[b.status] || ""}`}>{b.status}</span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-border/40">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No trips yet</p>
                  <p className="text-sm text-muted-foreground mb-5">Your bookings will appear here</p>
                  <Link to="/apartments"><Button className="rounded-full bg-foreground text-background">Explore Apartments</Button></Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="bg-white rounded-2xl border border-border/40 p-8 text-center">
              <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold mb-2">Your saved homes</p>
              <Link to="/saved"><Button className="rounded-full bg-foreground text-background mt-2">View Saved Homes</Button></Link>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white border border-border/40 rounded-2xl p-6 space-y-5">
              <h3 className="font-display font-bold text-lg">Profile Settings</h3>
              <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} disabled className="opacity-60 cursor-not-allowed" /></div>
              <Button onClick={() => toast.success("Profile updated!")} className="rounded-xl bg-foreground text-background">Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}