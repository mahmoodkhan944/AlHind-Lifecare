import React from "react";
import HeroSection from "@/components/home/HeroSection";
import HospitalsByCountry from "@/components/home/HospitalsByCountry";
import TopDoctors from "@/components/home/TopDoctors";
import MultiSpecialtyFocus from "@/components/home/MultiSpecialtyFocus";
import LowestQuotes from "@/components/home/LowestQuotes";
import AboutUs from "@/components/home/AboutUs";
import HowWeWork from "@/components/home/HowWeWork";
import OurServices from "@/components/home/OurServices";
import LatestBlogs from "@/components/home/LatestBlogs";
import FAQSection from "@/components/home/FAQSection";
import LatestTestimonials from "@/components/home/LatestTestimonial";

export default function Home() {
  return (
    <div className="mesh-bg">
      <HeroSection />
      <HospitalsByCountry />
      <TopDoctors />
      <MultiSpecialtyFocus />
      <LowestQuotes />
      <AboutUs />
      <HowWeWork />
      <OurServices />
      <LatestTestimonials />
      <LatestBlogs />
      <FAQSection />
    </div>
  );
}