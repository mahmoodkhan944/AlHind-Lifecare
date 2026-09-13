import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, Copy, Star, Users, Filter } from "lucide-react";
import DoctorForm from "@/components/admin/DoctorForm";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatCard from "@/components/admin/StatCard";

const PAGE_SIZE = 15;

const DOCTOR_BULK_COLUMNS = [
  { key: "name", label: "Name", type: "text", example: "Dr John Smith" },
  { key: "speciality", label: "Speciality", type: "text", example: "Cardiology" },
  { key: "designation", label: "Designation", type: "text", example: "Senior Consultant" },
  { key: "hospital_name", label: "Hospital", type: "text", example: "Apollo Hospitals, New Delhi" },
  { key: "country", label: "Country (India/Turkey)", type: "text", example: "India" },
  { key: "city", label: "City", type: "text", example: "New Delhi" },
  { key: "experience_years", label: "Experience (Years)", type: "number", example: 15 },
  { key: "consultation_fee_usd", label: "Consultation Fee (USD)", type: "number", example: 50 },
  { key: "languages", label: "Languages", type: "text", example: "English, Hindi" },
  { key: "photo_url", label: "Photo URL", type: "text", example: "" },
  { key: "overview", label: "Overview", type: "text", example: "Brief bio about the doctor..." },
  { key: "detailed_experience", label: "Detailed Experience", type: "text", example: "" },
  { key: "rating", label: "Rating (0-5)", type: "number", example: 4.8 },
  { key: "specializations", label: "Specializations (separate with |)", type: "list", example: "Heart Surgery | Angioplasty" },
  { key: "treatments_list", label: "Treatments Offered (separate with |)", type: "list", example: "Bypass Surgery | Valve Replacement" },
  { key: "qualifications_list", label: "Qualifications (separate with |)", type: "list", example: "MBBS - AIIMS | MD Cardiology" },
  { key: "why_choose_doctor", label: "Why Choose This Doctor (separate with |)", type: "list", example: "20+ years experience | Internationally trained" },
  { key: "featured", label: "Featured (yes/no)", type: "boolean", example: "no" },
  { key: "status", label: "Status (active/inactive)", type: "text", example: "active" },
];

const DOCTOR_BULK_DEFAULTS = {
  name: (i) => `Untitled Doctor ${i}`,
  speciality: "General",
};

export default function AdminDoctors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const { toast } = useToast();

  const loadItems = () => {
    setLoading(true);
    db.entities.Doctor.list("-created_date", 2000)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openNew = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doctor? This action cannot be undone.")) return;
    await db.entities.Doctor.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    toast({ title: "Deleted" });
  };

  const liveUrl = (item) => `${window.location.origin}${import.meta.env.BASE_URL}doctors/${item.id}`;

  const copyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(liveUrl(item));
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected doctor${selected.size > 1 ? "s" : ""}? This action cannot be undone.`)) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => db.entities.Doctor.delete(id).catch(() => {})));
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    toast({ title: `${ids.length} doctor${ids.length > 1 ? "s" : ""} deleted` });
  };

  const filtered = items.filter((item) =>
    !search || String(item.name || "").toLowerCase().includes(search.toLowerCase()) || String(item.speciality || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = items.filter((i) => (i.status || "active") === "active").length;

  if (showForm) {
    return <DoctorForm initialData={editItem} onCancel={closeForm} onSaved={() => { closeForm(); loadItems(); }} />;
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
      <AdminPageHeader
        icon={Users}
        title="Doctors Management"
        subtitle="Add, edit, or remove doctor profiles"
        actions={
          <>
            <BulkUploadDialog
              entityLabel="Doctors"
              entity={db.entities.Doctor}
              columns={DOCTOR_BULK_COLUMNS}
              requiredDefaults={DOCTOR_BULK_DEFAULTS}
              onImported={loadItems}
            />
            <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
              <Plus className="w-4 h-4" /> Add New Doctor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Doctors" value={items.length} color="blue" icon={Users} />
        <StatCard label="Active" value={activeCount} color="green" dot />
        <StatCard label="Selected" value={`${selected.size} items`} color="purple" />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by doctor name or hospital..." className="pl-9 rounded-full" />
        </div>
        <Button variant="outline" className="gap-2 rounded-full shrink-0">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <span className="text-sm font-medium text-foreground">
            {selected.size} doctor{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-1.5 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-foreground">All Doctors</span>
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent-jade/10 text-accent-jade">{filtered.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => toggleSelect(item.id)}
                  className={`w-5 h-5 rounded border shrink-0 mt-2.5 cursor-pointer flex items-center justify-center ${
                    selected.has(item.id) ? "bg-accent-jade border-accent-jade" : "border-border"
                  }`}
                  title="Select"
                >
                  {selected.has(item.id) && <span className="w-2 h-2 rounded-sm bg-white" />}
                </div>
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/70 text-xs font-bold shrink-0">
                    {String(item.name || "D").charAt(0)}
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

            {item.speciality && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
                {item.speciality}
              </span>
            )}

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="truncate">
                <span className="font-medium text-foreground/80">Hospital:</span> {item.hospital_name || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground/80">Experience:</span>{" "}
                {item.experience_years ? `${item.experience_years} yrs` : "-"}
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
            No doctors found. Click "Add New Doctor" to create one.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}