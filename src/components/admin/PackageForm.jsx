import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Loader2, Upload, ImageIcon, X, Plus, Check, ChevronsUpDown } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { useToast } from "@/components/ui/use-toast";
import DynamicListField from "@/components/admin/DynamicListField";
import { slugify } from "@/lib/slugify";
import {
  PACKAGE_COUNTRIES,
  parseList,
  toNumber,
  discountPercent,
} from "@/lib/packageUtils";

const LIST_FIELDS = ["inclusions", "exclusions", "highlights", "itinerary", "gallery_images", "faqs"];

const DEFAULT_INCLUSIONS = [
  "Treatment / surgery fees",
  "Hospital stay",
  "Hotel accommodation",
  "Airport pick-up and drop",
  "Local transfers (hotel ↔ hospital)",
  "Personal patient coordinator & translator",
];

export default function PackageForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) {
      return {
        status: "active",
        currency: "USD",
        inclusions: DEFAULT_INCLUSIONS,
        exclusions: [],
        highlights: [],
        itinerary: [],
        gallery_images: [],
        faqs: [],
      };
    }
    const f = { ...initialData };
    LIST_FIELDS.forEach((k) => {
      f[k] = parseList(initialData[k]);
    });
    return f;
  });
  const [slugTouched, setSlugTouched] = useState(isEdit && !!initialData?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    db.entities.Treatment.list("name", 2000).then(setTreatments).catch(() => {});
    db.entities.Hospital.list("name", 2000).then(setHospitals).catch(() => {});
    db.entities.Doctor.list("name", 2000).then(setDoctors).catch(() => {});
  }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const setTitle = (val) =>
    setForm((p) => ({ ...p, title: val, ...(slugTouched ? {} : { slug: slugify(val) }) }));

  // Picking a treatment fills in the category label if it's still empty.
  const pickTreatment = (id) => {
    const t = treatments.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      treatment_id: id || null,
      category: p.category || t?.name || "",
    }));
  };

  // Picking a hospital fills in country + city, so the filters on the
  // public page work without extra typing.
  const pickHospital = (id) => {
    const h = hospitals.find((x) => x.id === id);
    setForm((p) => ({
      ...p,
      hospital_id: id || null,
      country: h?.country || p.country,
      city: h?.city || p.city,
    }));
  };

  // Doctors at the picked hospital first, then everyone else.
  const selectedHospital = hospitals.find((h) => h.id === form.hospital_id);
  const doctorOptions = useMemo(() => {
    const opts = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      subtitle: [d.speciality, d.hospital_name].filter(Boolean).join(" · "),
      atHospital: !!selectedHospital && (d.hospital_id === selectedHospital.id || d.hospital_name === selectedHospital.name),
    }));
    return opts.sort((a, b) => Number(b.atHospital) - Number(a.atHospital));
  }, [doctors, selectedHospital]);

  const uploadOne = async (file) => {
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const oldUrl = form.image_url;
    setUploading(true);
    try {
      const url = await uploadOne(file);
      set("image_url", url);
      if (oldUrl && oldUrl !== url) db.integrations.Core.DeleteFile(oldUrl);
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleGallery = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadOne(file));
      setForm((p) => ({ ...p, gallery_images: [...(p.gallery_images || []), ...urls] }));
      toast({ title: `${urls.length} image${urls.length > 1 ? "s" : ""} uploaded` });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingGallery(false);
  };

  const removeGalleryImage = (url) => {
    // The file itself is deleted only after Save, so Cancel doesn't leave a
    // broken image on the live package.
    setForm((p) => ({ ...p, gallery_images: (p.gallery_images || []).filter((u) => u !== url) }));
    setRemovedImages((r) => [...r, url]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast({ title: "Package title is required", variant: "destructive" });
      return;
    }
    if (!toNumber(form.price)) {
      toast({ title: "Package price is required", variant: "destructive" });
      return;
    }
    const price = toNumber(form.price);
    const original = toNumber(form.original_price);
    if (original !== null && original < price) {
      toast({ title: "Original price should be higher than the package price", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { id, created_date, updated_date, ...rest } = form; // eslint-disable-line no-unused-vars
    const data = {
      ...rest,
      title: form.title.trim(),
      slug: slugify(form.slug || form.title) || null,
      treatment_id: form.treatment_id || null,
      hospital_id: form.hospital_id || null,
      doctor_id: form.doctor_id || null,
      price,
      original_price: original,
      booking_percent: toNumber(form.booking_percent),
      days_in_hospital: toNumber(form.days_in_hospital),
      nights_stay: toNumber(form.nights_stay),
      total_days: toNumber(form.total_days),
      sort_order: toNumber(form.sort_order) || 0,
      currency: form.currency || "USD",
      featured: !!form.featured,
      status: form.status || "active",
      inclusions: JSON.stringify((form.inclusions || []).filter((s) => String(s).trim())),
      exclusions: JSON.stringify((form.exclusions || []).filter((s) => String(s).trim())),
      highlights: JSON.stringify((form.highlights || []).filter((s) => String(s).trim())),
      itinerary: JSON.stringify((form.itinerary || []).filter((s) => String(s).trim())),
      gallery_images: JSON.stringify(form.gallery_images || []),
      faqs: JSON.stringify((form.faqs || []).filter((f) => f?.question?.trim())),
    };

    try {
      if (isEdit) {
        await db.entities.Package.update(initialData.id, data);
        toast({ title: "Package updated" });
      } else {
        await db.entities.Package.create(data);
        toast({ title: "Package created" });
      }
      removedImages.forEach((url) => db.integrations.Core.DeleteFile(url));
      onSaved();
    } catch (err) {
      const duplicateSlug = err?.status === "23505";
      toast({
        title: duplicateSlug ? "This URL slug is already used by another package" : "Failed to save package",
        description: duplicateSlug ? "Change the slug and try again." : err?.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const discount = discountPercent(form);

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
            {isEdit ? "Edit Package" : "Add New Package"}
          </h2>
          <p className="text-xs text-muted-foreground">Shown on the Packages page and its own details page.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">
        {/* Basic info */}
        <Card title="Basic Info">
          <Field label="Package Title" required hint="e.g. Hair Transplant at Dr Hakan Clinic Istanbul, Turkey">
            <Input value={form.title || ""} onChange={(e) => setTitle(e.target.value)} placeholder="Package title" className="h-10 rounded-lg" />
          </Field>
          <Field label="URL Slug" hint={`Page address: /packages/${form.slug || "your-package"}`}>
            <Input
              value={form.slug || ""}
              onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }}
              placeholder="auto-generated from title"
              className="h-10 rounded-lg"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status || "active"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sort Order" hint="Lower shows first">
              <Input type="number" value={form.sort_order ?? ""} onChange={(e) => set("sort_order", e.target.value)} placeholder="0" className="h-10 rounded-lg" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80 pt-1">
            <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured (shown at the top)
          </label>
        </Card>

        {/* Links */}
        <Card title="Treatment, Hospital & Doctor" desc="Links this package to your existing records. Country and city fill in from the hospital.">
          <Field label="Treatment">
            <SearchSelect
              value={form.treatment_id}
              onChange={pickTreatment}
              placeholder="Select treatment"
              options={treatments.map((t) => ({ id: t.id, name: t.name, subtitle: t.category }))}
            />
          </Field>
          <Field label="Category label" hint="Small text above the title, e.g. HAIR TRANSPLANTATION">
            <Input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Hair Transplantation" className="h-10 rounded-lg" />
          </Field>
          <Field label="Hospital / Clinic">
            <SearchSelect
              value={form.hospital_id}
              onChange={pickHospital}
              placeholder="Select hospital"
              options={hospitals.map((h) => ({ id: h.id, name: h.name, subtitle: [h.city, h.country].filter(Boolean).join(", ") }))}
            />
          </Field>
          <Field label="Doctor (optional)">
            <SearchSelect
              value={form.doctor_id}
              onChange={(id) => set("doctor_id", id || null)}
              placeholder="Select doctor"
              options={doctorOptions}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <Select value={form.country || ""} onValueChange={(v) => set("country", v)}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {PACKAGE_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="City">
              <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Istanbul" className="h-10 rounded-lg" />
            </Field>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing (USD)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Package Price" required>
              <Input type="number" min="0" value={form.price ?? ""} onChange={(e) => set("price", e.target.value)} placeholder="4750" className="h-10 rounded-lg" />
            </Field>
            <Field label="Original Price" hint="Shown struck-through. Leave empty for no discount.">
              <Input type="number" min="0" value={form.original_price ?? ""} onChange={(e) => set("original_price", e.target.value)} placeholder="5500" className="h-10 rounded-lg" />
            </Field>
          </div>
          {toNumber(form.price) > 0 && discount > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-accent-jade text-white font-bold">SAVE {discount}%</span>
              )}
            </div>
          )}
        </Card>

        {/* Stay */}
        <Card title="Stay Details">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Days in hospital">
              <Input type="number" min="0" value={form.days_in_hospital ?? ""} onChange={(e) => set("days_in_hospital", e.target.value)} placeholder="1" className="h-10 rounded-lg" />
            </Field>
            <Field label="Hotel nights">
              <Input type="number" min="0" value={form.nights_stay ?? ""} onChange={(e) => set("nights_stay", e.target.value)} placeholder="3" className="h-10 rounded-lg" />
            </Field>
            <Field label="Total trip days">
              <Input type="number" min="0" value={form.total_days ?? ""} onChange={(e) => set("total_days", e.target.value)} placeholder="4" className="h-10 rounded-lg" />
            </Field>
          </div>
        </Card>

        {/* Images */}
        <Card title="Images">
          <Field label="Main Image">
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-20 h-16 rounded-lg object-cover border" />
              ) : (
                <div className="w-20 h-16 rounded-lg bg-muted border flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
              <UploadButton onChange={handleImage} busy={uploading} label="Upload Image" />
            </div>
          </Field>
          <Field label="Gallery (optional)" hint="Extra photos shown on the details page">
            <div className="flex flex-wrap gap-2">
              {(form.gallery_images || []).map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <UploadButton onChange={handleGallery} busy={uploadingGallery} label="Add Photos" multiple />
            </div>
          </Field>
        </Card>

        {/* Content */}
        <Card title="Description">
          <Field label="Short Description" hint="One or two lines, shown on the details page header">
            <Input value={form.short_description || ""} onChange={(e) => set("short_description", e.target.value)} placeholder="Short summary" className="h-10 rounded-lg" />
          </Field>
          <Field label="Package Overview">
            <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Full description of the package" className="rounded-lg min-h-[120px]" rows={5} />
          </Field>
        </Card>

        <DynamicListField label="Highlights" placeholder="e.g. FUE technique, up to 4000 grafts" optional values={form.highlights} onChange={(v) => set("highlights", v)} />
        <DynamicListField label="What's Included" placeholder="Included item" values={form.inclusions} onChange={(v) => set("inclusions", v)} />
        <DynamicListField label="Not Included" placeholder="Excluded item" optional values={form.exclusions} onChange={(v) => set("exclusions", v)} />
        <DynamicListField label="Day-by-Day Plan" placeholder="e.g. Day 1: Arrival, airport pick-up and hotel check-in" optional values={form.itinerary} onChange={(v) => set("itinerary", v)} />

        <FaqEditor values={form.faqs || []} onChange={(v) => set("faqs", v)} />

        <Card title="SEO Settings">
          <Field label="Meta Title (optional)">
            <Input value={form.meta_title || ""} onChange={(e) => set("meta_title", e.target.value)} placeholder="Leave empty to use the package title" className="h-10 rounded-lg" />
          </Field>
          <Field label="Meta Description (optional)">
            <Textarea value={form.meta_description || ""} onChange={(e) => set("meta_description", e.target.value)} placeholder="Leave empty to use the short description" className="rounded-lg min-h-[80px]" rows={3} />
          </Field>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">Cancel</Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-accent-jade hover:bg-accent-jade/90 text-white">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      <div className="space-y-3 mt-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-foreground/80">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70 mt-1">{hint}</p>}
    </div>
  );
}

function UploadButton({ onChange, busy, label, multiple }) {
  return (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" disabled={busy} />
      <div className="flex items-center gap-1.5 px-3 h-16 rounded-lg border border-dashed border-border text-sm font-medium text-foreground/80 hover:bg-muted">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {busy ? "Uploading..." : label}
      </div>
    </label>
  );
}

// Searchable single-select dropdown (for long lists of hospitals/doctors).
function SearchSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-input bg-white text-sm flex items-center justify-between gap-2 text-left"
          >
            <span className={`truncate ${selected ? "text-foreground" : "text-muted-foreground"}`}>
              {selected ? selected.name : placeholder}
            </span>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>Nothing found.</CommandEmpty>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={`${o.name} ${o.subtitle || ""} ${o.id}`}
                  onSelect={() => { onChange(o.id); setOpen(false); }}
                >
                  <Check className={`w-4 h-4 mr-2 shrink-0 ${o.id === value ? "opacity-100" : "opacity-0"}`} />
                  <div className="min-w-0">
                    <p className="truncate">{o.name}</p>
                    {o.subtitle && <p className="text-xs text-muted-foreground truncate">{o.subtitle}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-lg shrink-0" onClick={() => onChange(null)} title="Clear">
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function FaqEditor({ values, onChange }) {
  const update = (idx, key, val) => onChange(values.map((f, i) => (i === idx ? { ...f, [key]: val } : f)));
  return (
    <Card title="FAQs (optional)">
      {values.map((f, idx) => (
        <div key={idx} className="rounded-xl border border-border p-3 space-y-2 relative">
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== idx))}
            className="absolute top-2 right-2 p-1 rounded hover:bg-muted"
            aria-label="Remove FAQ"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <Input value={f.question || ""} onChange={(e) => update(idx, "question", e.target.value)} placeholder="Question" className="h-10 rounded-lg pr-9" />
          <Textarea value={f.answer || ""} onChange={(e) => update(idx, "answer", e.target.value)} placeholder="Answer" className="rounded-lg min-h-[70px]" rows={2} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, { question: "", answer: "" }])}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-foreground/80 text-xs font-medium hover:bg-muted"
      >
        <Plus className="w-3.5 h-3.5" /> Add FAQ
      </button>
    </Card>
  );
}