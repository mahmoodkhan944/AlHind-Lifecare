import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Users, Clock, CheckCircle2, DollarSign, FileText,
  Phone, Mail, MapPin, Calendar, MessageSquare,
} from "lucide-react";

const statuses = [
  { value: "new", label: "New", color: "bg-[#0B2E36]" },
  { value: "contacted", label: "Contacted", color: "bg-[#F0A202]" },
  { value: "follow_up", label: "Follow Up", color: "bg-[#D9662E]" },
  { value: "interested", label: "Interested", color: "bg-[#0E8C7A]" },
  { value: "quotation_sent", label: "Quote Sent", color: "bg-[#8B3A5C]" },
  { value: "converted", label: "Converted", color: "bg-[#2F7D4F]" },
  { value: "closed", label: "Closed", color: "bg-muted-foreground/60" },
];

const statusBadge = {
  new: "bg-[#0B2E36]/10 text-[#0B2E36]",
  contacted: "bg-[#F0A202]/15 text-[#A6740A]",
  follow_up: "bg-[#D9662E]/15 text-[#B34F1F]",
  interested: "bg-[#0E8C7A]/12 text-[#0B6F60]",
  quotation_sent: "bg-[#8B3A5C]/12 text-[#8B3A5C]",
  converted: "bg-[#2F7D4F]/12 text-[#2F7D4F]",
  closed: "bg-muted text-muted-foreground",
};

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TreatmentRequests() {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [quoteMode, setQuoteMode] = useState(false);
  const [quoteForm, setQuoteForm] = useState({});
  const [savingQuote, setSavingQuote] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      db.entities.Lead.list("-created_date", 5000),
      db.entities.Quote.list("-created_date", 5000),
    ]).then(([leadData, quoteData]) => {
      setLeads(leadData);
      setQuotes(quoteData);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    inProgress: leads.filter((l) => ["contacted", "follow_up", "interested"].includes(l.status)).length,
    converted: leads.filter((l) => l.status === "converted").length,
    quotes: quotes.length,
  };

  const statCards = [
    { icon: Users, label: "Total Requests", value: stats.total, color: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "New", value: stats.new, color: "from-yellow-500 to-yellow-600" },
    { icon: MessageSquare, label: "In Progress", value: stats.inProgress, color: "from-purple-500 to-purple-600" },
    { icon: CheckCircle2, label: "Converted", value: stats.converted, color: "from-green-500 to-green-600" },
  ];

  const updateStatus = async (id, status) => {
    await db.entities.Lead.update(id, { status });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected({ ...selected, status });
    toast({ title: "Status updated to " + status.replace("_", " ") });
  };

  const updateNotes = async (id, notes) => {
    await db.entities.Lead.update(id, { notes });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
    toast({ title: "Notes saved" });
  };

  const openQuoteForm = (lead) => {
    setQuoteForm({
      lead_id: lead.id,
      patient_name: lead.patient_name || "",
      treatment: lead.treatment_interest || "",
      hospital_name: "",
      country: lead.country || "",
      estimated_cost_usd: "",
      cost_breakdown: "",
      duration_of_stay: "",
      inclusions: "Hospital stay, Surgeon fees, Anesthesia, Pre-operation diagnostics, Post-operation care",
      exclusions: "Airfare, Accommodation outside hospital, Personal expenses",
      validity_days: 30,
      notes: "",
    });
    setQuoteMode(true);
  };

  const saveQuote = async () => {
    setSavingQuote(true);
    try {
      await db.entities.Quote.create({
        ...quoteForm,
        estimated_cost_usd: Number(quoteForm.estimated_cost_usd) || 0,
        status: "draft",
      });
      await db.entities.Lead.update(quoteForm.lead_id, { status: "quotation_sent" });
      setLeads((prev) => prev.map((l) => (l.id === quoteForm.lead_id ? { ...l, status: "quotation_sent" } : l)));
      toast({ title: "Quote generated and lead status updated!" });
      setQuoteMode(false);
      setSelected(null);
      loadData();
    } catch {
      toast({ title: "Failed to save quote", variant: "destructive" });
    }
    setSavingQuote(false);
  };

  const updateQuoteStatus = async (id, status) => {
    await db.entities.Quote.update(id, { status });
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    toast({ title: "Quote status updated" });
  };

  const filteredLeads = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 md:p-5 border shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-heading font-bold text-2xl md:text-3xl">{value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${activeTab === "requests" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Treatment Requests
          {activeTab === "requests" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${activeTab === "quotes" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Cost Quotes ({quotes.length})
          {activeTab === "quotes" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div>
          {/* Status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
            >
              All ({leads.length})
            </button>
            {statuses.map((s) => {
              const count = leads.filter((l) => l.status === s.value).length;
              return (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${statusFilter === s.value ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                  {s.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Lead cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredLeads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-sm text-foreground truncate">{lead.patient_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{lead.treatment_interest || "General consultation"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusBadge[lead.status] || ""}`}>
                    {(lead.status || "new").replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {lead.country && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {lead.country}
                    </p>
                  )}
                  {lead.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" /> {formatDate(lead.created_date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setSelected(lead)}>
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-secondary" onClick={() => { setSelected(lead); openQuoteForm(lead); }}>
                    <DollarSign className="w-3 h-3 mr-1" /> Quote
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredLeads.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No treatment requests in this category.</p>
            </div>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === "quotes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {quotes.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-sm text-foreground truncate">{q.patient_name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{q.treatment}</p>
                </div>
                <Select value={q.status} onValueChange={(v) => updateQuoteStatus(q.id, v)}>
                  <SelectTrigger className="h-7 w-24 text-xs rounded-full border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {q.hospital_name && <p className="text-xs text-muted-foreground mb-1">🏥 {q.hospital_name}</p>}
              {q.country && <p className="text-xs text-muted-foreground mb-1">📍 {q.country}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="font-heading font-bold text-lg text-primary">
                    ${q.estimated_cost_usd?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{q.duration_of_stay || "-"}</p>
                </div>
              </div>
              {q.inclusions && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-foreground mb-1">Inclusions</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{q.inclusions}</p>
                </div>
              )}
            </motion.div>
          ))}
          {quotes.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No quotes generated yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selected && !quoteMode} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Treatment Request Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Patient Name</p>
                  <p className="font-semibold">{selected.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                  <p className="font-semibold">{selected.country || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-semibold flex items-center gap-1"><Phone className="w-3 h-3" /> {selected.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-semibold flex items-center gap-1 truncate"><Mail className="w-3 h-3 flex-shrink-0" /> {selected.email || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Treatment Interest</p>
                  <p className="font-semibold">{selected.treatment_interest || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                  <p className="font-semibold">{formatDate(selected.created_date)}</p>
                </div>
                {selected.message && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Message</p>
                    <p className="text-sm bg-muted/30 rounded-lg p-3">{selected.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block">Update Status</label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1.5 block">Internal Notes</label>
                <Textarea
                  defaultValue={selected.notes || ""}
                  onBlur={(e) => updateNotes(selected.id, e.target.value)}
                  placeholder="Add internal notes about this patient..."
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-secondary"
                onClick={() => openQuoteForm(selected)}
              >
                <DollarSign className="w-4 h-4 mr-2" /> Generate Cost Quote
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Generation Dialog */}
      <Dialog open={quoteMode} onOpenChange={(v) => { if (!v) setQuoteMode(false); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Cost Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold mb-1 block">Patient Name</label>
              <Input value={quoteForm.patient_name} onChange={(e) => setQuoteForm({ ...quoteForm, patient_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Treatment</label>
              <Input value={quoteForm.treatment} onChange={(e) => setQuoteForm({ ...quoteForm, treatment: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Hospital</label>
                <Input value={quoteForm.hospital_name} onChange={(e) => setQuoteForm({ ...quoteForm, hospital_name: e.target.value })} placeholder="Hospital name" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Country</label>
                <Input value={quoteForm.country} onChange={(e) => setQuoteForm({ ...quoteForm, country: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Estimated Cost (USD)</label>
                <Input type="number" value={quoteForm.estimated_cost_usd} onChange={(e) => setQuoteForm({ ...quoteForm, estimated_cost_usd: e.target.value })} placeholder="5000" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Duration of Stay</label>
                <Input value={quoteForm.duration_of_stay} onChange={(e) => setQuoteForm({ ...quoteForm, duration_of_stay: e.target.value })} placeholder="7-10 days" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Cost Breakdown</label>
              <Textarea value={quoteForm.cost_breakdown} onChange={(e) => setQuoteForm({ ...quoteForm, cost_breakdown: e.target.value })} placeholder="Surgery: $3000, Hospital stay: $1000, Diagnostics: $500..." rows={2} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Inclusions</label>
              <Textarea value={quoteForm.inclusions} onChange={(e) => setQuoteForm({ ...quoteForm, inclusions: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Exclusions</label>
              <Textarea value={quoteForm.exclusions} onChange={(e) => setQuoteForm({ ...quoteForm, exclusions: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Additional Notes</label>
              <Textarea value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} placeholder="Any special notes for the patient..." rows={2} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setQuoteMode(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-primary to-secondary" onClick={saveQuote} disabled={savingQuote}>
                {savingQuote ? "Saving..." : "Save Quote & Update Lead"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}