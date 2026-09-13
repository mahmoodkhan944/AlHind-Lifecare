import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star, MessageSquare } from "lucide-react";
import EntityManager from "@/components/admin/EntityManager";

const fields = [
  { key: "patient_name", label: "Patient Name", type: "text", showInList: true },
  { key: "country", label: "Country", type: "text", showInList: true },
  { key: "treatment", label: "Treatment", type: "text", showInList: true },
  { key: "hospital", label: "Hospital", type: "text", showInList: false },
  { key: "doctor", label: "Doctor", type: "text", showInList: false },
  { key: "rating", label: "Rating (1-5)", type: "number", showInList: true },
  { key: "review_text", label: "Review", type: "textarea", showInList: false },
  { key: "photo_url", label: "Photo URL", type: "text", showInList: false },
  { key: "video_url", label: "Video URL", type: "text", showInList: false },
  { key: "featured", label: "Featured", type: "boolean", showInList: true },
  { key: "status", label: "Status", type: "select", options: ["pending", "approved", "rejected"], showInList: true },
];

const statusColors = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-accent-jade/10 text-accent-jade",
  rejected: "bg-rose-50 text-rose-700",
};

function TestimonialCard(item, { openEdit, handleDelete }) {
  return (
    <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">{item.patient_name}</h3>
          {item.country && <span className="text-xs font-semibold text-muted-foreground shrink-0">{item.country}</span>}
          {item.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < (item.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {item.treatment && (
          <span className="inline-flex px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
            {item.treatment}
          </span>
        )}
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-muted text-muted-foreground"}`}>
          {item.status || "pending"}
        </span>
      </div>

      {item.review_text && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{item.review_text}</p>
      )}

      <div className="flex justify-end gap-2 mt-4">
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
  );
}

const computeStats = (items) => [
  { label: "Total Testimonials", value: items.length, color: "blue" },
  { label: "Pending Approval", value: items.filter((i) => i.status === "pending").length, color: "amber" },
  { label: "Approved", value: items.filter((i) => i.status === "approved").length, color: "green" },
];

export default function AdminTestimonials() {
  return (
    <EntityManager
      entityName="Testimonial"
      fields={fields}
      displayField="patient_name"
      icon={MessageSquare}
      pageTitle="Testimonials"
      subtitle="Manage patient testimonials and reviews"
      addLabel="Add Testimonial"
      searchPlaceholder="Search testimonials..."
      computeStats={computeStats}
      filterField="status"
      filterOptions={[
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
      ]}
      cardView
      renderCard={TestimonialCard}
    />
  );
}