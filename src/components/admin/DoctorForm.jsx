import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon, Trophy, Save, EyeOff } from "lucide-react";
import { slugify } from "@/lib/paths";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import GroupedListField from "@/components/admin/GroupedListField";
import PatientJourneyField from "@/components/admin/PatientJourneyField";
import { applyJourneyToPayload, isMissingJourneyColumn, JOURNEY_MIGRATION_HINT } from "@/lib/patientJourney";
import ParagraphListField from "@/components/admin/ParagraphListField";
import { buildGroupsMap, applyGroupsToPayload } from "@/lib/sectionGroups";

// Sections that support several sub-headings (Admin → drag to reorder).
const DOCTOR_GROUP_KEYS = ["specializations", "treatments_list", "overview_points", "experience_details", "qualifications_list", "clinical_focus", "additional_info", "research_publications", "awards_achievements", "why_choose_doctor"];
import AutocompleteInput from "@/components/admin/AutocompleteInput";
import SectionOrderEditor from "@/components/admin/SectionOrderEditor";
import { DEFAULT_DOCTOR_SECTIONS, renameOldDoctorTitles } from "@/pages/DoctorDetail";
import ShowOnHomeToggle from "@/components/admin/ShowOnHomeToggle";

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
};

const parseObj = (val) => {
  if (!val) return {};
  if (typeof val === "object" && !Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return p && typeof p === "object" && !Array.isArray(p) ? p : {}; } catch { return {}; }
};

// FIX: `Number(val) || null` treats 0 as falsy and silently turns a legitimate
// "0" (e.g. a free consultation) into null. This checks for empty/missing first.
const toNumberOrNull = (val) => (val === "" || val === null || val === undefined ? null : Number(val));

const LIST_FIELDS = [
  "specializations","treatments_list","overview_points","experience_details",
  "qualifications_list","clinical_focus","additional_info","research_publications",
  "awards_achievements","why_choose_doctor","section_config"
];

