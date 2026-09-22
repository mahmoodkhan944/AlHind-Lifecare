import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Calendar } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const PAGE_SIZE = 15;

export default function AdminBlog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { toast } = useToast();

  const loadItems = () => {
    setLoading(true);
    db.entities.BlogPost.list("-created_date", 2000)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openNew = () => {
    setEditItem(null);
    setShowForm(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post? This action cannot be undone.")) return;
    const item = items.find((i) => i.id === id);
    await db.entities.BlogPost.delete(id);
    if (item?.cover_image_url) db.integrations.Core.DeleteFile(item.cover_image_url);
    if (item?.additional_images) {
      try {
        const gallery = JSON.parse(item.additional_images);
        if (Array.isArray(gallery)) gallery.forEach((url) => db.integrations.Core.DeleteFile(url));
      } catch {
        // not valid JSON — nothing to clean up
      }
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Deleted" });
  };

  const filtered = items.filter(
    (item) =>
      !search ||
      String(item.title || "").toLowerCase().includes(search.toLowerCase()) ||
      String(item.category || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (showForm) {
    return <BlogForm initialData={editItem} onCancel={closeForm} onSaved={() => { closeForm(); loadItems(); }} />;
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
        title="Blog Posts"
        subtitle="Manage your blog content"
        actions={
          <Button onClick={openNew} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Create New Post
          </Button>
        }
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blog posts..." className="pl-9 rounded-full" />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">All Posts</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent-jade/10 text-accent-jade">{filtered.length}</span>
        </div>

        <div className="divide-y">
          {paginated.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">{item.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {item.category && (
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
                      {item.category}
                    </span>
                  )}
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "published" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.status || "draft"}
                  </span>
                  {item.created_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(item.created_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="gap-1.5 rounded-lg">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="gap-1.5 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
          {paginated.length === 0 && (
            <div className="p-8 text-center text-muted-foreground/70">
              No blog posts found. Click "Create New Post" to create one.
            </div>
          )}
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}