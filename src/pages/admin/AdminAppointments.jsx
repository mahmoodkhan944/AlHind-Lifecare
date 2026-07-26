import React from "react";
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

export default function AdminAppointments() {
  return <EntityManager entityName="Appointment" fields={fields} displayField="patient_name" />;
}