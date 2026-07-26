import React, { useState } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon, Trophy, Save } from "lucide-react";
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

// FIX: `Number(val) || null` treats 0 as falsy and silently turns a legitimate
// "0" (e.g. a free consultation) into null. This checks for empty/missing first.
const toNumberOrNull = (val) => (val === "" || val === null || val === undefined ? null : Number(val));

const LIST_FIELDS = [
  "specializations","treatments_list","overview_points","experience_details",
  "qualifications_list","clinical_focus","additional_info","research_publications",
  "awards_achievements","why_choose_doctor"
];

export default function DoctorForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) return {};
    const f = { ...initialData };
    LIST_FIELDS.forEach((k) => { f[k] = parseList(initialData[k]); });
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setList = (key, val) => set(key, val);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("photo_url", file_url);
      toast({ title: "Photo uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingPhoto(false);
  };

  const handleDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("award_document_url", file_url);
      toast({ title: "Document uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingDoc(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast({ title: "Doctor Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const slug = form.slug || String(form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const speciality = form.speciality || (form.specializations && form.specializations[0]) || "";
    const treatments_offered = (form.treatments_list || []).join(", ");

    const data = {
      ...form,
      slug,
      speciality,
      treatments_offered,
      experience_years: Number(form.experience_years) || 0,
      rating: Number(form.rating) || 0,
      reviews_count: Number(form.reviews_count) || 0,
      consultation_fee_usd: toNumberOrNull(form.consultation_fee_usd),
      featured: !!form.featured,
      status: form.status || "active",
      country: form.country || "India",
      specializations: JSON.stringify(form.specializations || []),
      treatments_list: JSON.stringify(form.treatments_list || []),
      overview_points: JSON.stringify(form.overview_points || []),
      experience_details: JSON.stringify(form.experience_details || []),
      qualifications_list: JSON.stringify(form.qualifications_list || []),
      clinical_focus: JSON.stringify(form.clinical_focus || []),
      additional_info: JSON.stringify(form.additional_info || []),
      research_publications: JSON.stringify(form.research_publications || []),
      awards_achievements: JSON.stringify(form.awards_achievements || []),
      why_choose_doctor: JSON.stringify(form.why_choose_doctor || []),
    };

    try {
      if (isEdit) {
        await db.entities.Doctor.update(initialData.id, data);
        toast({ title: "Doctor updated successfully" });
      } else {
        await db.entities.Doctor.create(data);
        toast({ title: "Doctor created successfully" });
      }
      onSaved();
    } catch (err) {
      toast({ title: "Failed to save doctor", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-muted -m-4 sm:-m-6 lg:-m-8">
      <div className="sticky top-0 z-20 bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3">
        <button type="button" onClick={onCancel} className="flex-shrink-0 w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted">
          <ArrowLeft className="w-4 h-4 text-foreground/80" />
        </button>
        <div>
          <h2 className="font-bold text-foreground text-base sm:text-lg leading-tight">{isEdit ? "Edit Doctor" : "Add New Doctor"}</h2>
          <p className="text-xs text-muted-foreground">{isEdit ? "Update doctor information" : "Fill in the doctor information below"}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Basic Information</h3>
          <div className="space-y-3">
            <Field label="Doctor Name" required>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g., Dr John Smith" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Designation" required>
              <Input value={form.designation || ""} onChange={(e) => set("designation", e.target.value)} placeholder="e.g., Senior Consultant Cardiologist" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Hospital" required>
              <Input value={form.hospital_name || ""} onChange={(e) => set("hospital_name", e.target.value)} placeholder="e.g., Apollo Hospitals, New Delhi" className="h-10 rounded-lg border-border" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience Years" required>
                <Input type="number" value={form.experience_years ?? ""} onChange={(e) => set("experience_years", e.target.value)} placeholder="e.g., 20+" className="h-10 rounded-lg border-border" />
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country">
                <Select value={form.country || "India"} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City">
                <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="e.g., New Delhi" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Consultation Fee (USD)">
                <Input type="number" value={form.consultation_fee_usd ?? ""} onChange={(e) => set("consultation_fee_usd", e.target.value)} placeholder="e.g., 50" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="Languages">
                <Input value={form.languages || ""} onChange={(e) => set("languages", e.target.value)} placeholder="e.g., English, Hindi" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 pt-1">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded border-border" />
              Featured Doctor
            </label>
          </div>
        </div>

        {/* Specializations & Treatments (unnumbered) */}
        <DynamicListField label="Specializations" placeholder="e.g., Heart Surgery" optional values={form.specializations} onChange={(v) => setList("specializations", v)} buttonAtTop darkButton />
        <DynamicListField label="List of Treatments" placeholder="e.g., Knee Replacement Surgery" optional values={form.treatments_list} onChange={(v) => setList("treatments_list", v)} buttonAtTop darkButton />

        {/* Section 1: Overview & Detailed Experience */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-jade/15 text-accent-jade text-xs font-bold">1</span>
            <h3 className="font-bold text-foreground text-sm">Overview & Detailed Experience</h3>
          </div>
          <div className="space-y-4">
            <Field label="Overview" required>
              <Textarea value={form.overview || ""} onChange={(e) => set("overview", e.target.value)} placeholder="Brief overview about the doctor..." className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <DynamicListField label="Overview Points" placeholder="Overview point" optional values={form.overview_points} onChange={(v) => setList("overview_points", v)} buttonAtTop darkButton addLabel="Add Point" />
            <Field label="Detailed Experience" required>
              <Textarea value={form.detailed_experience || ""} onChange={(e) => set("detailed_experience", e.target.value)} placeholder="Detailed experience description..." className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <DynamicListField label="Experience Details" placeholder="Experience detail" optional values={form.experience_details} onChange={(v) => setList("experience_details", v)} buttonAtTop darkButton addLabel="Add Detail" />
          </div>
        </div>

        {/* Sections 2-5 */}
        <DynamicListField label="Qualification" placeholder="e.g., MBBS - AIIMS, New Delhi" number={2} optional values={form.qualifications_list} onChange={(v) => setList("qualifications_list", v)} buttonAtTop darkButton />
        <DynamicListField label="Clinical Focus" placeholder="e.g., Patient-centered care" number={3} optional values={form.clinical_focus} onChange={(v) => setList("clinical_focus", v)} buttonAtTop darkButton />
        <DynamicListField label="Additional Information" placeholder="e.g., Fluent in English, Hindi, and Arabic" number={4} optional values={form.additional_info} onChange={(v) => setList("additional_info", v)} buttonAtTop darkButton />
        <DynamicListField label="Research & Publication" placeholder="e.g., Published in Journal of Medicine" number={5} optional values={form.research_publications} onChange={(v) => setList("research_publications", v)} buttonAtTop darkButton />

        {/* Section 6: Awards (accent card) */}
        <div className="bg-[hsl(var(--accent-warm)/0.08)] rounded-2xl border border-amber-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--accent-warm)/0.35)] text-[hsl(var(--accent-warm))] text-xs font-bold">6</span>
            <Trophy className="w-4 h-4 text-[hsl(var(--accent-warm))]" />
            <h3 className="font-bold text-secondary text-sm">Award & Achievement</h3>
          </div>
          <DynamicListField label="" placeholder="e.g., Best Doctor Award 2023" values={form.awards_achievements} onChange={(v) => setList("awards_achievements", v)} buttonAtTop darkButton accent addLabel="Add" />
          <div className="mt-3">
            <label className="cursor-pointer block">
              <input type="file" onChange={handleDoc} className="hidden" />
              <div className="flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-amber-300 text-[hsl(var(--accent-warm))] text-xs font-medium hover:bg-[hsl(var(--accent-warm)/0.15)] transition-colors">
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingDoc ? "Uploading..." : "Upload certificate/document (optional)"}
              </div>
            </label>
            {form.award_document_url && <p className="text-xs text-[hsl(var(--accent-warm))] mt-1">✓ Document uploaded</p>}
            <p className="text-xs text-[hsl(var(--accent-warm))]/70 mt-2">Add awards, recognitions, certifications, and achievements. Optionally upload supporting documents.</p>
          </div>
        </div>

        {/* Section 7 */}
        <DynamicListField label="Why Choose This Doctor" placeholder="e.g., Internationally trained in robotic surgery" number={7} optional values={form.why_choose_doctor} onChange={(v) => setList("why_choose_doctor", v)} buttonAtTop darkButton />

        {/* Doctor Image */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-1">Doctor Image</h3>
          <p className="text-xs text-muted-foreground mb-3">Upload Doctor Photo</p>
          {form.photo_url ? (
            <div className="relative">
              <img src={form.photo_url} alt="Doctor" className="w-full h-48 rounded-lg object-cover border border-border" />
              <label className="absolute bottom-2 right-2 cursor-pointer">
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 border border-border text-xs font-medium text-foreground/80 hover:bg-white">
                  {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingPhoto ? "Uploading..." : "Change"}
                </div>
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <div className="flex flex-col items-center justify-center gap-1.5 py-10 rounded-lg border-2 border-dashed border-border hover:bg-muted transition-colors">
                {uploadingPhoto ? <Loader2 className="w-8 h-8 text-accent-jade animate-spin" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/50" />}
                <p className="text-sm font-medium text-muted-foreground">{uploadingPhoto ? "Uploading..." : <><span className="text-accent-jade">Click to upload</span> or drag and drop</>}</p>
                <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 10MB</p>
              </div>
            </label>
          )}
        </div>

        {/* Rating */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <Field label="Rating">
            <Input type="number" step="0.1" max="5" value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value)} placeholder="e.g. 4.8" className="h-10 rounded-lg border-border" />
            <p className="text-xs text-muted-foreground/70 mt-1">Between 0 and 5 (e.g. 4.8)</p>
          </Field>
        </div>
      </div>

      {/* Bottom action bar */}
      {/* FIX: DoctorForm previously buried Save/Cancel in an "Actions" card at the very
          end of a long, multi-section form — on HospitalForm and TreatmentForm these are
          a sticky bottom bar always within reach. Matched that pattern here for consistency. */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-accent-jade hover:bg-accent-jade/90 text-white gap-2">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEdit ? "Update Doctor" : "Create Doctor"}</>}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      {label && <label className="text-sm font-medium text-foreground/80 block mb-1.5">{label}{required && <span className="text-destructive"> *</span>}</label>}
      {children}
    </div>
  );
}