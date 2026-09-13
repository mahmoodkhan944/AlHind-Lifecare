import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, Users, Filter } from "lucide-react";
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
  { key: "rating", label: "Rating (0-5)", type: "number", example: 4.8 },
  { key: "specializations", label: "Specializations (separate with |)", type: "list", example: "Heart Surgery | Angioplasty" },
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

  const filtered = items.filter((item) =>
    !search || String(item.name || "").toLowerCase().includes(search.toLowerCase()) || String(item.speciality || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = items.filter((i) => (i.status || "active") === "active").length;

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAllOnPage = () => {
    const allSelected = paginated.every((i) => selected.has(i.id));
    setSelected((prev) => {
      const next = new Set(prev);
      paginated.forEach((i) => (allSelected ? next.delete(i.id) : next.add(i.id)));
      return next;
    });
  };

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

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">All Doctors</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent-jade/10 text-accent-jade">{filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-muted">
                <th className="p-4 w-8">
                  <Checkbox
                    checked={paginated.length > 0 && paginated.every((i) => selected.has(i.id))}
                    onCheckedChange={toggleSelectAllOnPage}
                  />
                </th>
                <th className="p-4 font-medium text-muted-foreground">Sr No</th>
                <th className="p-4 font-medium text-muted-foreground">Doctor</th>
                <th className="p-4 font-medium text-muted-foreground">Hospital</th>
                <th className="p-4 font-medium text-muted-foreground">Categories</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((item, i) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="p-4">
                    <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="p-4 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/70 text-xs font-bold">
                          {String(item.name || "D").charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        {item.featured && <span className="text-xs text-accent-jade font-medium">★ Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.hospital_name || "-"}</td>
                  <td className="p-4 text-muted-foreground">{item.speciality || "-"}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "active" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"}`}>
                      {item.status || "active"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={liveUrl(item)} target="_blank" rel="noopener noreferrer" title="View live page">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground/70">No doctors found. Click "Add New Doctor" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}