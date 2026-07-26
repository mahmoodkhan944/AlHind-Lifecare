import React, { useState } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import DynamicListField from "@/components/admin/DynamicListField";

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
};

// FIX: `Number(val) || null` treats 0 as falsy, which would silently null out a
// legitimately-entered 0. Checks for empty/missing first instead.
const toNumberOrNull = (val) => (val === "" || val === null || val === undefined ? null : Number(val));

const HOSPITAL_TYPES = ["Multi-Specialty", "Super-Specialty", "General", "Specialist", "Teaching", "Research"];

export default function HospitalForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) return {};
    const f = { ...initialData };
    ["full_description","specialities","doctors_list","facilities","international_patient_services","accreditations","area_of_expertise","infrastructure_details","awards"].forEach((k) => {
      f[k] = parseList(initialData[k]);
    });
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setList = (key, val) => set(key, val);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("cover_image_url", file_url);
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city) {
      toast({ title: "Hospital Name and City are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const slug = form.slug || String(form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const data = {
      ...form,
      slug,
      beds_count: Number(form.beds_count) || 0,
      established_year: toNumberOrNull(form.established_year),
      rating: Number(form.rating) || 0,
      reviews_count: Number(form.reviews_count) || 0,
      doctors_count: Number(form.doctors_count) || 0,
      emergency_services: !!form.emergency_services,
      parking_available: !!form.parking_available,
      featured: !!form.featured,
      status: form.status || "active",
      country: form.country || "India",
      full_description: JSON.stringify(form.full_description || []),
      specialities: JSON.stringify(form.specialities || []),
      doctors_list: JSON.stringify(form.doctors_list || []),
      facilities: JSON.stringify(form.facilities || []),
      international_patient_services: JSON.stringify(form.international_patient_services || []),
      accreditations: JSON.stringify(form.accreditations || []),
      area_of_expertise: JSON.stringify(form.area_of_expertise || []),
      infrastructure_details: JSON.stringify(form.infrastructure_details || []),
      awards: JSON.stringify(form.awards || []),
    };

    try {
      if (isEdit) {
        await db.entities.Hospital.update(initialData.id, data);
        toast({ title: "Hospital updated successfully" });
      } else {
        await db.entities.Hospital.create(data);
        toast({ title: "Hospital created successfully" });
      }
      onSaved();
    } catch (err) {
      toast({ title: "Failed to save hospital", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-muted -m-4 sm:-m-6 lg:-m-8">
      <div className="sticky top-0 z-20 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 text-foreground/80" />
        </button>
        <div>
          <h2 className="font-bold text-foreground text-base sm:text-lg leading-tight">
            {isEdit ? "Edit Hospital" : "Add New Hospital"}
          </h2>
          <p className="text-xs text-muted-foreground">{isEdit ? "Update hospital details" : "Create a new hospital listing"}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">
        {/* Hospital Information */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Hospital Information</h3>
          <div className="space-y-3">
            {/* Image Upload */}
            <Field label="Hospital Image">
              {form.cover_image_url ? (
                <div className="relative">
                  <img src={form.cover_image_url} alt="Hospital" className="w-full h-40 rounded-lg object-cover border border-border" />
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 border border-border text-xs font-medium text-foreground/80 hover:bg-white">
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? "Uploading..." : "Change"}
                    </div>
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <div className="flex flex-col items-center justify-center gap-1.5 py-8 rounded-lg border-2 border-dashed border-border hover:bg-muted transition-colors">
                    {uploading ? <Loader2 className="w-7 h-7 text-muted-foreground/70 animate-spin" /> : <ImageIcon className="w-7 h-7 text-muted-foreground/50" />}
                    <p className="text-sm font-medium text-muted-foreground">{uploading ? "Uploading..." : "Click to upload or drag and drop"}</p>
                    <p className="text-xs text-muted-foreground/70">PNG, JPG, WEBP (MAX. 10MB)</p>
                  </div>
                </label>
              )}
            </Field>

            <Field label="Hospital Name" required>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Enter hospital name" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Hospital Type">
              <Select value={form.hospital_type || ""} onValueChange={(v) => set("hospital_type", v)}>
                <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue placeholder="Select hospital type" /></SelectTrigger>
                <SelectContent>
                  {HOSPITAL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Full Address" required>
              <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="Enter complete address" className="h-10 rounded-lg border-border" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="Enter city" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="State" required>
                <Input value={form.state || ""} onChange={(e) => set("state", e.target.value)} placeholder="Enter state" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <Field label="Google Maps Embed URL">
              <Input value={form.google_maps_embed_url || ""} onChange={(e) => set("google_maps_embed_url", e.target.value)} placeholder="Paste Google Maps embed URL here" className="h-10 rounded-lg border-border" />
              <p className="text-xs text-muted-foreground/70 mt-1">Get this from Google Maps → Share → Embed a map → Copy the src URL</p>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Number of Beds" required>
                <Input type="number" value={form.beds_count ?? ""} onChange={(e) => set("beds_count", e.target.value)} placeholder="0" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="Year Established" required>
                <Input type="number" value={form.established_year ?? ""} onChange={(e) => set("established_year", e.target.value)} placeholder="2026" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0-5)">
                <Input type="number" step="0.1" max="5" value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value)} placeholder="0" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="Review Count">
                <Input type="number" value={form.reviews_count ?? ""} onChange={(e) => set("reviews_count", e.target.value)} placeholder="0" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <Field label="Short Description" required>
              <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Enter a brief description (1-2 sentences)" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="Hospital Owner / Chairman">
              <Input value={form.hospital_owner || ""} onChange={(e) => set("hospital_owner", e.target.value)} placeholder="e.g., Dr. Prathap C Reddy" className="h-10 rounded-lg border-border" />
            </Field>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Field label="Country">
                <Select value={form.country || "India"} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status || "active"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <input type="checkbox" checked={!!form.emergency_services} onChange={(e) => set("emergency_services", e.target.checked)} className="w-4 h-4 rounded border-border" />
                24/7 Emergency Services
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <input type="checkbox" checked={!!form.parking_available} onChange={(e) => set("parking_available", e.target.checked)} className="w-4 h-4 rounded border-border" />
                Parking Available
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded border-border" />
                Featured Hospital
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic List Sections */}
        <DynamicListField label="Full Description" placeholder="Description paragraph" required values={form.full_description} onChange={(v) => setList("full_description", v)} buttonAtTop />
        <DynamicListField label="Specialities" placeholder="Specialty" required values={form.specialities} onChange={(v) => setList("specialities", v)} buttonAtTop />
        <DynamicListField label="Doctor's List" placeholder="Doctor name" optional values={form.doctors_list} onChange={(v) => setList("doctors_list", v)} buttonAtTop />
        <DynamicListField label="Facilities" placeholder="Facility" required values={form.facilities} onChange={(v) => setList("facilities", v)} buttonAtTop />
        <DynamicListField label="International Patient Services" placeholder="Service" optional values={form.international_patient_services} onChange={(v) => setList("international_patient_services", v)} buttonAtTop />
        <DynamicListField label="Accreditation" placeholder="Accreditation" required values={form.accreditations} onChange={(v) => setList("accreditations", v)} buttonAtTop />
        <DynamicListField label="Area of Expertise" placeholder="Expertise" optional values={form.area_of_expertise} onChange={(v) => setList("area_of_expertise", v)} buttonAtTop />
        <DynamicListField label="Infrastructure Details" placeholder="Infrastructure detail" optional values={form.infrastructure_details} onChange={(v) => setList("infrastructure_details", v)} buttonAtTop />
        <DynamicListField label="Awards" placeholder="Award" optional values={form.awards} onChange={(v) => setList("awards", v)} buttonAtTop />

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Contact Information</h3>
          <div className="space-y-3">
            <Field label="Contact Email">
              <Input value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} placeholder="hospital@example.com" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Contact Phone">
              <Input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+91 98765 43210" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Website">
              <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://hospital.com" className="h-10 rounded-lg border-border" />
            </Field>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">Cancel</Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-accent-jade hover:bg-accent-jade/90 text-white">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? "Update Hospital" : "Create Hospital"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80 block mb-1.5">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {children}
    </div>
  );
}