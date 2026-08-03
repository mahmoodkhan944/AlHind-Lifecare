import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  Users,
  Award,
  HeartPulse,
  Clock,
  Target,
  Eye,
  Stethoscope,
  PlaneTakeoff,
  Video,
  MessageSquareHeart,
  Hotel,
  Languages,
  Landmark,
  Banknote,
  Building2,
  CheckCircle2,
  Linkedin,
  Mail,
} from "lucide-react";
import StatCard from "@/components/common/StatCard";

const stats = [
  { icon: Users, value: "50,000+", label: "Happy Patients" },
  { icon: Globe, value: "70+", label: "Countries Served" },
  { icon: Award, value: "500+", label: "Expert Doctors" },
  { icon: HeartPulse, value: "98%", label: "Success Rate" },
];

const services = [
  { icon: Stethoscope, label: "Medical Treatment" },
  { icon: Video, label: "Online Consultation" },
  { icon: MessageSquareHeart, label: "Second Opinion" },
];

// Alternating image + text rows
const trustRows = [
  {
    image: "https://plus.unsplash.com/premium_photo-1661423762612-e8fae810cb4b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fEhvc3BpdGFsaXNhdGlvbiUyMCUyNiUyMFBvc3QtVHJlYXRtZW50JTIwQ2FyZXxlbnwwfHwwfHx8MA%3D%3D",
    title: "Hospitalisation & Post-Treatment Care",
    desc: "From on-priority appointments with doctors upon your arrival to post-treatment care at your place and seamless follow-ups — we stay with you through every stage of recovery.",
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80",
    title: "Visa & Travel",
    desc: "From medical visa support to airport transfers, flight and accommodation booking, and easy Forex — plus a multilingual team so language is never a barrier.",
  },
  {
    image: "https://plus.unsplash.com/premium_photo-1698421947098-d68176a8f5b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8VGVsZW1lZGljaW5lfGVufDB8fDB8fHww",
    title: "Telemedicine",
    desc: "We partner with certified hospitals and experienced doctors who support you through video consultations and treatment planning, wherever you are.",
  },
];

// Detailed "how we help"
const helpGroups = [
  {
    icon: Stethoscope,
    title: "Treatment Assistance",
    points: [
      "The right doctors and hospitals for your needs",
      "Direct consultation with specialists across departments",
      "Best available quotes for treatment",
      "Easy second opinions from trusted professionals",
      "Priority admission and appointments on arrival",
      "Post-treatment follow-ups with your surgeon",
    ],
  },
  {
    icon: Hotel,
    title: "Comfort During Stay",
    points: [
      "Assistance with a local SIM card",
      "Help selecting hotels or guest houses",
      "Regular check-ins during your stay",
      "Language assistance with a linguistic expert",
    ],
  },
  {
    icon: PlaneTakeoff,
    title: "Travel Services",
    points: ["Medical visa assistance", "Airport pickup and drop-off", "Flight ticket assistance"],
  },
  {
    icon: Building2,
    title: "Post-Hospitalisation",
    points: ["Hassle-free hospital bill resolution", "Forex assistance guaranteed"],
  },
];

const advantages = [
  {
    icon: PlaneTakeoff,
    title: "Travel & Visa",
    desc: "Complete assistance with visa and travel — we liaise with the authorities to get your medical visa sorted.",
  },
  {
    icon: Banknote,
    title: "Forex",
    desc: "Get competitive exchange rates through our Forex partners.",
  },
  {
    icon: Landmark,
    title: "Embassy Support",
    desc: "Embassy and consulate support whenever you need it, no matter the country.",
  },
  {
    icon: Languages,
    title: "Multilingual Team",
    desc: "A support team ready to assist you in your own language, every step of the way.",
  },
];

const leaders = [
  {
    photo: "https://scontent.fdel18-1.fna.fbcdn.net/v/t39.30808-1/400434253_3640507126180107_5636551770658110022_n.jpg?stp=dst-jpg_tt6&cstp=mx379x378&ctp=s200x200&_nc_cat=103&ccb=1-7&_nc_sid=e99d92&_nc_ohc=3oAbSgJ0c9oQ7kNvwFJ2hD0&_nc_oc=AdqOKsUoNTdF0uouCUghbGHhLPFvaQ8BczZhHT03my0HQJy5k80GlqBccdiebzadXAY&_nc_zt=24&_nc_ht=scontent.fdel18-1.fna&_nc_gid=0QWoaodqWeS9NpKMyvc9nQ&_nc_ss=7b2a8&oh=00_AQDpAu8C3bOBlsjXuyXiGJj0HfNBfiVIbt73iv8Uyruk-g&oe=6A6BC830",
    name: "Abu Hamza Khan",
    role: "Director & Co-Founder",
    linkedin: "#",
    email: "founder@alhindmedical.com",
  },
  {
    photo: "https://scontent.fdel18-1.fna.fbcdn.net/v/t39.30808-6/492848377_9377324452365685_5324456509906852481_n.jpg?stp=dst-jpg_tt6&cstp=mx719x720&ctp=s719x720&_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=xynGBioqpYMQ7kNvwHubx3T&_nc_oc=AdoIFl9srdrNIcLa0YHht8cVw_Cy51s8D6ui5bhMZePx76La5ys9iKVjN13QBgCJIm4&_nc_zt=23&_nc_ht=scontent.fdel18-1.fna&_nc_gid=27nplhMPNuJ0RYbifKW1CA&_nc_ss=7b2a8&oh=00_AQAtZKYh1qFl-3dt8BfZV5u5Th_ZmA852CB8Ac7AlVlyNg&oe=6A6BACD5",
    name: "Aqib Javed",
    role: "Operations Manager & Co-Founder",
    linkedin: "#",
    email: "cofounder@alhindmedical.com",
  },
  {
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    name: "General Manager Name",
    role: "General Manager & Co-Founder",
    linkedin: "#",
    email: "gm@alhindmedical.com",
  },
];

