import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await db.entities.Newsletter.create({ email, status: "subscribed" });
      setDone(true);
      toast({ title: "Subscribed successfully!" });
      setEmail("");
    } catch {
      toast({ title: "Failed to subscribe. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <section className="bg-gradient-to-b from-accent-jade/5 to-white py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
            <Mail className="w-6 h-6 text-[hsl(var(--accent-warm))]" />
          </div>

          <span className="text-sm font-semibold text-[hsl(var(--accent-warm))] uppercase tracking-wider">
            Subscribe to Newsletter
          </span>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-secondary mt-3 mb-4 leading-tight">
            Let's Subscribe to Get Our Newsletter.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            At Alhind Medical Care, your health and well-being always come first. Our goal is to provide
            personalized and compassionate healthcare so that every patient receives the care, support,
            and attention they truly deserve.
          </p>

          {done ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-jade/10 text-accent-jade font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
              <div className="flex items-center w-full sm:flex-1 bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-5 py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none w-full"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent-jade hover:bg-accent-jade/90 text-white text-sm font-semibold whitespace-nowrap transition-colors shadow-md shadow-accent-jade/20 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Subscribe Now <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}