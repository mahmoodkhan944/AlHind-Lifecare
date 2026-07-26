import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Loader2, Upload, ImageIcon, Save, X } from "lucide-react";
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
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const CATEGORIES = [
  "General Health",
  "Cardiology",
  "Oncology",
  "Orthopedics",
  "IVF & Fertility",
  "Cosmetic Surgery",
  "Wellness & Prevention",
  "Patient Stories",
  "Medical Tourism Tips",
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote"],
    ["link"],
    ["clean"],
  ],
};

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function BlogForm({ initialData, onCancel, onSaved }) {
  const { toast } = useToast();
  const isEdit = !!initialData;

  const [form, setForm] = useState(() => {
    if (!initialData) {
      return {
        publication_date: new Date().toISOString().slice(0, 10),
        author: "Admin",
        status: "draft",
      };
    }
    return {
      ...initialData,
      key_points: parseList(initialData.key_points),
      additional_images: parseList(initialData.additional_images),
      publication_date: initialData.publication_date
        ? String(initialData.publication_date).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    };
  });
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleFeaturedImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFeatured(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("cover_image_url", file_url);
      toast({ title: "Featured image uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingFeatured(false);
    e.target.value = "";
  };

  const handleAdditionalImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAdditional(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      set("additional_images", [...(form.additional_images || []), file_url]);
      toast({ title: "Image added" });
    } catch (err) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    }
    setUploadingAdditional(false);
    e.target.value = "";
  };

  const removeAdditionalImage = (idx) => {
    set(
      "additional_images",
      (form.additional_images || []).filter((_, i) => i !== idx)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast({ title: "Blog Title is required", variant: "destructive" });
      return;
    }
    if (!form.excerpt) {
      toast({ title: "Excerpt is required", variant: "destructive" });
      return;
    }
    if (!form.category) {
      toast({ title: "Category is required", variant: "destructive" });
      return;
    }
    if (!form.publication_date) {
      toast({ title: "Publication Date is required", variant: "destructive" });
      return;
    }
    if (!form.content || form.content === "<p><br></p>") {
      toast({ title: "Main Content is required", variant: "destructive" });
      return;
    }
    if (!isEdit && !form.cover_image_url) {
      toast({ title: "Featured Image is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const slug = form.slug || slugify(form.title);

    const data = {
      ...form,
      slug,
      status: form.status || "draft",
      featured: !!form.featured,
      key_points: JSON.stringify(form.key_points || []),
      additional_images: JSON.stringify(form.additional_images || []),
    };

    try {
      if (isEdit) {
        await db.entities.BlogPost.update(initialData.id, data);
        toast({ title: "Blog post updated successfully" });
      } else {
        await db.entities.BlogPost.create(data);
        toast({ title: "Blog post created successfully" });
      }
      onSaved();
    } catch (err) {
      toast({
        title: "Failed to save blog post",
        description: err?.message,
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const excerptLen = (form.excerpt || "").length;

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-muted -m-4 sm:-m-6 lg:-m-8">
      {/* Sub-header */}
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
            {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEdit ? "Update this blog article" : "Write and publish a new blog article"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4 pb-28">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Basic Information</h3>
          <div className="space-y-3">
            <Field label="Blog Title" required>
              <Input
                value={form.title || ""}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter your blog title"
                className="h-10 rounded-lg border-border"
              />
            </Field>

            <Field label="URL Slug">
              <Input
                value={form.slug || ""}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="Auto-generated from title"
                className="h-10 rounded-lg border-border"
              />
              <p className="text-xs text-muted-foreground/70 mt-1">Leave empty to auto-generate from title</p>
            </Field>

            <Field label="Excerpt" required>
              <Textarea
                value={form.excerpt || ""}
                onChange={(e) => set("excerpt", e.target.value.slice(0, 300))}
                placeholder="Short description for blog preview..."
                className="rounded-lg border-border min-h-[80px]"
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground/70 mt-1">{excerptLen}/300 characters</p>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Category" required>
                <Select value={form.category || ""} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="h-10 rounded-lg border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Author">
                <Input
                  value={form.author || ""}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="Admin"
                  className="h-10 rounded-lg border-border"
                />
              </Field>
            </div>

            <Field label="Publication Date" required>
              <Input
                type="date"
                value={form.publication_date || ""}
                onChange={(e) => set("publication_date", e.target.value)}
                className="h-10 rounded-lg border-border"
              />
            </Field>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-1">Content</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Use the editor below to write your blog. You can paste content directly from Microsoft Word
            or a PDF — headings, bold, lists, and other formatting will be preserved automatically.
          </p>
          <Field label="Main Content" required>
            <div className="rounded-lg border border-border overflow-hidden bg-white">
              <ReactQuill
                theme="snow"
                value={form.content || ""}
                onChange={(html) => set("content", html)}
                modules={QUILL_MODULES}
                placeholder="Start writing your blog content here. You can paste from Word or PDF..."
              />
            </div>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Tip: You can paste content directly from Microsoft Word or PDF — formatting (headings, bold,
              lists) will be preserved automatically.
            </p>
          </Field>
        </div>

        {/* Key Points / Bullets */}
        <DynamicListField
          label="Key Points / Bullets"
          placeholder="Key point"
          optional
          values={form.key_points}
          onChange={(v) => set("key_points", v)}
          buttonAtTop
          darkButton
          addLabel="Add Point"
        />

        {/* Images */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Images</h3>
          <div className="space-y-4">
            <Field label="Featured Image" required>
              {form.cover_image_url ? (
                <div className="relative">
                  <img
                    src={form.cover_image_url}
                    alt="Featured"
                    className="w-full h-44 rounded-lg object-cover border border-border"
                  />
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFeaturedImage} className="hidden" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 border border-border text-xs font-medium text-foreground/80 hover:bg-white">
                      {uploadingFeatured ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {uploadingFeatured ? "Uploading..." : "Change"}
                    </div>
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" onChange={handleFeaturedImage} className="hidden" />
                  <div className="flex flex-col items-center justify-center gap-1.5 py-8 rounded-lg border-2 border-dashed border-border hover:bg-muted transition-colors">
                    {uploadingFeatured ? (
                      <Loader2 className="w-7 h-7 text-accent-jade animate-spin" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
                    )}
                    <p className="text-sm font-medium text-muted-foreground">
                      {uploadingFeatured ? (
                        "Uploading..."
                      ) : (
                        <>
                          <span className="text-accent-jade">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground/70">PNG, JPG up to 10MB</p>
                  </div>
                </label>
              )}
            </Field>

            <Field label="Additional Images" optional>
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.additional_images || []).map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" onChange={handleAdditionalImage} className="hidden" />
                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-border text-muted-foreground text-xs font-medium hover:bg-muted transition-colors">
                  {uploadingAdditional ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {uploadingAdditional ? "Uploading..." : "Add an image"}
                </div>
              </label>
            </Field>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">
            SEO <span className="text-muted-foreground/70 font-normal text-xs">(Optional)</span>
          </h3>
          <div className="space-y-3">
            <Field label="SEO Title" optional>
              <Input
                value={form.seo_title || ""}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="Custom title for search engines"
                className="h-10 rounded-lg border-border"
              />
            </Field>
            <Field label="SEO Description" optional>
              <Textarea
                value={form.seo_description || ""}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder="Custom description for search engines"
                className="rounded-lg border-border min-h-[70px]"
                rows={2}
              />
            </Field>
          </div>
        </div>

        {/* Status & Settings */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">Status &amp; Settings</h3>
          <div className="space-y-4">
            <Field label="Status">
              <Select value={form.status || "draft"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-10 rounded-lg border-border w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/80">Featured Blog</label>
              <Switch checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-border px-4 sm:px-6 py-3 flex items-center justify-end gap-3 z-30">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg px-6">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-lg px-6 bg-accent-jade hover:bg-accent-jade/90 text-white gap-2">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> {isEdit ? "Update Blog" : "Create Blog"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, optional, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/80 block mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {optional && <span className="text-muted-foreground/70 font-normal text-xs ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  );
}