export default function DoctorForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) return { section_groups: buildGroupsMap(null, DOCTOR_GROUP_KEYS) };
    const f = { ...initialData };
    LIST_FIELDS.forEach((k) => { f[k] = parseList(initialData[k]); });
    f.section_config = renameOldDoctorTitles(f.section_config);
    f.section_subheadings = parseObj(initialData.section_subheadings);
    f.section_groups = buildGroupsMap(initialData, DOCTOR_GROUP_KEYS);
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [hospitalNames, setHospitalNames] = useState([]);

  useEffect(() => {
    db.entities.Hospital.list("name", 2000)
      .then((hospitals) => setHospitalNames(hospitals.map((h) => h.name).filter(Boolean)))
      .catch(() => {});
  }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setGroups = (key, groups) =>
    setForm((p) => ({ ...p, section_groups: { ...(p.section_groups || {}), [key]: groups } }));
  const setList = (key, val) => set(key, val);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const oldUrl = form.photo_url;
    setUploadingPhoto(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("photo_url", file_url);
      if (oldUrl && oldUrl !== file_url) db.integrations.Core.DeleteFile(oldUrl);
      toast({ title: "Photo uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingPhoto(false);
  };

  const handleDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const oldUrl = form.award_document_url;
    setUploadingDoc(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("award_document_url", file_url);
      if (oldUrl && oldUrl !== file_url) db.integrations.Core.DeleteFile(oldUrl);
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

    // SEO URL slug (e.g. dr-vikram-dua-neurosurgeon-faridabad); from the name if empty.
    const slug = slugify(form.slug) || slugify(form.name);

    // Two doctors can't share a URL.
    try {
      const sameSlug = await db.entities.Doctor.filter({ slug }, "-created_date", 5);
      if (sameSlug.some((d) => d.id !== initialData?.id)) {
        toast({
          title: "This URL slug is already used by another doctor",
          description: "Change the URL Slug in SEO Settings and save again.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
    } catch {
      // if the check can't run, the save itself will still report problems
    }
    const speciality = form.speciality || (form.specializations && form.specializations[0]) || "";
    const treatments_offered = (form.treatments_list || []).join(", ");

    const data = {
      ...form,
      // "education" is only sent once it exists on the row or was typed in,
      // so saving still works before migration 011 is run.
      ...("education" in form ? { education: (form.education || "").trim() || null } : {}),
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
      section_config: JSON.stringify(form.section_config || []),
      section_subheadings: JSON.stringify(form.section_subheadings || {}),
      seo_keywords: (form.seo_keywords || "").trim() || null,
      local_seo_text: (form.local_seo_text || "").trim() || null,
    };

    // Several sub-headings per section → section_groups, plus the old
    // single-list columns (all points) so listings/search keep working.
    applyGroupsToPayload(data, form.section_groups, DOCTOR_GROUP_KEYS);
    applyJourneyToPayload(data, form);

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
      toast({
        title: "Failed to save doctor",
        description: /education/.test(err?.message || "")
          ? "Education ka column abhi database me nahi hai. Supabase SQL Editor me supabase/migrations/011_doctor_education.sql run karein."
          : isMissingJourneyColumn(err)
            ? JOURNEY_MIGRATION_HINT
            : err?.message,
        variant: "destructive",
      });
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
            <Field label="Badge (shown under the name)">
              <Input value={form.badge_title || ""} onChange={(e) => set("badge_title", e.target.value)} placeholder="e.g., Senior Cardiac Surgeon" className="h-10 rounded-lg border-border" />
              <p className="text-xs text-muted-foreground/70 mt-1">Optional. Doctor ki profile par naam ke neeche green tag me, aur Doctors page ke card par "Speciality:" ke aage dikhta hai.</p>
            </Field>
            <Field label="Designation" required>
              <Input value={form.designation || ""} onChange={(e) => set("designation", e.target.value)} placeholder="e.g., Senior Consultant Cardiologist" className="h-10 rounded-lg border-border" />
              <p className="text-xs text-muted-foreground/70 mt-1">Doctors page ke card par naam ke neeche tag me dikhta hai.</p>
            </Field>
            <Field label="Education (shown on doctor card)">
              <Input value={form.education || ""} onChange={(e) => set("education", e.target.value)} placeholder="e.g., MBBS, MD (Medicine), DM (Neurology)" className="h-10 rounded-lg border-border" />
              <p className="text-xs text-muted-foreground/70 mt-1">Doctors page ke card par 🎓 icon ke saath dikhta hai. Khali chhodenge to neeche wali Qualification list se degrees le li jayengi.</p>
            </Field>
            <Field label="Hospital" required>
              <AutocompleteInput
                value={form.hospital_name || ""}
                onChange={(v) => set("hospital_name", v)}
                options={hospitalNames}
                placeholder="Select or type a hospital name"
              />
              <p className="text-xs text-muted-foreground/70 mt-1">
                Pick an existing hospital, or type a new name if it's not listed yet.
              </p>
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
            <ShowOnHomeToggle checked={form.show_on_home} onChange={(v) => set("show_on_home", v)} section="Top Doctors" />
          </div>
        </div>

        {/* Specializations & Treatments (unnumbered) */}
        <GroupedListField label="Specializations" placeholder="e.g., Heart Surgery" optional groups={form.section_groups?.specializations} onChange={(g) => setGroups("specializations", g)} />
        <GroupedListField label="Treatments Offered" placeholder="e.g., Knee Replacement Surgery" optional groups={form.section_groups?.treatments_list} onChange={(g) => setGroups("treatments_list", g)} />

        {/* Section 1: Overview & Detailed Experience */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-jade/15 text-accent-jade text-xs font-bold">1</span>
            <h3 className="font-bold text-foreground text-sm">Overview & Detailed Experience</h3>
          </div>
          <div className="space-y-4">
            <Field label="Overview" required>
              <ParagraphListField value={form.overview} onChange={(v) => set("overview", v)} placeholder="Brief overview about the doctor..." />
            </Field>
            <GroupedListField label="Overview Points" placeholder="Overview point" optional groups={form.section_groups?.overview_points} onChange={(g) => setGroups("overview_points", g)} />
            <Field label="Detailed Experience" required>
              <ParagraphListField value={form.detailed_experience} onChange={(v) => set("detailed_experience", v)} placeholder="Detailed experience description..." />
            </Field>
            <GroupedListField label="Experience Details" placeholder="Experience detail" optional groups={form.section_groups?.experience_details} onChange={(g) => setGroups("experience_details", g)} />
          </div>
        </div>

        {/* Sections 2-5 */}
        <GroupedListField label="Qualification" placeholder="e.g., MBBS - AIIMS, New Delhi" number={2} optional groups={form.section_groups?.qualifications_list} onChange={(g) => setGroups("qualifications_list", g)} />
        <GroupedListField label="Clinical Focus" placeholder="e.g., Patient-centered care" number={3} optional groups={form.section_groups?.clinical_focus} onChange={(g) => setGroups("clinical_focus", g)} />
        <GroupedListField label="Additional Information" placeholder="e.g., Fluent in English, Hindi, and Arabic" number={4} optional groups={form.section_groups?.additional_info} onChange={(g) => setGroups("additional_info", g)} />
        <PatientJourneyField
          kind="doctor"
          name={form.name}
          steps={form.patient_journey}
          heading={form.patient_journey_heading}
          onStepsChange={(v) => set("patient_journey", v)}
          onHeadingChange={(v) => set("patient_journey_heading", v)}
        />
        <GroupedListField label="Research & Publication" placeholder="e.g., Published in Journal of Medicine" number={5} optional groups={form.section_groups?.research_publications} onChange={(g) => setGroups("research_publications", g)} />

        {/* Section 6: Awards (accent card) */}
        <div className="bg-[hsl(var(--accent-warm)/0.08)] rounded-2xl border border-amber-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--accent-warm)/0.35)] text-[hsl(var(--accent-warm))] text-xs font-bold">6</span>
            <Trophy className="w-4 h-4 text-[hsl(var(--accent-warm))]" />
            <h3 className="font-bold text-secondary text-sm">Award & Achievement</h3>
          </div>
          <GroupedListField label="" placeholder="e.g., Best Doctor Award 2023" accent groups={form.section_groups?.awards_achievements} onChange={(g) => setGroups("awards_achievements", g)} />
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
        <GroupedListField label="Why Choose This Doctor" placeholder="e.g., Internationally trained in robotic surgery" number={7} optional groups={form.section_groups?.why_choose_doctor} onChange={(g) => setGroups("why_choose_doctor", g)} />

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

        {/* SEO Settings — used only for the browser tab title and search-engine
            meta description. Never rendered anywhere on the live page. */}
        <SectionOrderEditor
          defaultSections={DEFAULT_DOCTOR_SECTIONS}
          value={form.section_config}
          onChange={(v) => setList("section_config", v)}
        />

        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm">SEO & Local Search (GEO)</h3>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1 mb-4">
            <EyeOff className="w-3.5 h-3.5 shrink-0 mt-px" />
            Admin only — not shown on the website. Used in the page's search-engine tags and structured data, which Google and AI search read.
          </p>
          <div className="space-y-4">
            <Field label="URL Slug">
              <Input
                value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                onBlur={(e) => set("slug", slugify(e.target.value))}
                placeholder={slugify(form.name) || "dr-name-speciality-city"}
                className="h-10 rounded-lg border-border font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground/70 mt-1 break-all">
                Page address: <span className="font-mono">/doctors/{slugify(form.slug) || slugify(form.name) || "…"}</span>
                {" "}— e.g. dr-vikram-dua-neurosurgeon-faridabad. Leave empty to use the doctor's name.
              </p>
            </Field>
            <Field label="SEO Keywords">
              <Textarea
                value={form.seo_keywords || ""}
                onChange={(e) => set("seo_keywords", e.target.value)}
                placeholder="Dr Vikram Dua, best neurosurgeon in Faridabad, spine surgeon Faridabad, ..."
                className="rounded-lg border-border min-h-[70px]"
                rows={2}
              />
              <p className="text-xs text-muted-foreground/70 mt-1">Separate keywords with commas.</p>
            </Field>
            <Field label="Local SEO / GEO Paragraph">
              <Textarea
                value={form.local_seo_text || ""}
                onChange={(e) => set("local_seo_text", e.target.value)}
                placeholder="Looking for an experienced neurosurgeon in Faridabad? Dr. ... at ... Hospital, Sector 86, Faridabad. Patients from Faridabad, Delhi, Noida, Gurugram ..."
                className="rounded-lg border-border min-h-[120px]"
                rows={5}
              />
              <p className="text-xs text-muted-foreground/70 mt-1">
                Location, hospital, speciality and areas served. Used as the doctor's description for search engines and AI search
                (and as the meta description when that is empty).
              </p>
            </Field>
            <Field label="Meta Title (optional)">
              <Input
                value={form.meta_title || ""}
                onChange={(e) => set("meta_title", e.target.value)}
                placeholder="Custom SEO title for search engines"
                className="h-10 rounded-lg border-border"
              />
              <p className="text-xs text-muted-foreground/70 mt-1">
                Leave empty to auto-generate from doctor name and designation. Recommended: 50-60 characters.
              </p>
            </Field>
            <Field label="Meta Description (optional)">
              <Textarea
                value={form.meta_description || ""}
                onChange={(e) => set("meta_description", e.target.value)}
                placeholder="Custom SEO description for search engines"
                className="rounded-lg border-border min-h-[90px]"
                rows={3}
              />
              <p className="text-xs text-muted-foreground/70 mt-1">
                Leave empty to auto-generate from overview. Recommended: 150-160 characters.
              </p>
            </Field>
          </div>
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