const HERO_IMAGE =
  "https://media.istockphoto.com/id/1325204361/photo/fragile-brain-care.webp?a=1&b=1&s=612x612&w=0&k=20&c=P-hTSqeMMhWH2OukmCthDubibw-cY2-MubXSsSeXpwU=";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12 md:pb-14 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-[#0E8C7A]/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-bold text-[clamp(1.75rem,6vw,3rem)] text-white mb-4 text-balance"
          >
            About Alhind Medical Care
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto text-balance"
          >
            Your trusted bridge to world-class healthcare in India and Turkey
          </motion.p>
        </div>
      </section>

      {/* Intro / Mission — image + copy, "Your Health, Our Priority" */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto md:max-w-none"
            >
              <div className="relative">
                <img
                  src="https://plus.unsplash.com/premium_photo-1723489337127-10940e9dc593?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAxfHxoZWFsdGglMjBjYXJlfGVufDB8fDB8fHww"
                  alt="Alhind Medical Care team"
                  loading="lazy"
                  className="w-full rounded-2xl shadow-xl ring-1 ring-black/5 aspect-[4/3] object-cover"
                />
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-primary to-secondary rounded-2xl -z-10" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
                Your Health, Our Priority
              </span>
              <h2 className="font-heading font-bold text-[clamp(1.5rem,4vw,2.25rem)] mb-4 text-balance">
                Making World-Class Healthcare Accessible to All
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 text-balance">
                At Alhind Medical Care, we believe quality healthcare should be accessible to everyone,
                everywhere. That's why we connect international patients with top hospitals and expert doctors
                in leading medical destinations across India and Turkey.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 text-balance">
                With a strong network of JCI &amp; NABH accredited hospitals and clinics, we make medical
                travel stress-free — from seamless, timely doctor appointments for a second opinion to
                expediting your visa for treatment abroad.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: Shield, label: "JCI Accredited Partners" },
                  { icon: Clock, label: "24/7 Support" },
                  { icon: Globe, label: "Multilingual Team" },
                  { icon: HeartPulse, label: "Personalized Care" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-10 sm:py-12 md:py-14 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Our Services
          </span>
          <h2 className="font-heading font-bold text-[clamp(1.5rem,4vw,2.25rem)] mb-4 text-balance">
            Everything You Need, Under One Roof
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            We offer online consultation, medical second opinion, and top-class medical treatment at our
            partner hospitals worldwide.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {services.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-primary/5 ring-1 ring-black/5"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-6 h-6" />
                </span>
                <p className="font-heading font-semibold text-base sm:text-lg">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-10 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To ensure every patient receives quality healthcare that is timely, accessible, affordable, and transparent — with no barriers along the way.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                desc: "To be a one-stop solution for international patients seeking world-class treatment, delivered on time and with genuine care.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-primary/5 ring-1 ring-black/5"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="font-heading font-bold text-lg sm:text-xl mb-2">{title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why patients trust us — alternating image + text rows */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Why Patients Trust Us
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.5rem,4vw,2.25rem)] text-balance">
              Care That Follows You Home
            </h2>
          </div>

          <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
            {trustRows.map((row, i) => (
              <motion.div
                key={row.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-center ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <img
                  src={row.image}
                  alt={row.title}
                  loading="lazy"
                  className="w-full aspect-[16/10] object-cover rounded-2xl shadow-xl ring-1 ring-black/5"
                />
                <div className="text-center md:text-left">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl mb-3 text-balance">{row.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
                    {row.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How we help — detailed bullet groups */}
      <section className="py-10 sm:py-12 md:py-14 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              How We Help You
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.05rem,4.5vw,2.25rem)] text-balance whitespace-nowrap sm:whitespace-normal">
              Support at Every Step of the Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {helpGroups.map(({ icon: Icon, title, points }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg shadow-primary/5 ring-1 ring-black/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg">{title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-10 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Leadership
            </span>
            <h2 className="font-heading font-bold text-[clamp(0.9rem,4.2vw,2.25rem)] mb-3 text-balance whitespace-nowrap sm:whitespace-normal">
              The People Behind Alhind Medical Care
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-balance">
              Experienced professionals dedicated to your health and wellbeing.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {leaders.map((leader) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-secondary/10 rounded-2xl overflow-hidden"
              >
                <div className="pt-8 pb-6 flex justify-center">
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    loading="lazy"
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                </div>
                <div className="bg-secondary/60 px-6 pb-6 pt-2 text-center">
                  <p className="font-heading font-bold text-base sm:text-lg text-foreground">{leader.name}</p>
                  <p className="text-primary text-sm font-semibold mt-1 mb-4">{leader.role}</p>
                  <div className="flex items-center justify-center gap-2.5">
                    <a
                      href={leader.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${leader.name} on LinkedIn`}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm text-foreground/70 hover:text-medical-blue hover:shadow-md transition-all"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:${leader.email}`}
                      aria-label={`Email ${leader.name}`}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm text-foreground/70 hover:text-accent-jade hover:shadow-md transition-all"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages of choosing us */}
      <section className="py-10 sm:py-12 md:py-14 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Advantages
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.5rem,4vw,2.25rem)] text-balance">
              Advantages of Choosing Us
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {advantages.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-primary/5 ring-1 ring-black/5 text-center sm:text-left"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-heading font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}