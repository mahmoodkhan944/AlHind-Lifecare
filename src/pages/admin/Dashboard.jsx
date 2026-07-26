import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Stethoscope, Building2, Heart, CalendarDays, MessageSquare, TrendingUp } from "lucide-react";
import { db } from "@/api/dataClient";

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, doctors: 0, hospitals: 0, treatments: 0, appointments: 0, testimonials: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: was list("-created_date", 50) for every entity, so any stat card would
    // silently cap at 50 and stop growing once an entity type passed that count —
    // e.g. 200 real leads would still show "50" here. Raised well above realistic
    // volumes so these counts reflect the true totals.
    Promise.all([
      db.entities.Lead.list("-created_date", 5000),
      db.entities.Doctor.list("-created_date", 5000),
      db.entities.Hospital.list("-created_date", 5000),
      db.entities.Treatment.list("-created_date", 5000),
      db.entities.Appointment.list("-created_date", 5000),
      db.entities.Testimonial.list("-created_date", 5000),
    ]).then(([leads, docs, hosps, treats, appts, tests]) => {
      setStats({
        leads: leads.length,
        doctors: docs.length,
        hospitals: hosps.length,
        treatments: treats.length,
        appointments: appts.length,
        testimonials: tests.length,
      });
      setRecentLeads(leads.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, label: "Total Leads", value: stats.leads, color: "from-blue-500 to-blue-600" },
    { icon: Stethoscope, label: "Doctors", value: stats.doctors, color: "from-teal-500 to-teal-600" },
    { icon: Building2, label: "Hospitals", value: stats.hospitals, color: "from-purple-500 to-purple-600" },
    { icon: Heart, label: "Treatments", value: stats.treatments, color: "from-rose-500 to-rose-600" },
    { icon: CalendarDays, label: "Appointments", value: stats.appointments, color: "from-amber-500 to-amber-600" },
    { icon: MessageSquare, label: "Testimonials", value: stats.testimonials, color: "from-green-500 to-green-600" },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-6 border shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="font-heading font-bold text-3xl mb-1">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {recentLeads.length > 0 && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-heading font-bold text-lg mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 font-medium text-muted-foreground">Country</th>
                  <th className="pb-3 font-medium text-muted-foreground">Interest</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="py-3 font-medium">{lead.patient_name}</td>
                    <td className="py-3 text-muted-foreground">{lead.email}</td>
                    <td className="py-3 text-muted-foreground">{lead.country || "-"}</td>
                    <td className="py-3 text-muted-foreground">{lead.treatment_interest || "-"}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        lead.status === "new" ? "bg-blue-100 text-blue-700" :
                        lead.status === "converted" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}