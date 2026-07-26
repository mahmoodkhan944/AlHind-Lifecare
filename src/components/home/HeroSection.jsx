import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRIES, getDialCode } from "@/lib/countries";
import { useLeadModal } from "@/lib/LeadModalContext";
import { Link } from "react-router-dom";

const BG_VIDEO = "${import.meta.env.BASE_URL}videos/hero-video.mp4";
// Optional poster: shows instantly while the video loads / if it fails on slow mobile connections.
const BG_POSTER = "/src/public/videos/hero-poster.jpg";

const patientPhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

export default function HeroSection() {
  const { toast } = useToast();
  const { openLeadModal } = useLeadModal();
  const [form, setForm] = useState({ patient_name: "", email: "", country: "Select Country", city: "", phone: "", medical_problem: "", age: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.email || !form.phone) return;
    setLoading(true);
    try {
      await db.entities.Lead.create({
        patient_name: form.patient_name,
        email: form.email,
        phone: `${getDialCode(form.country)} ${form.phone}`,
        country: form.country,
        message: `City: ${form.city || "N/A"} | Age/DOB: ${form.age || "N/A"} | Problem: ${form.medical_problem}`,
        source: "website",
        status: "new",
      });
      toast({ title: "Thank you! Our team will contact you shortly." });
      setForm({ patient_name: "", email: "", country: "Select Country", city: "", phone: "", medical_problem: "", age: "" });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center pt-20 sm:pt-24 lg:pt-20 pb-6 sm:pb-8 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-secondary">
        <video
          className="absolute inset-0 w-full h-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={BG_POSTER}
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>

        {/* Dark overlay — stronger + flatter on mobile so text stays readable over busy
            video frames; softens into a directional gradient once there's room on the left. */}
        <div className="absolute inset-0 bg-black/55 sm:bg-black/50 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/45 lg:to-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-center lg:text-left order-1 lg:order-1"
          >

            {/* Heading */}
            <h1 className="font-heading font-extrabold text-[clamp(1.75rem,6vw,3.75rem)] leading-[1.12] mb-3 drop-shadow-lg text-balance">
              Better Health Knows No Borders
            </h1>

            {/* Subtitle */}
            <p className="text-[clamp(0.95rem,2.2vw,1.25rem)] text-white/90 font-medium max-w-xl mx-auto lg:mx-0 mb-5 text-balance">
              Your trusted gateway to world-class healthcare — connecting you with premier doctors and top-accredited hospitals across India and Turkey.
            </p>

            {/* Patient Images */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
              <div className="flex -space-x-3 shrink-0">
                {patientPhotos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    loading="lazy"
                    width={48}
                    height={48}
                    className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full border-2 border-white object-cover shadow-lg shrink-0"
                  />
                ))}
              </div>

              <div className="text-center sm:text-left">
                <p className="font-bold text-sm sm:text-base lg:text-lg leading-tight">
                  1,00,000+ Patients Assisted
                </p>
                <p className="text-white/80 text-xs sm:text-sm leading-tight">
                  Trusted Since 2016
                </p>
              </div>
            </div>

            {/* Google Rating */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-5">
              <GoogleIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
              <span className="font-bold text-lg sm:text-xl">4.7</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-white/70 text-xs sm:text-sm">on Google Reviews</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => openLeadModal({ title: "Get Free Consultation" })}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all w-full sm:w-auto"
              >
                Get Free Consultation
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/70 text-white hover:bg-white hover:text-secondary rounded-xl h-12 w-full sm:w-auto transition-all bg-white/5 backdrop-blur-sm"
              >
                <Link to="/hospitals">Explore Hospitals</Link>
              </Button>
            </div>
          </motion.div>

          {/* Right: form card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-2 relative bg-white/95 backdrop-blur-xl text-foreground rounded-2xl shadow-2xl ring-1 ring-black/5 p-4 sm:p-5 w-full max-w-sm mx-auto"
          >
            {/* Decorative glow behind the card — ties the card's coral accent
                bar into the page's overall graphic language. */}
            <div className="decor-blob decor-blob-primary w-64 h-64 -top-16 -right-16 -z-10" />
            {/* Accent top bar — small signature touch tying the card to the brand's coral CTA color */}
            <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl" />

            <h2 className="font-heading font-bold text-lg sm:text-xl text-secondary text-center mb-0.5 mt-1">
              Let Us Help You
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center mb-3.5">
              Get a free quote from our medical team within 24 hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                placeholder="Enter your full name"
                value={form.patient_name}
                onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                className="h-9 rounded-lg text-sm"
                required
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-9 rounded-lg text-sm"
                required
              />
              <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>
                      <span className="mr-2">{c.flag}</span> {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Select City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-9 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-2.5 h-9 rounded-lg border border-input bg-muted/50 text-xs font-semibold whitespace-nowrap min-w-[56px] shrink-0">
                  {getDialCode(form.country)}
                </div>
                <Input
                  type="tel"
                  placeholder="Your Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 min-w-0 h-9 rounded-lg text-sm"
                  required
                />
              </div>
              <Textarea
                placeholder="Describe the current medical problem.."
                value={form.medical_problem}
                onChange={(e) => setForm({ ...form, medical_problem: e.target.value })}
                className="rounded-lg text-sm min-h-[52px] resize-none"
                rows={2}
              />
              <Input
                placeholder="Enter your age: 30 Yrs or 29-05-1985"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="h-9 rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-primary text-white hover:bg-primary/90 font-heading font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Get FREE Quote <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-muted-foreground text-center leading-snug">
                By submitting the form I agree to the{" "}
                <Link to="/terms" className="text-primary underline underline-offset-2">Terms of Use</Link> and{" "}
                <Link to="/privacy-policy" className="text-primary underline underline-offset-2">Privacy Policy</Link> of Alhind Medical Care.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}