import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { COUNTRIES, getDialCode } from "@/lib/countries";
import { useLeadModal } from "@/lib/LeadModalContext";

const emptyForm = { patient_name: "", email: "", country: "Select Country", phone: "", message: "" };

export default function LeadModal() {
  const { open, context, closeLeadModal } = useLeadModal();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const title = context?.title || "Get Free Consultation";
  const description = context?.description || "Fill in your details and our medical team will get back to you within 24 hours.";
  const treatmentInterest = context?.treatmentInterest || "";

  // Reset the form each time the modal is (re)opened for a new context
  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setDone(false);
    }
  }, [open, context]);

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
        treatment_interest: treatmentInterest || undefined,
        message: form.message,
        source: "website",
        status: "new",
      });
      setDone(true);
      setForm(emptyForm);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeLeadModal()}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-bold text-xl mb-2">Thank you!</h2>
            <p className="text-sm text-muted-foreground">Our team will contact you shortly to help with your request.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <Input
                placeholder="Enter your full name"
                value={form.patient_name}
                onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                className="h-11 rounded-lg text-sm"
                required
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 rounded-lg text-sm"
                required
              />
              <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                <SelectTrigger className="h-11 rounded-lg text-sm">
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
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 h-11 rounded-lg border border-input bg-muted/50 text-sm font-semibold whitespace-nowrap min-w-[60px]">
                  {getDialCode(form.country)}
                </div>
                <Input
                  type="tel"
                  placeholder="Your Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="flex-1 h-11 rounded-lg text-sm"
                  required
                />
              </div>
              {treatmentInterest && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  Regarding: <span className="font-semibold text-foreground">{treatmentInterest}</span>
                </div>
              )}
              <Textarea
                placeholder="Tell us about your medical needs..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-lg text-sm min-h-[70px]"
                rows={3}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-heading font-bold text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-y-0"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By submitting this form you agree to our Terms of Use and Privacy Policy.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}