import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Trash2 } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 15;

const statuses = ["new", "contacted", "follow_up", "interested", "quotation_sent", "converted", "closed"];
const statusColors = { new: "bg-[#0B2E36]/10 text-[#0B2E36]", contacted: "bg-[#F0A202]/15 text-[#A6740A]", follow_up: "bg-[#D9662E]/15 text-[#B34F1F]", interested: "bg-[#0E8C7A]/12 text-[#0B6F60]", quotation_sent: "bg-[#8B3A5C]/12 text-[#8B3A5C]", converted: "bg-[#2F7D4F]/12 text-[#2F7D4F]", closed: "bg-muted text-muted-foreground" };

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const loadLeads = () => {
    setLoading(true);
    // FIX: limit was 100, which would silently cap the list once lead volume grows
    // past that. Raised, and now paginated client-side instead.
    db.entities.Lead.list("-created_date", 5000).then(setLeads).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(loadLeads, []);

  // Reset to page 1 whenever the status filter changes, so results never open on an empty page.
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  const updateStatus = async (id, status) => {
    await db.entities.Lead.update(id, { status });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected({ ...selected, status });
    toast({ title: "Status updated" });
  };

  const updateNotes = async (id, notes) => {
    await db.entities.Lead.update(id, { notes });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes } : l));
    toast({ title: "Notes saved" });
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead? This action cannot be undone.")) return;
    await db.entities.Lead.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
    toast({ title: "Lead deleted" });
  };

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">{filtered.length} leads</p>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((lead) => (
          <div key={lead.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">
                {lead.patient_name || "Unnamed"}
              </h3>
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setSelected(lead)} title="View details">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteLead(lead.id)} title="Delete">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {lead.treatment_interest && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium truncate max-w-full">
                {lead.treatment_interest}
              </span>
            )}

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="truncate">
                <span className="font-medium text-foreground/80">Email:</span> {lead.email || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground/80">Phone:</span> {lead.phone || "-"}
              </p>
              <p>
                <span className="font-medium text-foreground/80">Country:</span> {lead.country || "-"}
              </p>
            </div>

            <div className="mt-3">
              <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                <SelectTrigger className={`h-8 w-40 text-xs rounded-full border-0 ${statusColors[lead.status] || ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground/70">
            No leads found.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selected.patient_name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selected.phone || "-"}</p></div>
                <div><p className="text-muted-foreground">Country</p><p className="font-medium">{selected.country || "-"}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground">Treatment Interest</p><p className="font-medium">{selected.treatment_interest || "-"}</p></div>
                {selected.message && <div className="col-span-2"><p className="text-muted-foreground">Message</p><p className="font-medium">{selected.message}</p></div>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes</label>
                <Textarea defaultValue={selected.notes || ""} onBlur={(e) => updateNotes(selected.id, e.target.value)} placeholder="Add notes..." rows={3} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}