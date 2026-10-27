import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, Copy, Star, Package, MapPin, Building2 } from "lucide-react";
import PackageForm from "@/components/admin/PackageForm";
import AdminPagination from "@/components/admin/AdminPagination";
import { formatPrice, discountPercent, packagePath, parseList } from "@/lib/packageUtils";

const PAGE_SIZE = 15;

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [hospitalNames, setHospitalNames] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { toast } = useToast();

  const loadItems = () => {
    setLoading(true);
    db.entities.Package.list("-created_date", 2000)
      .then(setItems)
      .catch((err) =>
        toast({
          title: "Couldn't load packages",
          description: /packages/.test(err?.message || "")
            ? "The packages table is missing. Run supabase/migrations/003_packages.sql in Supabase."
            : err?.message,
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    db.entities.Hospital.list("name", 2000)
      .then((hs) => setHospitalNames(new Map(hs.map((h) => [h.id, h.name]))))
      .catch(() => {});
  }, []);

  useEffect(() => setPage(1), [search]);

  const openNew = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await db.entities.Package.delete(item.id);
      [item.image_url, ...parseList(item.gallery_images)].filter(Boolean).forEach((url) => db.integrations.Core.DeleteFile(url));
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({ title: "Package deleted" });
    } catch (err) {
      toast({ title: "Couldn't delete", description: err?.message, variant: "destructive" });
    }
  };

  const liveUrl = (item) => `${window.location.origin}${import.meta.env.BASE_URL}${packagePath(item).slice(1)}`;

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  const q = search.toLowerCase();
  const filtered = items.filter(
    (item) =>
      !q ||
      [item.title, item.category, item.city, item.country, hospitalNames.get(item.hospital_id)]
        .some((v) => String(v || "").toLowerCase().includes(q))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (showForm) {
    return <PackageForm initialData={editItem} onCancel={closeForm} onSaved={() => { closeForm(); loadItems(); }} />;
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." className="pl-9" />
        </div>
        <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
          <Plus className="w-4 h-4" /> Add New Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((item) => {
          const discount = discountPercent(item);
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-border p-4 flex gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-7 h-7 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {item.category && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-jade truncate">{item.category}</p>
                    )}
                    <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2 flex items-start gap-1">
                      {item.featured && <Star className="w-3.5 h-3.5 mt-0.5 text-amber-500 fill-amber-500 shrink-0" />}
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex shrink-0 -mr-2 -mt-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={liveUrl(item)} target="_blank" rel="noopener noreferrer" title="View live page">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyUrl(liveUrl(item))} title="Copy link">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} title="Delete">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                  {hospitalNames.get(item.hospital_id) && (
                    <span className="flex items-center gap-1 min-w-0"><Building2 className="w-3 h-3 shrink-0" /><span className="truncate">{hospitalNames.get(item.hospital_id)}</span></span>
                  )}
                  {(item.city || item.country) && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[item.city, item.country].filter(Boolean).join(", ")}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.original_price, item.currency)}</span>}
                  <span className="font-heading font-bold text-secondary">{formatPrice(item.price, item.currency)}</span>
                  {discount > 0 && <span className="px-1.5 py-0.5 rounded bg-accent-jade/10 text-accent-jade text-[10px] font-bold">-{discount}%</span>}
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      item.status === "inactive" ? "bg-muted text-muted-foreground" : "bg-accent-jade/10 text-accent-jade"
                    }`}
                  >
                    {item.status || "active"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground/70">
            No packages yet. Click "Add New Package" to create one.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}