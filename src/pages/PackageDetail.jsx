import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Building2,
  BedDouble,
  Hotel,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Sparkles,
  Star,
  Phone,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLeadModal } from "@/lib/LeadModalContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useSiteSettings, getWhatsAppLink } from "@/hooks/useSiteSettings";
import DetailPageSkeleton from "@/components/common/DetailPageSkeleton";
import { PackageCard } from "@/pages/Packages";
import {
  parseList,
  toNumber,
  formatPrice,
  discountPercent,
  pluralize,
  resolvePackageDetails,
  resolvePackageSections,
  detailHasContent,
} from "@/lib/packageUtils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchPackage(slugOrId) {
  const bySlug = await db.entities.Package.filter({ slug: slugOrId }, null, 1);
  if (bySlug[0]) return bySlug[0];
  if (UUID_RE.test(slugOrId)) return db.entities.Package.get(slugOrId);
  return null;
}

const splitList = (val) => {
  const list = parseList(val);
  if (list.length || !val) return list;
  return String(val).split(",").map((s) => s.trim()).filter(Boolean);
};

export default function PackageDetail() {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { openLeadModal } = useLeadModal();
  const { data: settings } = useSiteSettings();

  // The site's global CSS sets overflow-x:hidden on html+body, which breaks
  // position:sticky. So (like HospitalDetail) the desktop price card is a
  // fixed panel, shown only while the two-column content is on screen.
  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      const cardHeight = cardRef.current?.offsetHeight || 520;
      setShowFloating(top <= 96 && bottom >= 96 + cardHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pkg]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setActiveImage(0);
    setHospital(null);
    setDoctor(null);
    setTreatment(null);
    setSimilar([]);

    fetchPackage(slug)
      .then(async (p) => {
        if (cancelled) return;
        setPkg(p && p.status !== "inactive" ? p : null);
        if (!p) return;
        const [h, d, t] = await Promise.all([
          p.hospital_id ? db.entities.Hospital.get(p.hospital_id).catch(() => null) : null,
          p.doctor_id ? db.entities.Doctor.get(p.doctor_id).catch(() => null) : null,
          p.treatment_id ? db.entities.Treatment.get(p.treatment_id).catch(() => null) : null,
        ]);
        if (cancelled) return;
        setHospital(h);
        setDoctor(d);
        setTreatment(t);

        // Similar packages: same treatment first, else same country.
        const others = await db.entities.Package.filter({ status: "active" }, "-created_date", 200).catch(() => []);
        if (cancelled) return;
        const pool = others.filter((o) => o.id !== p.id);
        const sameTreatment = p.treatment_id ? pool.filter((o) => o.treatment_id === p.treatment_id) : [];
        const sameCountry = pool.filter((o) => o.country === p.country && !sameTreatment.includes(o));
        setSimilar([...sameTreatment, ...sameCountry].slice(0, 3));
      })
      .catch(() => !cancelled && setPkg(null))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useDocumentMeta({
    title: pkg ? pkg.meta_title || `${pkg.title} | AlHind Lifecare` : undefined,
    description: pkg ? pkg.meta_description || pkg.short_description || undefined : undefined,
  });

  if (loading) return <DetailPageSkeleton />;

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">Package not found</p>
        <Link to="/packages">
          <Button variant="outline">Back to Packages</Button>
        </Link>
      </div>
    );
  }

  const images = [pkg.image_url, ...parseList(pkg.gallery_images)].filter(Boolean);
  if (images.length === 0 && hospital?.cover_image_url) images.push(hospital.cover_image_url);

  const discount = discountPercent(pkg);
  const label = pkg.category || treatment?.name;
  const location = [pkg.city || hospital?.city, pkg.country || hospital?.country].filter(Boolean).join(", ");
  const highlights = parseList(pkg.highlights);
  const details = resolvePackageDetails(pkg).filter(detailHasContent);
  const treatmentInfo = parseList(pkg.treatment_info).filter((t) => t?.question || t?.answer);
  const itinerary = parseList(pkg.itinerary);
  const faqs = parseList(pkg.faqs).filter((f) => f?.question);

  // Sections in the order the admin chose (Admin → Package → Page Section Order).
  const sections = resolvePackageSections(pkg.section_config).filter((sec) => sec.visible !== false);
  const renderSection = ({ key, title }) => {
    switch (key) {
      case "highlights":
        return highlights.length > 0 ? (
          <Section title={title}>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-accent-warm/10 rounded-xl px-3.5 py-3 text-sm">
                  <Sparkles className="w-4 h-4 text-accent-warm shrink-0 mt-0.5" /> {h}
                </div>
              ))}
            </div>
          </Section>
        ) : null;
      case "package_details":
        return details.length > 0 ? (
          <Section title={title}>
            <Accordion type="multiple" defaultValue={[details[0].id]} className="space-y-2.5">
              {details.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border border-border rounded-xl px-4 sm:px-5 bg-white">
                  <AccordionTrigger className="text-left font-heading font-bold text-[15px] hover:no-underline py-4">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <DetailBlocks item={item} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        ) : null;
      case "itinerary":
        return itinerary.length > 0 ? (
          <Section title={title}>
            <ol className="relative border-l-2 border-dashed border-secondary/20 ml-3 space-y-5">
              {itinerary.map((step, i) => (
                <li key={i} className="pl-6 relative">
                  <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-secondary text-white text-[11px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </Section>
        ) : null;
      case "hospital":
        return hospital ? <HospitalCard hospital={hospital} title={title} /> : null;
      case "doctor":
        return doctor ? <DoctorCard doctor={doctor} title={title} /> : null;
      case "treatment_info":
        return treatmentInfo.length > 0 ? (
          <Section title={title}>
            <div className="space-y-3">
              {treatmentInfo.map((t, i) => (
                <div key={i} className="rounded-xl border border-border px-4 sm:px-5 py-4">
                  {t.question && <h3 className="font-heading font-bold text-[15px] text-secondary">{t.question}</h3>}
                  {t.answer && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-1.5">{t.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null;
      case "faqs":
        return faqs.length > 0 ? (
          <Section title={title}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-semibold">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        ) : null;
      default:
        return null;
    }
  };

  const book = () =>
    openLeadModal({
      title: "Book This Package",
      description: `Our team will confirm availability and send the booking details for ${pkg.title}.`,
      treatmentInterest: `Package: ${pkg.title}`,
    });
  const quote = () =>
    openLeadModal({
      title: "Get a Free Quote",
      description: `Get a personalised quote based on your medical reports for ${pkg.title}.`,
      treatmentInterest: `Package: ${pkg.title}`,
    });
  const whatsappHref = `${getWhatsAppLink(settings?.whatsapp_number)}?text=${encodeURIComponent(
    `Hi, I'm interested in the package: ${pkg.title}`
  )}`;

  const facts = [
    toNumber(pkg.days_in_hospital) > 0 && { icon: BedDouble, label: "Hospital stay", value: pluralize(pkg.days_in_hospital, "day") },
    toNumber(pkg.nights_stay) > 0 && { icon: Hotel, label: "Hotel stay", value: pluralize(pkg.nights_stay, "night") },
    toNumber(pkg.total_days) > 0 && { icon: CalendarDays, label: "Total trip", value: pluralize(pkg.total_days, "day") },
    location && { icon: MapPin, label: "Location", value: location },
  ].filter(Boolean);

  return (
    <div className="pb-24 lg:pb-0 bg-muted/30">
      <section className="pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 sm:mb-5 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Packages
          </Link>

          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-5 min-w-0">
              {/* Gallery */}
              <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="relative aspect-[16/9] bg-muted">
                  {images[activeImage] ? (
                    <img src={images[activeImage]} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-secondary/20">
                      <Sparkles className="w-14 h-14" />
                    </div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-accent-jade text-white text-xs font-extrabold tracking-wide shadow">
                      SAVE {discount}%
                    </span>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((src, i) => (
                      <button
                        key={src + i}
                        onClick={() => setActiveImage(i)}
                        className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                          i === activeImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-5 sm:p-7 pt-4 sm:pt-5">
                  {label && <p className="text-xs font-bold uppercase tracking-wider text-accent-jade mb-1.5">{label}</p>}
                  <h1 className="font-heading font-extrabold text-[clamp(1.35rem,3.5vw,2.1rem)] leading-tight text-secondary text-balance">
                    {pkg.title}
                  </h1>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mt-3">
                    {hospital?.name && (
                      <Link to={`/hospitals/${hospital.id}`} className="flex items-center gap-1.5 hover:text-primary">
                        <Building2 className="w-4 h-4 shrink-0" /> {hospital.name}
                      </Link>
                    )}
                    {location && (
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" /> {location}</span>
                    )}
                    {doctor?.name && (
                      <Link to={`/doctors/${doctor.id}`} className="flex items-center gap-1.5 hover:text-primary">
                        <Stethoscope className="w-4 h-4 shrink-0" /> {doctor.name}
                      </Link>
                    )}
                  </div>
                  {pkg.short_description && (
                    <p className="text-muted-foreground mt-4 leading-relaxed">{pkg.short_description}</p>
                  )}
                </div>
              </div>

              {/* Mobile price card */}
              <div className="lg:hidden">
                <PriceCard pkg={pkg} discount={discount} facts={facts} onBook={book} onQuote={quote} whatsappHref={whatsappHref} />
              </div>

              {sections.map((sec) => (
                <React.Fragment key={sec.key}>{renderSection(sec)}</React.Fragment>
              ))}
            </div>

            {/* Desktop price card: shown in place at the top; once scrolled,
                the fixed copy below takes over. */}
            <aside className={`hidden lg:block transition-opacity ${showFloating ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <PriceCard pkg={pkg} discount={discount} facts={facts} onBook={book} onQuote={quote} whatsappHref={whatsappHref} />
            </aside>
          </div>

          {similar.length > 0 && (
            <div className="mt-10 sm:mt-12">
              <div className="flex items-end justify-between gap-4 mb-5">
                <h2 className="font-heading font-bold text-xl sm:text-2xl">Similar Packages</h2>
                <Link to="/packages" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {similar.map((s, i) => (
                  <PackageCard key={s.id} pkg={s} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div
        className={`hidden lg:block fixed top-24 inset-x-0 z-30 pointer-events-none transition-opacity duration-300 ${
          showFloating ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showFloating}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-end">
          <div ref={cardRef} className={`w-[calc((100%-4rem)/3)] ${showFloating ? "pointer-events-auto" : ""}`}>
            <PriceCard pkg={pkg} discount={discount} facts={facts} onBook={book} onQuote={quote} whatsappHref={whatsappHref} />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-3 py-2.5 flex items-center gap-3">
        <div className="min-w-0">
          {discount > 0 && (
            <p className="text-[11px] text-muted-foreground line-through leading-none">{formatPrice(pkg.original_price, pkg.currency)}</p>
          )}
          <p className="font-heading font-extrabold text-lg text-secondary leading-tight">{formatPrice(pkg.price, pkg.currency)}</p>
        </div>
        <Button onClick={book} className="flex-1 h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-heading font-bold">
          Book Now
        </Button>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="h-11 w-11 shrink-0 rounded-xl p-0" aria-label="WhatsApp">
            <Phone className="w-5 h-5" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function PriceCard({ pkg, discount, facts, onBook, onQuote, whatsappHref }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg shadow-secondary/5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Package price</p>
        {discount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-accent-jade text-white text-[10px] font-extrabold">SAVE {discount}%</span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-1.5">
        <span className="font-heading font-extrabold text-3xl text-secondary">{formatPrice(pkg.price, pkg.currency)}</span>
        {discount > 0 && (
          <span className="text-sm text-muted-foreground line-through">{formatPrice(pkg.original_price, pkg.currency)}</span>
        )}
      </div>

      {facts.length > 0 && (
        <dl className="mt-5 divide-y divide-border border-y border-border">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" /> {label}
              </dt>
              <dd className="font-semibold text-right">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="space-y-2.5 mt-5">
        <Button onClick={onBook} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-heading font-bold">
          Book This Package
        </Button>
        <Button onClick={onQuote} variant="outline" className="w-full h-11 rounded-xl font-semibold border-secondary text-secondary hover:bg-secondary/5">
          Get Free Quote
        </Button>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="ghost" className="w-full h-10 rounded-xl text-sm text-accent-jade hover:bg-accent-jade/5 gap-2">
            <Phone className="w-4 h-4" /> Ask on WhatsApp
          </Button>
        </a>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground mt-4">
        <ShieldCheck className="w-4 h-4 text-accent-jade shrink-0" />
        Final price is confirmed by the hospital after reviewing your medical reports.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-border shadow-sm p-5 sm:p-6"
    >
      <h2 className="font-heading font-bold text-lg sm:text-xl text-secondary mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}

function HospitalCard({ hospital, title = "Your Hospital" }) {
  const accreditations = splitList(hospital.accreditations).slice(0, 4);
  return (
    <Section title={title}>
      <Link to={`/hospitals/${hospital.id}`} className="group flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-40 h-36 sm:h-28 rounded-xl overflow-hidden bg-muted shrink-0">
          {hospital.cover_image_url ? (
            <img src={hospital.cover_image_url} alt={hospital.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Building2 className="w-8 h-8 text-secondary/20" /></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">{hospital.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {[hospital.city, hospital.country].filter(Boolean).join(", ")}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
            {hospital.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star className="w-3.5 h-3.5 fill-current" /> {hospital.rating}</span>
            )}
            {hospital.beds_count > 0 && <span>{hospital.beds_count} beds</span>}
            {hospital.established_year && <span>Est. {hospital.established_year}</span>}
          </div>
          {accreditations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {accreditations.map((a) => (
                <span key={a} className="px-2 py-0.5 rounded-full bg-secondary/5 text-secondary text-[11px] font-semibold">{a}</span>
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-3">
            View hospital <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </Section>
  );
}

function DoctorCard({ doctor, title = "Your Doctor" }) {
  return (
    <Section title={title}>
      <Link to={`/doctors/${doctor.id}`} className="group flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0">
          {doctor.photo_url ? (
            <img src={doctor.photo_url} alt={doctor.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary/30">{doctor.name?.[0]}</div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">{doctor.name}</h3>
          <p className="text-sm text-primary font-semibold">{doctor.designation || doctor.speciality}</p>
          <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-1">
            {doctor.experience_years > 0 && <span>{doctor.experience_years}+ years experience</span>}
            {doctor.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star className="w-3 h-3 fill-current" /> {doctor.rating}</span>
            )}
          </div>
        </div>
      </Link>
    </Section>
  );
}

// One accordion item's content: optional sub-headings, paragraphs and bullet
// points. Inclusions get ticks, Exclusions get crosses, everything else dots.
function DetailBlocks({ item }) {
  const kind = /exclu|not\s*includ/i.test(item.title) ? "no" : /inclu/i.test(item.title) ? "yes" : "dot";
  return (
    <div className="space-y-4">
      {item.blocks.map((b) => {
        const points = (b.points || []).filter((p) => String(p).trim());
        if (!b.subheading?.trim() && !b.text?.trim() && points.length === 0) return null;
        return (
          <div key={b.id}>
            {b.subheading?.trim() && <h4 className="font-heading font-bold text-sm text-secondary mb-1.5">{b.subheading}</h4>}
            {b.text?.trim() && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{b.text}</p>}
            {points.length > 0 && (
              <ul className={`space-y-2 ${b.text?.trim() ? "mt-2.5" : ""}`}>
                {points.map((p, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-sm ${kind === "no" ? "text-muted-foreground" : "text-foreground/85"}`}>
                    {kind === "yes" ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-jade shrink-0 mt-0.5" />
                    ) : kind === "no" ? (
                      <XCircle className="w-4 h-4 text-destructive/70 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-jade shrink-0 mt-[7px]" />
                    )}
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}