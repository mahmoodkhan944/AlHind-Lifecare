import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon, EyeOff } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import GroupedListField from "@/components/admin/GroupedListField";
import PatientJourneyField from "@/components/admin/PatientJourneyField";
import { applyJourneyToPayload, isMissingJourneyColumn, JOURNEY_MIGRATION_HINT } from "@/lib/patientJourney";
import { buildGroupsMap, applyGroupsToPayload } from "@/lib/sectionGroups";

// Sections that support several sub-headings (Admin → drag to reorder).
const TREATMENT_GROUP_KEYS = ["key_benefits", "overview", "signs_symptoms", "related_conditions", "diagnosis", "treatment_types", "surgery_types", "how_its_done", "purpose", "recovery_details", "risks", "summary", "why_choose_india", "why_choose_turkey", "treatment_procedures", "additional_information"];
import SearchableCheckboxList from "@/components/admin/SearchableCheckboxList";
import SectionOrderEditor from "@/components/admin/SectionOrderEditor";
import { DEFAULT_TREATMENT_SECTIONS } from "@/pages/TreatmentDetail";
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

export default function TreatmentForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) return { section_groups: buildGroupsMap(null, TREATMENT_GROUP_KEYS) };
    const f = { ...initialData };
    ["key_benefits","treatment_procedures","overview","additional_information","signs_symptoms","related_conditions","diagnosis","treatment_types","surgery_types","how_its_done","purpose","recovery_details","risks","summary","why_choose_india","why_choose_turkey","hospital_ids","doctor_ids","section_config"].forEach((k) => {
      f[k] = parseList(initialData[k]);
    });
    f.section_subheadings = parseObj(initialData.section_subheadings);
    f.section_groups = buildGroupsMap(initialData, TREATMENT_GROUP_KEYS);
    return f;
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [allHospitals, setAllHospitals] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    db.entities.Hospital.list("name", 2000).then(setAllHospitals).catch(() => {});
    db.entities.Doctor.list("name", 2000).then(setAllDoctors).catch(() => {});
  }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setGroups = (key, groups) =>
    setForm((p) => ({ ...p, section_groups: { ...(p.section_groups || {}), [key]: groups } }));
  const setList = (key, val) => set(key, val);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const oldUrl = form.image_url;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("image_url", file_url);
      if (oldUrl && oldUrl !== file_url) db.integrations.Core.DeleteFile(oldUrl);
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast({ title: "Title and Category are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const slug = form.slug || String(form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const data = {
      ...form,
      slug,
      hospitals_count: Number(form.hospitals_count) || 0,
      doctors_count: Number(form.doctors_count) || 0,
      featured: !!form.featured,
      landing_page_enabled: !!form.landing_page_enabled,
      status: form.status || "active",
      country: form.country || "Both",
      key_benefits: JSON.stringify(form.key_benefits || []),
      treatment_procedures: JSON.stringify(form.treatment_procedures || []),
      overview: JSON.stringify(form.overview || []),
      additional_information: JSON.stringify(form.additional_information || []),
      signs_symptoms: JSON.stringify(form.signs_symptoms || []),
      related_conditions: JSON.stringify(form.related_conditions || []),
      diagnosis: JSON.stringify(form.diagnosis || []),
      treatment_types: JSON.stringify(form.treatment_types || []),
      surgery_types: JSON.stringify(form.surgery_types || []),
      how_its_done: JSON.stringify(form.how_its_done || []),
      purpose: JSON.stringify(form.purpose || []),
      recovery_details: JSON.stringify(form.recovery_details || []),
      risks: JSON.stringify(form.risks || []),
      summary: JSON.stringify(form.summary || []),
      why_choose_india: JSON.stringify(form.why_choose_india || []),
      why_choose_turkey: JSON.stringify(form.why_choose_turkey || []),
      hospital_ids: JSON.stringify(form.hospital_ids || []),
      doctor_ids: JSON.stringify(form.doctor_ids || []),
      section_config: JSON.stringify(form.section_config || []),
      section_subheadings: JSON.stringify(form.section_subheadings || {}),
    };

    // Several sub-headings per section → section_groups, plus the old
    // single-list columns (all points) so listings/search keep working.
    applyGroupsToPayload(data, form.section_groups, TREATMENT_GROUP_KEYS);
    applyJourneyToPayload(data, form);

    try {
      if (isEdit) {
        await db.entities.Treatment.update(initialData.id, data);
        toast({ title: "Treatment updated successfully" });
      } else {
        await db.entities.Treatment.create(data);
        toast({ title: "Treatment created successfully" });
      }
      onSaved();
    } catch (err) {
      toast({ title: "Failed to save treatment", description: isMissingJourneyColumn(err) ? JOURNEY_MIGRATION_HINT : err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-muted -m-4 sm:-m-6 lg:-m-8">
      {/* Sub-header */}
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
            {isEdit ? "Edit Treatment" : "Add New Treatment"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Fields below are in the same order they appear on the View Details page.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">

        {/* ==================================================================
            1. BASIC INFO — identity fields, not part of the page's visual
            flow but needed to create the record.
            ================================================================== */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Basic Info</h3>
          <div className="space-y-3">
            <Field label="Title" required>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Enter treatment title" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Slug" required hint="Used in the page URL, e.g. /treatments/knee-replacement">
              <Input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="treatment-slug" className="h-10 rounded-lg border-border" />
            </Field>
            <Field label="Category" required>
              <Input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g., Cardiology, Oncology" className="h-10 rounded-lg border-border" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country">
                <Select value={form.country || "Both"} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" inline>
                <Select value={form.status || "active"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <ShowOnHomeToggle checked={form.show_on_home} onChange={(v) => set("show_on_home", v)} section="Lowest Quotes / Treatments" />
            <div className="flex items-center gap-6 pt-1 flex-wrap">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground/80" title="Shows the full marketing landing-page design (hero pitch, lead form, why-us grid, FAQ) instead of the classic detail page">
                <Switch checked={!!form.landing_page_enabled} onCheckedChange={(v) => set("landing_page_enabled", v)} /> Show as Landing Page
              </label>
            </div>
          </div>
        </div>

        {/* ==================================================================
            2. HERO — the very top of the View Details page: image, quick
            description, and the cost/duration/success-rate/recovery badges.
            ================================================================== */}
        <SectionLabel step="Top of page" title="Hero" desc="Image, short blurb, and the quick-glance info badges" />
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <div className="space-y-3">
            <Field label="Treatment Image">
              <div className="flex items-center gap-3">
                {form.image_url ? (
                  <img src={form.image_url} alt="Treatment" className="w-16 h-16 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground/80 hover:bg-muted">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Upload Image"}
                  </div>
                </label>
              </div>
            </Field>
            <Field label="Short Description" required hint="The blurb shown right under the image">
              <Input value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Brief 1-2 sentence description" className="h-10 rounded-lg border-border" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost Range (USD)">
                <Input value={form.cost_range_usd || ""} onChange={(e) => set("cost_range_usd", e.target.value)} placeholder="e.g., $3,000 - $8,000" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="Duration">
                <Input value={form.duration || ""} onChange={(e) => set("duration", e.target.value)} placeholder="e.g., 2-3 hours" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Success Rate">
                <Input value={form.success_rate || ""} onChange={(e) => set("success_rate", e.target.value)} placeholder="e.g., 95% success rate" className="h-10 rounded-lg border-border" />
              </Field>
              <Field label="Recovery Time">
                <Input value={form.recovery_time || ""} onChange={(e) => set("recovery_time", e.target.value)} placeholder="e.g., 2-4 weeks" className="h-10 rounded-lg border-border" />
              </Field>
            </div>
          </div>
        </div>

        {/* ==================================================================
            3. ABOUT THIS TREATMENT — the longer "About {name}" paragraph
            right below the hero.
            ================================================================== */}
        <SectionLabel step="Next" title="About This Treatment" desc="The full description paragraph below the hero" />
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <Field label="Description">
            <Textarea value={form.detailed_content || ""} onChange={(e) => set("detailed_content", e.target.value)} placeholder="Full treatment description" className="rounded-lg border-border min-h-[100px]" rows={4} />
          </Field>
        </div>

        {/* ==================================================================
            4. KEY BENEFITS
            ================================================================== */}
        <SectionLabel step="Next" title="Key Benefits" desc="Checklist shown right after the description" />
        <GroupedListField label="Key Benefits" placeholder="Benefit" optional groups={form.section_groups?.key_benefits} onChange={(g) => setGroups("key_benefits", g)} />

        {/* ==================================================================
            5. DETAILED SECTIONS — rendered on the page in exactly this
            order, each as its own numbered card.
            ================================================================== */}
        <SectionLabel step="Next" title="Detailed Sections" desc="Each of these becomes its own section, in this order" />
        <GroupedListField label="Overview" placeholder="Overview point" number={1} required groups={form.section_groups?.overview} onChange={(g) => setGroups("overview", g)} />
        <GroupedListField label="Signs and Symptoms" placeholder="Sign / Symptom" number={2} optional groups={form.section_groups?.signs_symptoms} onChange={(g) => setGroups("signs_symptoms", g)} />
        <GroupedListField label="Condition" placeholder="Condition" number={3} optional groups={form.section_groups?.related_conditions} onChange={(g) => setGroups("related_conditions", g)} />
        <GroupedListField label="Diagnosis" placeholder="Diagnosis point" number={4} optional groups={form.section_groups?.diagnosis} onChange={(g) => setGroups("diagnosis", g)} />
        <GroupedListField label="Types of Treatments" placeholder="Treatment type" number={5} optional groups={form.section_groups?.treatment_types} onChange={(g) => setGroups("treatment_types", g)} />
        <GroupedListField label="Types of Surgery" placeholder="Surgery type" number={6} optional groups={form.section_groups?.surgery_types} onChange={(g) => setGroups("surgery_types", g)} />
        <GroupedListField label="How It's Done" placeholder="Step" number={7} optional groups={form.section_groups?.how_its_done} onChange={(g) => setGroups("how_its_done", g)} />
        <GroupedListField label="Purpose" placeholder="Purpose point" number={8} optional groups={form.section_groups?.purpose} onChange={(g) => setGroups("purpose", g)} />
        <GroupedListField label="Recovery" placeholder="Recovery detail" number={9} optional groups={form.section_groups?.recovery_details} onChange={(g) => setGroups("recovery_details", g)} />
        <GroupedListField label="Risk" placeholder="Risk / Complication" number={10} optional groups={form.section_groups?.risks} onChange={(g) => setGroups("risks", g)} />
        <GroupedListField label="Summary" placeholder="Summary point" number={11} optional groups={form.section_groups?.summary} onChange={(g) => setGroups("summary", g)} />
        <GroupedListField label="Why Choose India" placeholder="Reason" number={12} optional groups={form.section_groups?.why_choose_india} onChange={(g) => setGroups("why_choose_india", g)} />
        <GroupedListField label="Why Choose Turkey" placeholder="Reason" number={13} optional groups={form.section_groups?.why_choose_turkey} onChange={(g) => setGroups("why_choose_turkey", g)} />

        {/* ==================================================================
            6. MORE DETAILS — shown after the numbered sections.
            ================================================================== */}
        <SectionLabel step="Next" title="More Details" desc="Shown further down the page, after the sections above" />
        <GroupedListField label="Treatment Procedures" placeholder="Procedure step" optional groups={form.section_groups?.treatment_procedures} onChange={(g) => setGroups("treatment_procedures", g)} />
        <GroupedListField label="Additional Information" placeholder="Additional info" optional groups={form.section_groups?.additional_information} onChange={(g) => setGroups("additional_information", g)} />
        <PatientJourneyField
          kind="treatment"
          name={form.name}
          steps={form.patient_journey}
          heading={form.patient_journey_heading}
          onStepsChange={(v) => set("patient_journey", v)}
          onHeadingChange={(v) => set("patient_journey_heading", v)}
        />

        {/* ==================================================================
            HOSPITALS & DOCTORS — pick which ones offer/perform this
            treatment. Optional: when left empty, the page falls back to
            matching by category automatically.
            ================================================================== */}
        <SectionLabel step="Next" title="Related Hospitals & Doctors" desc="Shown as 'Related Hospitals' / 'Related Doctors' on the page" />
        <SearchableCheckboxList
          label="Hospitals"
          optional
          items={allHospitals.map((h) => ({ id: h.id, name: h.name, subtitle: h.city }))}
          selectedIds={form.hospital_ids || []}
          onChange={(v) => setList("hospital_ids", v)}
          searchPlaceholder="Search Hospitals..."
          emptyText="No hospitals added yet."
        />
        <SearchableCheckboxList
          label="Doctors"
          optional
          items={allDoctors.map((d) => ({ id: d.id, name: d.name, subtitle: d.speciality }))}
          selectedIds={form.doctor_ids || []}
          onChange={(v) => setList("doctor_ids", v)}
          searchPlaceholder="Search Doctors..."
          emptyText="No doctors added yet."
        />

        <SectionOrderEditor
          defaultSections={DEFAULT_TREATMENT_SECTIONS}
          value={form.section_config}
          onChange={(v) => setList("section_config", v)}
        />

        {/* SEO Settings — used only for the browser tab title and search-engine
            meta description. Never rendered anywhere on the live page. */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <Field label="Meta Title (optional)">
              <Input
                value={form.meta_title || ""}
                onChange={(e) => set("meta_title", e.target.value)}
                placeholder="Custom SEO title for search engines"
                className="h-10 rounded-lg border-border"
              />
              <p className="text-xs text-muted-foreground/70 mt-1">
                Leave empty to auto-generate from treatment name and category. Recommended: 50-60 characters.
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
                Leave empty to auto-generate from description. Recommended: 150-160 characters.
              </p>
            </Field>
          </div>
        </div>

        {/* ==================================================================
            7. BACKEND-ONLY — saved to the database for internal reference,
            deliberately NOT shown on the public page.
            ================================================================== */}
        <div className="bg-white rounded-2xl border border-dashed border-border p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-foreground text-sm">Internal Notes</h3>
          </div>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Saved for your team's reference only — none of this is shown on the public website.
          </p>
          <div className="space-y-3">
            <Field label="GVHD Information">
              <Textarea value={form.gvhd_info || ""} onChange={(e) => set("gvhd_info", e.target.value)} placeholder="Graft versus host disease information" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="GVHD Symptoms">
              <Textarea value={form.gvhd_symptoms || ""} onChange={(e) => set("gvhd_symptoms", e.target.value)} placeholder="GVHD symptoms" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="Conditions">
              <Textarea value={form.conditions_treated || ""} onChange={(e) => set("conditions_treated", e.target.value)} placeholder="Conditions treated" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="Diagnosis">
              <Textarea value={form.diagnosis_detail || ""} onChange={(e) => set("diagnosis_detail", e.target.value)} placeholder="Diagnosis methods" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="Why India">
              <Textarea value={form.why_india_detail || ""} onChange={(e) => set("why_india_detail", e.target.value)} placeholder="Why choose India for this treatment" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
            <Field label="Why Turkey">
              <Textarea value={form.why_turkey_detail || ""} onChange={(e) => set("why_turkey_detail", e.target.value)} placeholder="Why choose Turkey for this treatment" className="rounded-lg border-border min-h-[80px]" rows={3} />
            </Field>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-accent-jade hover:bg-accent-jade/90 text-white">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? "Update Treatment" : "Create Treatment"}
        </Button>
      </div>
    </form>
  );
}

// Marks a new section of the form, tying it to where it shows up on the
// live View Details page — so filling out the form top-to-bottom naturally
// matches what visitors will see top-to-bottom.
function SectionLabel({ step, title, desc }) {
  return (
    <div className="flex items-center gap-3 pt-2 px-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-jade shrink-0">{step}</span>
      <div className="flex-1 h-px bg-border" />
      <div className="text-right">
        <p className="text-sm font-bold text-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, required, children, inline, hint }) {
  return (
    <div className={inline ? "flex items-center gap-2" : ""}>
      <label className={`text-sm font-medium text-foreground/80 ${inline ? "whitespace-nowrap" : "block mb-1.5"}`}>
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>}
    </div>
  );
}