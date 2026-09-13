import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Trash2, MessageCircle, Mail, Phone, MapPin, Download, Inbox } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatCard from "@/components/admin/StatCard";

const PAGE_SIZE = 15;

const statuses = ["new", "contacted", "follow_up", "interested", "quotation_sent", "converted", "closed"];
const statusColors = { new: "bg-[#0B2E36]/10 text-[#0B2E36]", contacted: "bg-[#F0A202]/15 text-[#A6740A]", follow_up: "bg-[#D9662E]/15 text-[#B34F1F]", interested: "bg-[#0E8C7A]/12 text-[#0B6F60]", quotation_sent: "bg-[#8B3A5C]/12 text-[#8B3A5C]", converted: "bg-[#2F7D4F]/12 text-[#2F7D4F]", closed: "bg-muted text-muted-foreground" };
const statusLabel = (s) => s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

// WhatsApp deep link needs just digits (country code + number, no spaces/symbols).
const whatsappLink = (phone) => `https://wa.me/${String(phone || "").replace(/[^\d]/g, "")}`;

const toCsvValue = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const loadLeads = () => {
    setLoading(true);
    db.entities.Lead.list("-created_date", 5000).then(setLeads).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(loadLeads, []);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, search]);

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

  const exportCsv = () => {
    const header = ["Name", "Email", "Phone", "Country", "Treatment Interest", "Status", "Created"];
    const rows = filtered.map((l) => [l.patient_name, l.email, l.phone, l.country, l.treatment_interest, l.status, l.created_date]);
    const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => {
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !search || [l.patient_name, l.email, l.phone, l.country].some((v) => String(v || "").toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <AdminPageHeader
        icon={Inbox}
        title="Inquiries"
        subtitle="Manage patient inquiries from the website"
        actions={
          <Button variant="outline" onClick={exportCsv} className="gap-2 rounded-xl">
            <Download className="w-4 h-4" /> Export to CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Inquiries" value={leads.length} color="blue" />
        <StatCard label="New" value={leads.filter((l) => l.status === "new").length} color="green" />
        <StatCard label="Contacted" value={leads.filter((l) => l.status === "contacted").length} color="amber" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by name, email, phone, or country..."
            className="w-full h-10 pl-4 pr-4 rounded-full border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === "all" ? "bg-foreground text-white" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? "bg-foreground text-white" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((lead) => (
          <div key={lead.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">
                  {lead.patient_name || "Unnamed"}
                </h3>
                {lead.status === "new" && (
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase shrink-0">
                    New
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {lead.email || "-"}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {lead.phone || "-"}
              </p>
              {lead.country && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {lead.country}
                </p>
              )}
            </div>

            {lead.treatment_interest && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground/80">Treatment Interest:</p>
                <p className="text-sm text-muted-foreground">{lead.treatment_interest}</p>
              </div>
            )}

            <div className="mt-3">
              <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                <SelectTrigger className={`h-8 w-40 text-xs rounded-full border-0 ${statusColors[lead.status] || ""}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setSelected(lead)} className="gap-1.5 rounded-lg">
                <Eye className="w-3.5 h-3.5" /> View Details
              </Button>
              {lead.phone && (
                <Button variant="outline" size="sm" asChild className="gap-1.5 rounded-lg">
                  <a href={whatsappLink(lead.phone)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => deleteLead(lead.id)} title="Delete">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground/70">
            No inquiries found.
          </div>
        )}
      </div>
      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Inquiry Details</DialogTitle></DialogHeader>
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