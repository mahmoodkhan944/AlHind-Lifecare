import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Star, Briefcase, ArrowRight } from "lucide-react";
import { db } from "@/api/dataClient";
import { useLeadModal } from "@/lib/LeadModalContext";

const fallbackDoctors = [
  {
    id: "1",
    name: "Dr. Vishal Dhir",
    speciality: "Senior Cardiothoracic & Vascular Surgeon",
    hospital_name: "Metro Heart Institute with Multispecialty, Faridabad",
    photo_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=650&fit=crop",
    rating: 4.8,
    experience_years: 20,
  },
  {
    id: "2",
    name: "Dr. Anurag Wahi",
    speciality: "Senior Cardiothoracic & Vascular Surgeon",
    hospital_name: "Metro Heart Institute with Multispecialty, Faridabad",
    photo_url: "https://images.unsplash.com/photo-1622253692010-333f2da6051b?w=500&h=650&fit=crop",
    rating: 4.3,
    experience_years: 22,
  },
  {
    id: "3",
    name: "Dr. Rajesh Kumar",
    speciality: "Senior Consultant - Neurosurgery",
    hospital_name: "Medanta - The Medicity, Gurugram",
    photo_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&h=650&fit=crop",
    rating: 4.7,
    experience_years: 18,
  },
  {
    id: "4",
    name: "Dr. Priya Sharma",
    speciality: "Senior Consultant - Cardiology",
    hospital_name: "Apollo Hospitals, Chennai",
    photo_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=650&fit=crop",
    rating: 4.9,
    experience_years: 15,
  },
];

export default function TopDoctors() {
  const [doctors, setDoctors] = useState(fallbackDoctors);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    // Changed from "-rating" to "-created_date" so this section shows the newest
    // doctors added to the platform, not the highest-rated ones.
    db.entities.Doctor.filter({ status: "active" }, "-created_date", 4)
      .then((data) => { if (data.length > 0) setDoctors(data.slice(0, 4)); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            <Star className="w-3.5 h-3.5 fill-[#cc6600]" /> Latest Doctors
          </span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-[#1a2e1a] mb-2">
            Meet Our Newest Specialists
          </h2>
        </div>

        {/* Doctor cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {doctors.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-[#00A600]/8 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image with badges */}
              <div className="relative aspect-[4/4] overflow-hidden bg-gray-100">
                {doc.photo_url ? (
                  <img
                    src={doc.photo_url}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-gray-300">
                    {doc.name?.[0]}
                  </div>
                )}
                {/* Rating badge */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#2E7D32] text-white text-xs font-bold shadow-md">
                  <Star className="w-3 h-3 fill-white" />
                  {(doc.rating || 4.5).toFixed(1)}
                </div>
                {/* Experience badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white text-[#2E7D32] text-xs font-bold shadow-md">
                  <Briefcase className="w-3 h-3" />
                  {doc.experience_years || 15}+
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <h3 className="font-heading font-bold text-sm sm:text-base text-black mb-1 line-clamp-1">{doc.name}</h3>
                <p className="text-xs font-medium text-[#00A600] mb-2 line-clamp-2 leading-snug">{doc.speciality}</p>
                <p className="flex items-start gap-1 text-xs text-[#333333] mb-3 line-clamp-2 leading-snug">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  {doc.hospital_name}
                </p>
                <button
                  onClick={() => openLeadModal({ title: "Get Quotation", description: `Get a quote for a consultation with ${doc.name}.`, treatmentInterest: doc.name })}
                  className="inline-flex items-center justify-center w-full py-2 rounded-full border border-primary text-primary text-xs font-heading font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Get Quotation
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#2E7D32] hover:bg-[#256628] text-white font-heading font-semibold text-base shadow-lg shadow-[#00A600]/20 transition-all hover:shadow-xl hover:shadow-[#00A600]/30"
          >
            View All Doctors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}