import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 15;

export default function EntityManager({ entityName, fields, displayField = "name" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const entity = db.entities[entityName];

  const loadItems = () => {
    setLoading(true);
    // FIX: limit was 100, which would silently cap the list once an entity's
    // records grow past that. Raised, and now paginated client-side instead.
    entity.list("-created_date", 2000).then(setItems).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(loadItems, [entityName]);

  // Reset to page 1 whenever the search changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const openNew = () => { setEditItem(null); setForm({}); setDialogOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setDialogOpen(true); };

  const handleSave = async () => {
    const data = {};
    fields.forEach((f) => {
      if (form[f.key] !== undefined && form[f.key] !== "") {
        // FIX: number fields now hold the raw string while typing (see renderField),
        // so convert to an actual number here at save time instead of on every keystroke.
        data[f.key] = f.type === "number" ? Number(form[f.key]) : form[f.key];
      }
    });
    if (editItem) {
      await entity.update(editItem.id, data);
      toast({ title: "Updated successfully" });
    } else {
      await entity.create(data);
      toast({ title: "Created successfully" });
    }
    setDialogOpen(false);
    loadItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${entityName.toLowerCase()}? This action cannot be undone.`)) return;
    await entity.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const filtered = items.filter((item) =>
    !search || String(item[displayField] || "").toLowerCase().includes(search.toLowerCase())
  );
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
    return <Input value={val} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.label} />;
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${entityName}s...`} className="pl-9" />
        </div>
        <Button onClick={openNew} className="gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shrink-0">
          <Plus className="w-4 h-4" /> Add {entityName}
        </Button>
      </div>

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
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Add"} {entityName}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary text-white">
              {editItem ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}