import React, { useState } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import DynamicListField from "@/components/admin/DynamicListField";

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
};

export default function TreatmentForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) return {};
    const f = { ...initialData };
    ["key_benefits","treatment_procedures","overview","additional_information","signs_symptoms","related_conditions","diagnosis","treatment_types","surgery_types","how_its_done","purpose","recovery_details","risks","summary","why_choose_india"].forEach((k) => {
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
      set("image_url", file_url);
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
    };

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
      toast({ title: "Failed to save treatment", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
      {/* Sub-header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-shrink-0 w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
            {isEdit ? "Edit Treatment" : "Add New Treatment"}
          </h2>
          <p className="text-xs text-gray-500">{isEdit ? "Update treatment details" : "Create a new treatment"}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Basic Information</h3>
          <div className="space-y-3">
            <Field label="Title" required>
              <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Enter treatment title" className="h-10 rounded-lg border-gray-200" />
            </Field>
            <Field label="Slug" required>
              <Input value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="treatment-slug" className="h-10 rounded-lg border-gray-200" />
            </Field>
            <Field label="Category" required>
              <Input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g., Cardiology, Oncology" className="h-10 rounded-lg border-gray-200" />
            </Field>
            <Field label="Short Description" required>
              <Input value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Brief 1-2 sentence description" className="h-10 rounded-lg border-gray-200" />
            </Field>
            <Field label="Description">
              <Textarea value={form.detailed_content || ""} onChange={(e) => set("detailed_content", e.target.value)} placeholder="Full treatment description" className="rounded-lg border-gray-200 min-h-[100px]" rows={4} />
            </Field>
            <Field label="Treatment Image">
              <div className="flex items-center gap-3">
                {form.image_url ? (
                  <img src={form.image_url} alt="Treatment" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Upload Image"}
                  </div>
                </label>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Field label="Country">
                <Select value={form.country || "Both"} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Duration">
                <Input value={form.duration || ""} onChange={(e) => set("duration", e.target.value)} placeholder="e.g., 2-3 hours" className="h-10 rounded-lg border-gray-200" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost Range (USD)">
                <Input value={form.cost_range_usd || ""} onChange={(e) => set("cost_range_usd", e.target.value)} placeholder="e.g., $3,000 - $8,000" className="h-10 rounded-lg border-gray-200" />
              </Field>
              <Field label="Recovery Time">
                <Input value={form.recovery_time || ""} onChange={(e) => set("recovery_time", e.target.value)} placeholder="e.g., 2-4 weeks" className="h-10 rounded-lg border-gray-200" />
              </Field>
            </div>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured
              </label>
              <Field label="Status" inline>
                <Select value={form.status || "active"} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="h-9 rounded-lg border-gray-200 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* Unnumbered dynamic sections */}
        <DynamicListField label="Key Benefits" placeholder="Benefit" optional values={form.key_benefits} onChange={(v) => setList("key_benefits", v)} />
        <DynamicListField label="Treatment Procedures" placeholder="Procedure step" optional values={form.treatment_procedures} onChange={(v) => setList("treatment_procedures", v)} />

        {/* Numbered dynamic sections */}
        <DynamicListField label="Overview" placeholder="Overview point" number={1} required values={form.overview} onChange={(v) => setList("overview", v)} />
        <DynamicListField label="Additional Information" placeholder="Additional info" number={2} optional values={form.additional_information} onChange={(v) => setList("additional_information", v)} />
        <DynamicListField label="Signs and Symptoms" placeholder="Sign / Symptom" number={3} optional values={form.signs_symptoms} onChange={(v) => setList("signs_symptoms", v)} />
        <DynamicListField label="Condition" placeholder="Condition" number={4} optional values={form.related_conditions} onChange={(v) => setList("related_conditions", v)} />
        <DynamicListField label="Diagnosis" placeholder="Diagnosis point" number={5} optional values={form.diagnosis} onChange={(v) => setList("diagnosis", v)} />
        <DynamicListField label="Types of Treatments" placeholder="Treatment type" number={6} optional values={form.treatment_types} onChange={(v) => setList("treatment_types", v)} />
        <DynamicListField label="Types of Surgery" placeholder="Surgery type" number={7} optional values={form.surgery_types} onChange={(v) => setList("surgery_types", v)} />
        <DynamicListField label="How It's Done" placeholder="Step" number={8} optional values={form.how_its_done} onChange={(v) => setList("how_its_done", v)} />
        <DynamicListField label="Purpose" placeholder="Purpose point" number={9} optional values={form.purpose} onChange={(v) => setList("purpose", v)} />
        <DynamicListField label="Recovery" placeholder="Recovery detail" number={10} optional values={form.recovery_details} onChange={(v) => setList("recovery_details", v)} />
        <DynamicListField label="Risk" placeholder="Risk / Complication" number={11} optional values={form.risks} onChange={(v) => setList("risks", v)} />

        {/* Success Rate - single input */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">12</span>
            <h3 className="font-bold text-gray-900 text-sm">Success Rate <span className="text-gray-400 font-normal text-xs">(optional)</span></h3>
          </div>
          <Input value={form.success_rate || ""} onChange={(e) => set("success_rate", e.target.value)} placeholder="e.g., 95% success rate" className="h-10 rounded-lg border-gray-200" />
        </div>

        <DynamicListField label="Summary" placeholder="Summary point" number={13} optional values={form.summary} onChange={(v) => setList("summary", v)} />
        <DynamicListField label="Why Choose India" placeholder="Reason" number={14} optional values={form.why_choose_india} onChange={(v) => setList("why_choose_india", v)} />

        {/* Additional textareas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Additional Information <span className="text-gray-400 font-normal text-xs">(Optional)</span></h3>
          <div className="space-y-3">
            <Field label="GVHD Information">
              <Textarea value={form.gvhd_info || ""} onChange={(e) => set("gvhd_info", e.target.value)} placeholder="Graft versus host disease information" className="rounded-lg border-gray-200 min-h-[80px]" rows={3} />
            </Field>
            <Field label="GVHD Symptoms">
              <Textarea value={form.gvhd_symptoms || ""} onChange={(e) => set("gvhd_symptoms", e.target.value)} placeholder="GVHD symptoms" className="rounded-lg border-gray-200 min-h-[80px]" rows={3} />
            </Field>
            <Field label="Conditions">
              <Textarea value={form.conditions_treated || ""} onChange={(e) => set("conditions_treated", e.target.value)} placeholder="Conditions treated" className="rounded-lg border-gray-200 min-h-[80px]" rows={3} />
            </Field>
            <Field label="Diagnosis">
              <Textarea value={form.diagnosis_detail || ""} onChange={(e) => set("diagnosis_detail", e.target.value)} placeholder="Diagnosis methods" className="rounded-lg border-gray-200 min-h-[80px]" rows={3} />
            </Field>
            <Field label="Why India">
              <Textarea value={form.why_india_detail || ""} onChange={(e) => set("why_india_detail", e.target.value)} placeholder="Why choose India for this treatment" className="rounded-lg border-gray-200 min-h-[80px]" rows={3} />
            </Field>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-emerald-600 hover:bg-emerald-700 text-white">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? "Update Treatment" : "Create Treatment"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children, inline }) {
  return (
    <div className={inline ? "flex items-center gap-2" : ""}>
      <label className={`text-sm font-medium text-gray-700 ${inline ? "whitespace-nowrap" : "block mb-1.5"}`}>
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}