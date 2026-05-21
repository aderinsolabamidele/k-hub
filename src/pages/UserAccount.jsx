import { useState, useEffect } from "react";
import { base44 } from "@/api/Base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CalendarDays, Heart, LogOut, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";

export default function UserAccount() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "" });

  const fetchData = async () => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) { setLoading(false); return; }
    const u = await base44.auth.me();
    setUser(u);
    setForm({ full_name: u.full_name || "" });
    const [bkgs, savedList] = await Promise.all([
      base44.entities.Booking.filter({ guest_email: u.email }, "-created_date", 50),
      base44.entities.SavedApartment.filter({ user_email: u.email }),
    ]);
    setBookings(bkgs);
    const apts = await Promise.all(savedList.slice(0, 8).map(s => base44.entities.Apartment.get(s.apartment_id).catch(() => null)));
    setSaved(apts.filter(Boolean));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveProfile = async () => {
    await base44.auth.updateMe({ full_name: form.full_name });
    toast.success("Profile updated");
  };

  const handleLogout = () => base44.auth.logout();

  if (!loading && !user) return <Navigate to="/login" replace />;

  const statusColors = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700" };

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20 font-body">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white font-display font-bold text-xl">{user?.full_name?.[0] || "K"}</div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{user?.full_name}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-muted-foreground gap-2 rounded-full">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="trips">
          <TabsList className="rounded-full mb-8">
            <TabsTrigger value="trips" className="rounded-full gap-2"><CalendarDays className="w-4 h-4" /> Trips</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-full gap-2"><Heart className="w-4 h-4" /> Saved</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-foreground text-sm">{b.apartment_title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{b.check_in} → {b.check_out}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-foreground text-sm">₦{b.total_price?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-semibold ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground text-lg mb-1">No trips yet</h3>
                <Link to="/apartments"><Button className="mt-4 rounded-full bg-accent text-white px-8">Explore Homes</Button></Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {saved.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {saved.map((apt, i) => <PropertyCard key={apt.id} apartment={apt} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display font-bold text-foreground text-lg mb-1">No saved homes</h3>
                <Link to="/apartments"><Button className="mt-4 rounded-full bg-accent text-white px-8">Explore Homes</Button></Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md space-y-5">
              <div><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl mt-1" /></div>
              <div><Label>Email</Label><Input value={user?.email || ""} disabled className="rounded-xl mt-1 opacity-60" /></div>
              <Button onClick={saveProfile} className="rounded-full bg-accent text-white px-8 font-semibold">Save Changes</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}