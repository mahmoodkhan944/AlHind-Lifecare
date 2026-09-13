import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, Copy, Star } from "lucide-react";
import HospitalForm from "@/components/admin/HospitalForm";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 15;

const HOSPITAL_BULK_COLUMNS = [
  { key: "name", label: "Name", type: "text", example: "Apollo Hospitals" },
  { key: "cover_image_url", label: "Cover Image URL", type: "text", example: "" },
  { key: "hospital_type", label: "Hospital Type", type: "text", example: "Multi-Specialty" },
  { key: "address", label: "Full Address", type: "text", example: "" },
  { key: "city", label: "City", type: "text", example: "New Delhi" },
  { key: "state", label: "State", type: "text", example: "Delhi" },
  { key: "country", label: "Country (India/Turkey)", type: "text", example: "India" },
  { key: "beds_count", label: "Number of Beds", type: "number", example: 500 },
  { key: "established_year", label: "Year Established", type: "number", example: 1983 },
  { key: "rating", label: "Rating (0-5)", type: "number", example: 4.5 },
  { key: "reviews_count", label: "Review Count", type: "number", example: 120 },
  { key: "description", label: "Short Description", type: "text", example: "" },
  { key: "full_description", label: "Full Description (separate with |)", type: "list", example: "Paragraph one | Paragraph two" },
  { key: "hospital_owner", label: "Hospital Owner / Chairman", type: "text", example: "" },
  { key: "contact_email", label: "Contact Email", type: "text", example: "" },
  { key: "contact_phone", label: "Contact Phone", type: "text", example: "" },
  { key: "website", label: "Website", type: "text", example: "" },
  { key: "specialities", label: "Specialities (separate with |)", type: "list", example: "Cardiology | Oncology" },
  { key: "facilities", label: "Facilities (separate with |)", type: "list", example: "ICU | 24/7 Pharmacy | Blood Bank" },
  { key: "accreditations", label: "Accreditations (separate with |)", type: "list", example: "JCI | NABH" },
  { key: "emergency_services", label: "Emergency Services (yes/no)", type: "boolean", example: "yes" },
  { key: "parking_available", label: "Parking Available (yes/no)", type: "boolean", example: "yes" },
  { key: "featured", label: "Featured (yes/no)", type: "boolean", example: "no" },
  { key: "status", label: "Status (active/inactive)", type: "text", example: "active" },
];

const HOSPITAL_BULK_DEFAULTS = {
  name: (i) => `Untitled Hospital ${i}`,
  city: "N/A",
};

export default function AdminHospitals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { toast } = useToast();

  const loadItems = () => {
    setLoading(true);
    // FIX: limit was 100, which would silently cap the list once the roster grows
    // past that. Raised, and now paginated client-side instead.
    db.entities.Hospital.list("-created_date", 2000)
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
    if (!window.confirm("Delete this hospital? This action cannot be undone.")) return;
    await db.entities.Hospital.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const liveUrl = (item) => `${window.location.origin}${import.meta.env.BASE_URL}hospitals/${item.id}`;

  const copyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(liveUrl(item));
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const filtered = items.filter((item) =>
    !search || String(item.name || "").toLowerCase().includes(search.toLowerCase()) || String(item.city || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (showForm) {
    return <HospitalForm initialData={editItem} onCancel={closeForm} onSaved={() => { closeForm(); loadItems(); }} />;
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hospitals..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <BulkUploadDialog
            entityLabel="Hospitals"
            entity={db.entities.Hospital}
            columns={HOSPITAL_BULK_COLUMNS}
            requiredDefaults={HOSPITAL_BULK_DEFAULTS}
            onImported={loadItems}
          />
          <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Add New Hospital
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/70 text-xs font-bold shrink-0">
                    {String(item.name || "H").charAt(0)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                  <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">{item.name}</h3>
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
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

            {item.city && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
                {item.city}{item.country ? `, ${item.country}` : ""}
              </span>
            )}

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/80">Beds:</span> {item.beds_count || "-"}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs">
              <span className="font-medium text-foreground/80 shrink-0">Live URL:</span>
              <a href={liveUrl(item)} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate">
                {liveUrl(item)}
              </a>
              <button type="button" onClick={() => copyUrl(item)} className="text-muted-foreground hover:text-foreground shrink-0" title="Copy link">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

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
            No hospitals found. Click "Add New Hospital" to create one.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}