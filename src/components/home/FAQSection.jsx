import React, { useState, useEffect } from "react";
import { db } from "@/api/dataClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionHeader from "@/components/common/SectionHeader";

const defaultFaqs = [
  { question: "What is medical tourism, and why do people travel abroad for medical treatments?", answer: "Medical tourism is the practice of traveling to another country for medical care. People choose it for cost savings, access to advanced treatments, shorter wait times, and world-class specialists not available locally." },
  { question: "How can I verify the credentials and reputation of a foreign hospital or doctor?", answer: "We only partner with JCI and NABH accredited hospitals. Our team provides detailed doctor profiles, qualifications, experience, and patient reviews so you can make an informed decision." },
  { question: "How can Alhind Medical Care help me find the right hospital and doctor for my treatment?", answer: "Our dedicated case managers review your medical case, recommend suitable hospitals and specialists, provide cost estimates, and coordinate your entire journey — all at no cost to you." },
  { question: "What types of medical procedures and treatments are available?", answer: "We cover a wide range of specialties including cardiology, orthopedics, oncology, IVF, neurology, cosmetic surgery, organ transplant, dental treatment, and more." },
  { question: "How do I request a cost estimate for my treatment?", answer: "Simply fill out the consultation form on our homepage or contact us via WhatsApp. Our team will provide a detailed cost estimate within 48 hours." },
  { question: "Do you help with visa and travel arrangements?", answer: "Yes, we provide end-to-end support including medical visa assistance, airport transfers, accommodation booking, language interpretation, and post-treatment follow-up." },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    db.entities.FAQ.filter({ status: "active" }, "order", 10)
      .then((data) => { if (data.length > 0) setFaqs(data); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-5 sm:py-12 md:py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader badge="FAQ" title="Frequently Asked Questions (FAQ's)" subtitle="Everything you need to know about medical treatment abroad" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-primary/20 bg-white overflow-hidden hover:border-primary/40 transition-colors">
              <Accordion type="single" collapsible>
                <AccordionItem value={`faq-${i}`} className="border-0">
                  <AccordionTrigger className="font-heading font-semibold text-left text-sm md:text-base py-4 px-5 hover:no-underline hover:text-primary text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed px-5 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}