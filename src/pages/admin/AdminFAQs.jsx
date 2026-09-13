import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText } from "lucide-react";
import EntityManager from "@/components/admin/EntityManager";

const fields = [
  { key: "question", label: "Question", type: "text", showInList: true },
  { key: "answer", label: "Answer", type: "textarea", showInList: false },
  { key: "category", label: "Category", type: "text", showInList: true },
  { key: "order", label: "Order", type: "number", showInList: true },
  { key: "status", label: "Status", type: "select", options: ["active", "inactive"], showInList: true },
];

function FAQCard(item, { openEdit, handleDelete }) {
  return (
    <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {item.category && (
            <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              {item.category}
            </span>
          )}
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
              item.status === "active" ? "bg-accent-jade/10 text-accent-jade" : "bg-muted text-muted-foreground"
            }`}
          >
            {item.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <h3 className="font-heading font-bold text-foreground text-base leading-snug mt-3">{item.question}</h3>
      {item.answer && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.answer}</p>}
    </div>
  );
}

const computeStats = (items) => [
  { label: "Total FAQs", value: items.length, color: "neutral" },
  { label: "Active", value: items.filter((i) => (i.status || "active") === "active").length, color: "green" },
  { label: "Medical", value: items.filter((i) => (i.category || "").toLowerCase() === "medical").length, color: "blue" },
  { label: "General", value: items.filter((i) => (i.category || "").toLowerCase() === "general").length, color: "purple" },
];

export default function AdminFAQs() {
  return (
    <EntityManager
      entityName="FAQ"
      fields={fields}
      displayField="question"
      icon={FileText}
      pageTitle="FAQs Management"
      subtitle="Manage frequently asked questions"
      addLabel="Add New FAQ"
      searchPlaceholder="Search FAQs..."
      computeStats={computeStats}
      filterField="category"
      filterOptions={[
        { value: "general", label: "General" },
        { value: "medical", label: "Medical" },
        { value: "billing", label: "Billing" },
        { value: "appointments", label: "Appointments" },
      ]}
      cardView
      renderCard={FAQCard}
    />
  );
}