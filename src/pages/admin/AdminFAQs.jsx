import React from "react";
import EntityManager from "@/components/admin/EntityManager";

const fields = [
  { key: "question", label: "Question", type: "text", showInList: true },
  { key: "answer", label: "Answer", type: "textarea", showInList: false },
  { key: "category", label: "Category", type: "text", showInList: true },
  { key: "order", label: "Order", type: "number", showInList: true },
  { key: "status", label: "Status", type: "select", options: ["active", "inactive"], showInList: true },
];

export default function AdminFAQs() {
  return <EntityManager entityName="FAQ" fields={fields} displayField="question" />;
}