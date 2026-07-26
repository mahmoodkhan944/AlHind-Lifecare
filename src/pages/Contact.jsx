import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, Building2 } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useSiteSettings, getWhatsAppLink, parseDepartments } from "@/hooks/useSiteSettings";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1758691461957-474a7686e388?w=1600&q=80";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { data: s } = useSiteSettings();
  const [form, setForm] = useState({
    patient_name: "",
    email: "",
    phone: "",
    country: "",
    treatment_interest: searchParams.get("treatment") || searchParams.get("doctor") || searchParams.get("hospital") || "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.entities.Lead.create({ ...form, source: "website" });
      toast({ title: "Thank you!", description: "We'll get back to you within 24 hours." });
      setForm({ patient_name: "", email: "", phone: "", country: "", treatment_interest: "", message: "" });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      {/* FIX: pt-32 pb-16 was fixed on every screen size; now scales down on mobile. */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-emerald-900/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-bold text-[clamp(1.75rem,6vw,3rem)] text-white mb-3 text-balance"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-base sm:text-lg text-balance"
          >
            Get a free consultation with our medical experts
          </motion.p>
        </div>
      </section>

      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-5 sm:p-7 md:p-8 border shadow-lg shadow-black/5">
                <h2 className="font-heading font-bold text-xl sm:text-2xl mb-2">Get Free Medical Consultation</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
                  Fill out the form and our team will contact you within 24 hours
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                      <Input
                        required
                        value={form.patient_name}
                        onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                        placeholder="Your full name"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Country</label>
                      <Input
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        placeholder="Your country"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Treatment / Doctor Interest</label>
                    <Input
                      value={form.treatment_interest}
                      onChange={(e) => setForm({ ...form, treatment_interest: e.target.value })}
                      placeholder="e.g., Knee Replacement, Cardiology"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message</label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your medical needs..."
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto h-11 px-8 bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                  >
                    {submitting ? "Sending..." : "Send Inquiry"} <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact info sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border flex gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold mb-1 text-sm sm:text-base">Call Us</h4>
                  <p className="text-sm text-muted-foreground">{s?.phone || "+91 987 654 3210"}</p>
                  {s?.emergency_phone && <p className="text-sm text-muted-foreground">{s.emergency_phone}</p>}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border flex gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold mb-1 text-sm sm:text-base">Email Us</h4>
                  <p className="text-sm text-muted-foreground break-all">{s?.email || "info@alhindmedical.com"}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {s?.support_email || "support@alhindmedical.com"}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border flex gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold mb-1 text-sm sm:text-base">Our Address</h4>
                  <p className="text-sm text-muted-foreground">{s?.address || "New Delhi, India"}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border flex gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold mb-1 text-sm sm:text-base">Working Hours</h4>
                  <p className="text-sm text-muted-foreground">{s?.weekday_hours || "Mon - Fri: 8:00 AM - 8:00 PM"}</p>
                  <p className="text-sm text-muted-foreground">{s?.weekend_hours || "Sat - Sun: 9:00 AM - 5:00 PM"}</p>
                </div>
              </div>

              {parseDepartments(s?.departments).length > 0 && (
                <div className="bg-white rounded-2xl p-5 border flex gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold mb-1 text-sm sm:text-base">Departments</h4>
                    {parseDepartments(s?.departments).map((d, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {d}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={getWhatsAppLink(s?.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-500 text-white rounded-2xl p-5 text-center hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <MessageCircle className="w-7 h-7 mx-auto mb-2" />
                <p className="font-heading font-bold text-sm sm:text-base">Chat on WhatsApp</p>
                <p className="text-xs sm:text-sm text-white/80">Get instant response</p>
              </a>
            </div>
          </div>
        </div>

        {s?.google_maps_embed_url && (
          <div className="mt-8 sm:mt-10 max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-heading font-bold text-xl sm:text-2xl mb-4 text-center">Find Us</h2>
            <div className="rounded-2xl overflow-hidden border shadow-lg aspect-video max-w-4xl mx-auto">
              <iframe
                src={s.google_maps_embed_url}
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                title="Location Map"
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}