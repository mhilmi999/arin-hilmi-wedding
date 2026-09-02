import { Suspense } from "react";

import ClosingSection from "@/components/wedding/ClosingSection";
import CoupleSection from "@/components/wedding/CoupleSection";
import CoverSection from "@/components/wedding/CoverSection";
import EventSection from "@/components/wedding/EventSection";
import GallerySection from "@/components/wedding/GallerySection";
import QuranSection from "@/components/wedding/QuranSection";
import WeddingMusic from "@/components/wedding/WeddingMusic";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-wedding-ivory">
      <Suspense fallback={<div className="min-h-screen bg-[#F6F0E6]" />}>
        <CoverSection />
      </Suspense>

      <QuranSection />
      <CoupleSection />
      <EventSection />
      <GallerySection />
      <ClosingSection />
      <WeddingMusic />
    </main>
  );
}
