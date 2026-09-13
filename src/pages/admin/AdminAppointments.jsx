import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, Stethoscope } from "lucide-react";
import EntityManager from "@/components/admin/EntityManager";

const fields = [
  { key: "patient_name", label: "Patient Name", type: "text", showInList: true },
  { key: "patient_email", label: "Email", type: "text", showInList: true },
  { key: "patient_phone", label: "Phone", type: "text", showInList: false },
  { key: "patient_country", label: "Country", type: "text", showInList: true },
  { key: "doctor_name", label: "Doctor", type: "text", showInList: true },
  { key: "hospital_name", label: "Hospital", type: "text", showInList: false },
  { key: "treatment", label: "Treatment", type: "text", showInList: true },
  { key: "preferred_date", label: "Preferred Date", type: "text", showInList: true },
  { key: "notes", label: "Notes", type: "textarea", showInList: false },
  { key: "status", label: "Status", type: "select", options: ["pending", "confirmed", "completed", "cancelled"], showInList: true },
];

const statusColors = {
  pending: "bg-[#F0A202]/15 text-[#A6740A]",
  confirmed: "bg-[#0E8C7A]/12 text-[#0B6F60]",
  completed: "bg-[#2F7D4F]/12 text-[#2F7D4F]",
  cancelled: "bg-muted text-muted-foreground",
};

function AppointmentCard(item, { openEdit, handleDelete }) {
  return (
    <div key={item.id} className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading font-bold text-foreground text-base leading-snug truncate">
          {item.patient_name || "Unnamed Patient"}
        </h3>
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      {item.treatment && (
        <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
          {item.treatment}
        </span>
      )}

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {item.doctor_name && (
          <p className="flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground/80">Doctor:</span> {item.doctor_name}
          </p>
        )}
        {item.hospital_name && (
          <p className="truncate">
            <span className="font-medium text-foreground/80">Hospital:</span> {item.hospital_name}
          </p>
        )}
        {item.preferred_date && (
          <p className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground/80">Preferred Date:</span> {item.preferred_date}
          </p>
        )}
        <p className="truncate">
          <span className="font-medium text-foreground/80">Contact:</span> {item.patient_email || "-"}
          {item.patient_phone ? ` · ${item.patient_phone}` : ""}
        </p>
        {item.patient_country && (
          <p>
            <span className="font-medium text-foreground/80">Country:</span> {item.patient_country}
          </p>
        )}
      </div>

      <div className="mt-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || "bg-muted text-muted-foreground"}`}>
          {item.status || "pending"}
        </span>
      </div>
    </div>
  );
}

export default function AdminAppointments() {
  return (
    <EntityManager
      entityName="Appointment"
      fields={fields}
      displayField="patient_name"
      cardView
      renderCard={AppointmentCard}
    />
  );
}