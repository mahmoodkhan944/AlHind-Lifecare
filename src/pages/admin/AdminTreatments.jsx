import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, Copy, Star, Home } from "lucide-react";
import TreatmentForm from "@/components/admin/TreatmentForm";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { slugify } from "@/lib/slugify";

const PAGE_SIZE = 15;

const TREATMENT_BULK_COLUMNS = [
  { key: "name", label: "Name", type: "text", example: "Heart Bypass Surgery" },
  { key: "slug", label: "URL Slug (leave blank to auto-generate from Name)", type: "text", example: "" },
  { key: "category", label: "Category", type: "text", example: "Cardiology" },
  { key: "description", label: "Short Description", type: "text", example: "" },
  { key: "detailed_content", label: "Detailed Content", type: "text", example: "" },
  { key: "country", label: "Country (India/Turkey/Both)", type: "text", example: "Both" },
  { key: "duration", label: "Duration", type: "text", example: "2-3 hours" },
  { key: "cost_range_usd", label: "Cost Range (USD)", type: "text", example: "$5,000 - $8,000" },
  { key: "recovery_time", label: "Recovery Time", type: "text", example: "2-4 weeks" },
  { key: "success_rate", label: "Success Rate", type: "text", example: "95%" },
  { key: "image_url", label: "Image URL", type: "text", example: "" },
  { key: "overview", label: "Overview Points (separate with |)", type: "list", example: "Point one | Point two" },
  { key: "key_benefits", label: "Key Benefits (separate with |)", type: "list", example: "Minimally invasive | Fast recovery" },
  { key: "why_choose_india", label: "Why Choose India (separate with |)", type: "list", example: "Lower cost | JCI hospitals" },
  { key: "why_choose_turkey", label: "Why Choose Turkey (separate with |)", type: "list", example: "Modern facilities | Easy visa" },
  { key: "hospital_ids", label: "Hospitals — by name (separate with |)", type: "lookup-list", example: "Apollo Hospitals, New Delhi" },
  { key: "doctor_ids", label: "Doctors — by name (separate with |)", type: "lookup-list", example: "Dr John Smith" },
  { key: "featured", label: "Featured (yes/no)", type: "boolean", example: "no" },
  { key: "landing_page_enabled", label: "Show as Landing Page (yes/no)", type: "boolean", example: "no" },
  { key: "status", label: "Status (active/inactive)", type: "text", example: "active" },
  { key: "meta_title", label: "SEO Meta Title (optional)", type: "text", example: "" },
  { key: "meta_description", label: "SEO Meta Description (optional)", type: "text", example: "" },
];

const TREATMENT_BULK_DEFAULTS = {
  name: (i) => `Untitled Treatment ${i}`,
  category: "General",
  // Runs after "name" above (object key order), so it can slugify whatever
  // name ended up on the row — typed or auto-generated.
  slug: (i, payload) => slugify(payload.name) || `untitled-treatment-${i}`,
};

export default function AdminTreatments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [hospitalLookup, setHospitalLookup] = useState(new Map());
  const [doctorLookup, setDoctorLookup] = useState(new Map());
  const { toast } = useToast();

  useEffect(() => {
    db.entities.Hospital.list("name", 2000)
      .then((hospitals) => setHospitalLookup(new Map(hospitals.map((h) => [String(h.name).toLowerCase(), h.id]))))
      .catch(() => {});
    db.entities.Doctor.list("name", 2000)
      .then((doctors) => setDoctorLookup(new Map(doctors.map((d) => [String(d.name).toLowerCase(), d.id]))))
      .catch(() => {});
  }, []);

  const loadItems = () => {
    setLoading(true);
    // FIX: limit was 100, which would silently cap the list once the catalogue
    // grows past that. Raised, and now paginated client-side instead.
    db.entities.Treatment.list("-created_date", 2000)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  // Reset to page 1 whenever the search changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const openNew = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this treatment? This action cannot be undone.")) return;
    await db.entities.Treatment.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  // The live page for a treatment, e.g. https://yoursite.com/AlHind-Lifecare/treatments/<id>
  const liveUrl = (item) => `${window.location.origin}${import.meta.env.BASE_URL}treatments/${item.slug || slugify(item.name) || item.id}`;
  const landingUrl = (item) => `${window.location.origin}${import.meta.env.BASE_URL}landing/${item.slug || slugify(item.name) || item.id}`;

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const toggleLandingPage = async (item) => {
    const next = !item.landing_page_enabled;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, landing_page_enabled: next } : i)));
    try {
      await db.entities.Treatment.update(item.id, { landing_page_enabled: next });
      toast({ title: next ? "Landing page enabled" : "Landing page disabled" });
    } catch (err) {
      // Revert on failure so the UI doesn't lie about what's saved.
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, landing_page_enabled: !next } : i)));
      toast({ title: "Couldn't update", description: err?.message, variant: "destructive" });
    }
  };

  const filtered = items.filter((item) =>
    !search || String(item.name || "").toLowerCase().includes(search.toLowerCase()) || String(item.category || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (showForm) {
    return <TreatmentForm initialData={editItem} onCancel={closeForm} onSaved={() => { closeForm(); loadItems(); }} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search treatments..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <BulkUploadDialog
            entityLabel="Treatments"
            entity={db.entities.Treatment}
            columns={TREATMENT_BULK_COLUMNS}
            requiredDefaults={TREATMENT_BULK_DEFAULTS}
            lookupMaps={{ hospital_ids: hospitalLookup, doctor_ids: doctorLookup }}
            onImported={loadItems}
          />
          <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Add New Treatment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">{item.name}</h3>
                {item.landing_page_enabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-jade/10 text-accent-jade text-[10px] font-bold shrink-0">
                    <Home className="w-2.5 h-2.5" /> Landing Page
                  </span>
                )}
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLandingPage(item)}
                  title={item.landing_page_enabled ? "Landing page ON — click to turn off" : "Landing page OFF — click to turn on"}
                >
                  <Home className={`w-4 h-4 ${item.landing_page_enabled ? "text-accent-jade" : "text-muted-foreground/50"}`} />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={liveUrl(item)} target="_blank" rel="noopener noreferrer" title="View live page">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {item.category && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
                {item.category}
              </span>
            )}

            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {item.duration ? (
                <>
                  <span className="font-medium text-foreground/80">Duration: </span>
                  {item.duration}
                </>
              ) : (
                item.description || "No description yet."
              )}
            </p>

            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="font-medium text-foreground/80 shrink-0">Page URL:</span>
              <a
                href={liveUrl(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline truncate"
              >
                {liveUrl(item)}
              </a>
              <button
                type="button"
                onClick={() => copyUrl(liveUrl(item))}
                className="text-muted-foreground hover:text-foreground shrink-0"
                title="Copy link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {item.landing_page_enabled && (
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="font-medium text-accent-jade shrink-0">Landing URL:</span>
                <a
                  href={landingUrl(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-jade underline truncate"
                >
                  {landingUrl(item)}
                </a>
                <button
                  type="button"
                  onClick={() => copyUrl(landingUrl(item))}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="mt-3">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === "active" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"
                }`}
              >
                {item.status || "active"}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground/70">
            No treatments found. Click "Add New Treatment" to create one.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}