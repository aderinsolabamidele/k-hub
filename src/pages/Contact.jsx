import { useState } from "react";
import { base44 } from "@/api/Base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ sender_name: "", sender_email: "", subject: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sender_name || !form.sender_email || !form.subject || !form.body) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    await base44.entities.Message.create(form);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ sender_name: "", sender_email: "", subject: "", body: "" });
    setSubmitting(false);
  };

  return (
    <div className="pt-20 lg:pt-24 pb-16 min-h-screen bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Get In Touch</h1>
          <p className="text-muted-foreground mt-2">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@naijastays.com" },
              { icon: Phone, label: "Phone", value: "+234 800 000 0000" },
              { icon: MapPin, label: "Office", value: "Victoria Island, Lagos" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-card border border-border/50 rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.sender_email} onChange={(e) => setForm({ ...form, sender_email: e.target.value })} /></div>
            </div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><Label>Message</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12 font-semibold bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" /> {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}