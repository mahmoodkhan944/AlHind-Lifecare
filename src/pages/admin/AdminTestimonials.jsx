import React from "react";
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

export default function AdminTestimonials() {
  return <EntityManager entityName="Testimonial" fields={fields} displayField="patient_name" />;
}