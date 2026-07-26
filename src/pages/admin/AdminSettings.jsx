import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useInvalidateSettings, DEFAULT_SETTINGS, parseDepartments } from "@/hooks/useSiteSettings";
import {
  Globe, Phone, Share2, PhoneCall, Clock, Building2, MapPin,
  Save, RotateCcw, Plus, Trash2, Key, Loader2, ExternalLink, Info
} from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const invalidateSettings = useInvalidateSettings();
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    db.entities.SiteSettings.list('-created_date', 1)
      .then((items) => {
        if (items.length > 0) {
          setForm({ ...DEFAULT_SETTINGS, ...items[0] });
          setRecordId(items[0].id);
          setLastUpdated(items[0].updated_date || items[0].created_date);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (recordId) {
        await db.entities.SiteSettings.update(recordId, form);
      } else {
        const created = await db.entities.SiteSettings.create(form);
        setRecordId(created.id);
      }
      invalidateSettings();
      toast({ title: "Settings saved successfully!" });
      setLastUpdated(new Date().toISOString());
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    toast({ title: "Reset to defaults. Click Save to persist." });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your website settings and configurations</p>
      </div>

      <SettingsCard icon={Globe} title="General Settings">
        <Field label="Site Name">
          <Input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} className="h-10" />
        </Field>
      </SettingsCard>

      <SettingsCard icon={Phone} title="Contact Information">
        <Field label="Email Address">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-10" />
        </Field>
        <Field label="Phone Number">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-10" />
        </Field>
        <Field label="WhatsApp Number" hint="This number will be used for the WhatsApp floating button">
          <Input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} className="h-10" />
        </Field>
        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={3} className="text-sm" />
        </Field>
      </SettingsCard>

      <SettingsCard icon={Share2} title="Social Media Links">
        <Field label="Facebook URL"><Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} className="h-10" placeholder="https://facebook.com/..." /></Field>
        <Field label="Twitter/X URL"><Input value={form.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} className="h-10" placeholder="https://twitter.com/..." /></Field>
        <Field label="Instagram URL"><Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} className="h-10" placeholder="https://instagram.com/..." /></Field>
        <Field label="LinkedIn URL"><Input value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} className="h-10" placeholder="https://linkedin.com/..." /></Field>
        <Field label="YouTube URL"><Input value={form.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} className="h-10" placeholder="https://youtube.com/..." /></Field>
      </SettingsCard>

      <SettingsCard icon={PhoneCall} title="Contact Page Configuration">
        <Field label="Emergency Phone" hint="24/7 emergency hotline">
          <Input value={form.emergency_phone} onChange={(e) => set("emergency_phone", e.target.value)} className="h-10" />
        </Field>
        <Field label="Support Email">
          <Input type="email" value={form.support_email} onChange={(e) => set("support_email", e.target.value)} className="h-10" />
        </Field>
        <Field label="Postal Code / PIN Code">
          <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} className="h-10" />
        </Field>
      </SettingsCard>

      <SettingsCard icon={Clock} title="Working Hours">
        <Field label="Weekday Hours">
          <Input value={form.weekday_hours} onChange={(e) => set("weekday_hours", e.target.value)} className="h-10" placeholder="Mon - Fri: 8:00 AM - 8:00 PM" />
        </Field>
        <Field label="Weekend Hours">
          <Input value={form.weekend_hours} onChange={(e) => set("weekend_hours", e.target.value)} className="h-10" placeholder="Sat - Sun: 9:00 AM - 5:00 PM" />
        </Field>
      </SettingsCard>

      <DepartmentsManager value={form.departments} onChange={(v) => set("departments", v)} />

      <SettingsCard icon={MapPin} title="Map Configuration">
        <Field label="Google Maps Embed URL" hint="Get this from Google Maps → Share → Embed a map → Copy the src URL">
          <Textarea value={form.google_maps_embed_url} onChange={(e) => set("google_maps_embed_url", e.target.value)} rows={3} className="text-sm" placeholder="https://www.google.com/maps/embed?..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude (optional)"><Input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} className="h-10" /></Field>
          <Field label="Longitude (optional)"><Input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} className="h-10" /></Field>
        </div>
        {form.google_maps_embed_url && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Preview</p>
            <div className="rounded-lg overflow-hidden border border-border aspect-video">
              <iframe src={form.google_maps_embed_url} className="w-full h-full" style={{ border: 0 }} loading="lazy" title="Map Preview" />
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleSave} disabled={saving} className="h-11 bg-accent-jade hover:bg-accent-jade text-white font-semibold gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </Button>
        <Button onClick={handleReset} variant="outline" className="h-11 gap-2">
          <RotateCcw className="w-4 h-4" /> Reset to Default
        </Button>
      </div>

      {/* Information */}
      <SettingsCard icon={Info} title="Information">
        <InfoRow label="Last Updated" value={lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not saved yet"} />
        <InfoRow label="Version" value="1.0.0" />
        <InfoRow label="Environment" value="Production" />
      </SettingsCard>

      {/* Quick Links */}
      <SettingsCard icon={ExternalLink} title="Quick Links">
        <div className="flex flex-col gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-accent-jade hover:underline">View Website →</a>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-sm text-accent-jade hover:underline">Supabase Dashboard →</a>
          <a href="/contact" className="text-sm text-accent-jade hover:underline">Support Center →</a>
        </div>
      </SettingsCard>

      <ChangeCredentials />
    </div>
  );
}

function SettingsCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-foreground/80" />
        <h2 className="font-heading font-bold text-base text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function DepartmentsManager({ value, onChange }) {
  const [items, setItems] = useState(parseDepartments(value));

  useEffect(() => {
    setItems(parseDepartments(value));
  }, [value]);

  const update = (newItems) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems));
  };

  return (
    <SettingsCard icon={Building2} title="Departments">
      <div className="flex justify-end -mt-2 mb-2">
        <Button onClick={() => update([...items, ""])} variant="outline" size="sm" className="gap-1 text-accent-jade border-accent-jade">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground/70 py-6">No departments added yet. Click "Add" to create a department.</p>
      ) : (
        <div className="space-y-2">
          {items.map((dept, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={dept}
                onChange={(e) => update(items.map((d, idx) => (idx === i ? e.target.value : d)))}
                className="h-10"
                placeholder="Department name"
              />
              <Button onClick={() => update(items.filter((_, idx) => idx !== i))} variant="ghost" size="icon" className="flex-shrink-0">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}

function ChangeCredentials() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({ title: "Please enter your current password", variant: "destructive" });
      return;
    }
    if (!newEmail && !newPassword) {
      toast({ title: "Enter a new email or new password to update", variant: "destructive" });
      return;
    }
    if (newPassword && newPassword.length < 8) {
      toast({ title: "New password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect");

      await db.auth.updateMe({
        ...(newEmail && { email: newEmail }),
        ...(newPassword && { password: newPassword }),
      });
      toast({ title: "Credentials updated. Email changes may require verifying the new address." });
      setCurrentPassword(""); setNewEmail(""); setNewPassword("");
    } catch (err) {
      toast({ title: err.message || "Failed to update credentials. Please contact support.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <SettingsCard icon={Key} title="Change Login Credentials">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Current Password *">
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-10" placeholder="Enter current password" />
        </Field>
        <Field label="New Email (leave blank to keep current)">
          <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-10" placeholder="new@example.com" />
        </Field>
        <Field label="New Password (leave blank to keep current)">
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10" placeholder="Min 8 characters" minLength={8} />
        </Field>
        <Button type="submit" disabled={loading} className="w-full h-11 bg-accent-jade/70 hover:bg-accent-jade text-white font-semibold gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          Update Credentials
        </Button>
        <p className="text-xs text-muted-foreground/70 text-center">You must enter your current password to make any changes.</p>
      </form>
    </SettingsCard>
  );
}