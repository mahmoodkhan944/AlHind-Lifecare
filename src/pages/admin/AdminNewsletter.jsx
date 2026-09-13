import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Search, Trash2, Loader2, Download, UserPlus, Mail } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatCard from "@/components/admin/StatCard";

const PAGE_SIZE = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

export default function AdminNewsletter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const loadItems = () => {
    setLoading(true);
    db.entities.Newsletter.list("-created_date", 500)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadItems, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscriber? This action cannot be undone.")) return;
    await db.entities.Newsletter.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Subscriber deleted" });
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "subscribed" ? "unsubscribed" : "subscribed";
    await db.entities.Newsletter.update(item.id, { status: newStatus });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
    toast({ title: `Marked as ${newStatus}` });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      await db.entities.Newsletter.create({ email: newEmail.trim(), status: "subscribed" });
      toast({ title: "Subscriber added" });
      setNewEmail("");
      setAddOpen(false);
      loadItems();
    } catch (err) {
      toast({ title: "Couldn't add subscriber", description: err?.message, variant: "destructive" });
    }
    setAdding(false);
  };

  const exportCSV = () => {
    const csv = ["Email,Status,Subscribed Date"];
    filtered.forEach((i) => {
      csv.push(`${i.email},${i.status || "subscribed"},${new Date(i.created_date).toLocaleDateString()}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter((item) => {
    const matchesSearch = !search || String(item.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const now = Date.now();
  const thisWeek = items.filter((i) => i.created_date && now - new Date(i.created_date).getTime() <= 7 * DAY_MS).length;
  const thisMonth = items.filter((i) => i.created_date && now - new Date(i.created_date).getTime() <= 30 * DAY_MS).length;
  const activeCount = items.filter((i) => i.status === "subscribed").length;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div>
      <AdminPageHeader
        icon={Mail}
        title="Newsletter Subscribers"
        subtitle="Manage your email subscribers"
        actions={
          <>
            <Button onClick={exportCSV} variant="outline" className="gap-2 rounded-xl">
              <Download className="w-4 h-4" /> Export to CSV
            </Button>
            <Button onClick={() => setAddOpen(true)} className="gap-2 bg-accent-jade hover:bg-accent-jade/90 text-white rounded-xl">
              <UserPlus className="w-4 h-4" /> Add Subscriber
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Subscribers" value={items.length} color="blue" />
        <StatCard label="This Week" value={thisWeek} color="green" />
        <StatCard label="This Month" value={thisMonth} color="purple" />
        <StatCard label="Active Subscribers" value={activeCount} color="amber" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email..." className="pl-9 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "subscribed", label: "Active" },
            { value: "unsubscribed", label: "Unsubscribed" },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatusFilter(o.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === o.value ? "bg-foreground text-white" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">All Subscribers</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-accent-jade/10 text-accent-jade">{filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-muted">
                <th className="p-4 font-medium text-muted-foreground">Email</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Subscribed</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-muted">
                  <td className="p-4 font-medium text-foreground">{item.email}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${item.status === "subscribed" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"}`}
                    >
                      {item.status === "subscribed" ? "Active" : "Unsubscribed"}
                    </button>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.created_date ? new Date(item.created_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground/70">No subscribers found yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Subscriber</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adding} className="bg-accent-jade hover:bg-accent-jade/90 text-white">
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}