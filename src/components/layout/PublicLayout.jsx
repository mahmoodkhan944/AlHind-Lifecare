import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SideHelpBar from "@/components/common/SideHelpBar";
import LeadModal from "@/components/common/LeadModal";
import { LeadModalProvider } from "@/lib/LeadModalContext";

export default function PublicLayout() {
  return (
    <LeadModalProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <SideHelpBar />
        <LeadModal />
      </div>
    </LeadModalProvider>
  );
}