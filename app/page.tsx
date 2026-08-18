"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyUs from "@/components/WhyUs";
import PrivateSafe from "@/components/PrivateSafe";
import RestaurantPartners from "@/components/RestaurantPartners";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import FoundersNote from "@/components/FoundersNote";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <WhyUs />
        <PrivateSafe />
        <RestaurantPartners />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FoundersNote />
    </>
  );
}
