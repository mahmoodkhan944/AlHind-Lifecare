import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Upload, Loader2 } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatCard from "@/components/admin/StatCard";
import { activeFirst } from "@/lib/listOrder";

const PAGE_SIZE = 15;

export default function EntityManager({
  entityName,
  fields,
  displayField = "name",
  cardView = false,
  renderCard,
  // Optional richer header/stats/filter UI (used by FAQs, Testimonials, etc).
  // Falls back to the plain search-bar-only header when these are omitted,
  // so existing callers are unaffected.
  icon,
  pageTitle,
  subtitle,
  addLabel,
  searchPlaceholder,
  computeStats, // (items) => [{ label, value, color, icon?, dot? }]
  filterField, // e.g. "status" or "category"
  filterOptions, // [{ value, label }] — "All" is added automatically
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const { toast } = useToast();

  const entity = db.entities[entityName];

  const loadItems = () => {
    setLoading(true);
    // FIX: limit was 100, which would silently cap the list once an entity's
    // records grow past that. Raised, and now paginated client-side instead.
    // Newest first; inactive / rejected / cancelled at the bottom.
    entity.list("-created_date", 2000).then((rows) => setItems(activeFirst(rows))).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(loadItems, [entityName]);

  // Reset to page 1 whenever the search or filter changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, filterValue]);

  // New records start with each field's `default` (e.g. a testimonial added by
  // the admin starts as "approved" so it shows on the website straight away).
  const openNew = () => {
    setEditItem(null);
    setForm(Object.fromEntries(fields.filter((f) => f.default !== undefined).map((f) => [f.key, f.default])));
    setDialogOpen(true);
  };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true); };

  const handleSave = async () => {
    const missing = fields.filter((f) => f.required && (form[f.key] === undefined || String(form[f.key]).trim() === ""));
    if (missing.length > 0) {
      toast({ title: `Please fill in: ${missing.map((f) => f.label).join(", ")}`, variant: "destructive" });
      return;
    }
    const data = {};
    fields.forEach((f) => {
      const v = form[f.key];
      if (v !== undefined && v !== "") {
        // FIX: number fields now hold the raw string while typing (see renderField),
        // so convert to an actual number here at save time instead of on every keystroke.
        data[f.key] = f.type === "number" ? Number(v) : v;
      } else if (editItem && editItem[f.key] != null && editItem[f.key] !== "") {
        // A field the admin cleared while editing — actually clear it, instead
        // of silently keeping the old value.
        data[f.key] = null;
      }
    });
    setSaving(true);
    try {
      if (editItem) {
        await entity.update(editItem.id, data);
        toast({ title: "Updated successfully" });
      } else {
        await entity.create(data);
        toast({ title: "Created successfully" });
      }
      setDialogOpen(false);
      loadItems();
    } catch (err) {
      // Previously a failed save threw silently and the dialog just stayed open.
      toast({ title: "Couldn't save", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    setUploadingKey(field.key);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, [field.key]: file_url }));
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingKey(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${entityName.toLowerCase()}? This action cannot be undone.`)) return;
    await entity.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const filtered = items.filter((item) => {
    const matchesSearch = !search || String(item[displayField] || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filterField || filterValue === "all" || String(item[filterField] ?? "").toLowerCase() === filterValue.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderField = (field) => {
    const val = form[field.key] ?? "";
    if (field.type === "select") {
      return (
        <Select value={val} onValueChange={(v) => setForm({ ...form, [field.key]: v })}>
          <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
          <SelectContent>{field.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      );
    }
    if (field.type === "textarea") return <Textarea value={val} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.label} rows={4} />;
    if (field.type === "boolean") return <Switch checked={!!val} onCheckedChange={(v) => setForm({ ...form, [field.key]: v })} />;
    if (field.type === "number") return <Input type="number" value={val} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.label} />;
    if (field.type === "image") {
      return (
        <div className="flex items-center gap-2">
          {val ? <img src={val} alt="" className="w-10 h-10 rounded-full object-cover border shrink-0" /> : null}
          <Input value={val} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder="Paste a URL or upload" className="min-w-0" />
          <label className="shrink-0 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(field, e.target.files?.[0]); e.target.value = ""; }} />
            <span className="flex items-center gap-1 h-10 px-3 rounded-md border text-sm hover:bg-muted">
              {uploadingKey === field.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
            </span>
          </label>
        </div>
      );
    }
    return <Input value={val} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.label} />;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const useRichHeader = !!(pageTitle || computeStats || filterField);
  const stats = computeStats ? computeStats(items) : null;

  return (
    <div>
      {useRichHeader ? (
        <AdminPageHeader
          icon={icon}
          title={pageTitle || entityName}
          subtitle={subtitle}
          actions={
            <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
              <Plus className="w-4 h-4" /> {addLabel || `Add ${entityName}`}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div className="relative w-full sm:flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder || `Search ${entityName}s...`} className="pl-9" />
          </div>
          <Button onClick={openNew} className="gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shrink-0">
            <Plus className="w-4 h-4" /> {addLabel || `Add ${entityName}`}
          </Button>
        </div>
      )}

      {stats && stats.length > 0 && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ${
            { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[Math.min(stats.length, 4)] || "md:grid-cols-4"
          }`}
        >
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {useRichHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder || `Search ${entityName}s...`} className="pl-9 rounded-full" />
          </div>
          {filterField && filterOptions && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterValue("all")}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterValue === "all" ? "bg-foreground text-white" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
              >
                All
              </button>
              {filterOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setFilterValue(o.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterValue === o.value ? "bg-foreground text-white" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {cardView && renderCard ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map((item) => renderCard(item, { openEdit, handleDelete }))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground/70">
              No items found
            </div>
          )}
        </div>
      ) : (
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-muted/30">
                {fields.filter((f) => f.showInList).map((f) => (
                  <th key={f.key} className="p-4 font-medium text-muted-foreground">{f.label}</th>
                ))}
                <th className="p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  {fields.filter((f) => f.showInList).map((f) => (
                    <td key={f.key} className="p-4 max-w-[200px] truncate">
                      {f.type === "boolean" ? (item[f.key] ? "✓" : "—") : (String(item[f.key] ?? "-"))}
                    </td>
                  ))}
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={99} className="p-8 text-center text-muted-foreground">No items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      )}
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Add"} {entityName}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-sm font-medium mb-1.5 block">
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-secondary text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}