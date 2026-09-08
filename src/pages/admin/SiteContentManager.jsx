import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Info, Upload, X } from "lucide-react";
import * as Icons from "lucide-react";
import IconOrImage from "@/components/common/IconOrImage";

const emptyForm = { title: "", description: "", icon: "", link: "", image_url: "", sort_order: 0, status: "active" };

/**
 * Generic admin UI for editing db.entities.SiteContent (table `site_content_items`)
 * rows, grouped into tabs by `section`. Reused by both the homepage-focused
 * "Site Content" admin page and the "About Page" admin page — pass a
 * different `sections` list to each.
 */
export default function SiteContentManager({ title, description, sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.key);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconFileInputRef = useRef(null);
  const { toast } = useToast();

  const sectionMeta = sections.find((s) => s.key === activeSection);

  const loadItems = () => {
    setLoading(true);
    db.entities.SiteContent.filter({ section: activeSection }, "sort_order", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, [activeSection]);

  const openNew = () => {
    setEditItem(null);
    setForm({ ...emptyForm, sort_order: items.length + 1 });
    setShowForm(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...emptyForm, ...item });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    await db.entities.SiteContent.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const data = {
      section: activeSection,
      title: form.title,
      description: sectionMeta.hasDescription ? form.description || "" : null,
      icon: form.icon || "",
      link: sectionMeta.hasLink ? form.link || "" : null,
      image_url: sectionMeta.hasImage ? form.image_url || "" : null,
      sort_order: Number(form.sort_order) || 0,
      status: form.status || "active",
    };
    try {
      if (editItem) {
        await db.entities.SiteContent.update(editItem.id, data);
        toast({ title: "Updated successfully" });
      } else {
        await db.entities.SiteContent.create(data);
        toast({ title: "Created successfully" });
      }
      closeForm();
      loadItems();
    } catch (err) {
      toast({ title: "Failed to save", description: err?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, icon: file_url }));
    } catch (err) {
      toast({ title: "Icon upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingIcon(false);
    if (iconFileInputRef.current) iconFileInputRef.current.value = "";
  };

  // Renders the icon preview: an uploaded image, a matching lucide-react
  // icon name, or a neutral placeholder if neither matches.
  const IconPreview = ({ name }) => {
    if (!name) return <Info className="w-4 h-4 text-muted-foreground/50" />;
    if (/^https?:\/\//i.test(name) || name.startsWith("data:")) {
      return <img src={name} alt="" className="w-full h-full object-contain rounded" />;
    }
    const Cmp = Icons[name];
    if (!Cmp) return <Info className="w-4 h-4 text-muted-foreground/50" />;
    return <Cmp className="w-4 h-4 text-primary" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === s.key
                ? "bg-accent-jade text-white"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sectionMeta.singleton && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            This block only shows one row on the page — the first <strong>active</strong> item (by sort order). Add a
            second row only if you want to swap between drafts; keep just one <strong>active</strong> at a time.
          </span>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm max-w-xl">
          <h3 className="font-bold text-foreground text-base mb-4">
            {editItem ? "Edit" : "Add"} {sectionMeta.label} Item
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">
                {sectionMeta.titleLabel || "Title"} <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Cardiology"
                className="h-10 rounded-lg border-border"
              />
            </div>

            {sectionMeta.hasDescription && (
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">{sectionMeta.descLabel || "Description"}</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for this step"
                  className="rounded-lg border-border"
                  rows={sectionMeta.descLabel?.includes("one per line") ? 5 : 2}
                />
              </div>
            )}

            {sectionMeta.hasImage && (
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">Image URL</label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="h-10 rounded-lg border-border"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="" className="mt-2 w-16 h-16 rounded-lg object-cover border border-border" />
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1.5">Icon</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-muted shrink-0 overflow-hidden">
                  <IconPreview name={form.icon} />
                </div>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value.trim() })}
                  placeholder="e.g. HeartPulse, or upload an image"
                  className="h-10 rounded-lg border-border flex-1"
                />
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg shrink-0 gap-1.5"
                  disabled={uploadingIcon}
                  onClick={() => iconFileInputRef.current?.click()}
                >
                  {uploadingIcon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                </Button>
                {form.icon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 shrink-0 text-muted-foreground"
                    onClick={() => setForm({ ...form, icon: "" })}
                    aria-label="Remove icon"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Either type an exact{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  lucide-react
                </a>{" "}
                icon name (case-sensitive, e.g. "HeartPulse", "Stethoscope") or upload your own icon image.
              </p>
            </div>

            {sectionMeta.hasLink && (
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">{sectionMeta.linkLabel || "Link (optional)"}</label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder={sectionMeta.linkPlaceholder || "/treatments"}
                  className="h-10 rounded-lg border-border"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">Sort Order</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="h-10 rounded-lg border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-1.5">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-10 rounded-lg border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeForm} className="rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="rounded-lg bg-accent-jade hover:bg-accent-jade/90 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-10 text-center text-muted-foreground/70">
              No items yet for "{sectionMeta.label}". Click "Add Item" to create one — or run the seed SQL to
              pre-fill this list.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-muted">
                      <th className="p-3 w-8"></th>
                      <th className="p-3 font-medium text-muted-foreground">Icon</th>
                      <th className="p-3 font-medium text-muted-foreground">Title</th>
                      {sectionMeta.hasDescription && <th className="p-3 font-medium text-muted-foreground">Description</th>}
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted">
                        <td className="p-3 text-muted-foreground/50">
                          <GripVertical className="w-4 h-4" />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border overflow-hidden">
                            <IconPreview name={item.icon} />
                          </div>
                        </td>
                        <td className="p-3 font-medium text-foreground">{item.title}</td>
                        {sectionMeta.hasDescription && (
                          <td className="p-3 text-muted-foreground max-w-[240px] truncate">{item.description || "-"}</td>
                        )}
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "active" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.status || "active"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}