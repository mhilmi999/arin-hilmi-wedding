import { Suspense } from "react";

import CoverSection from "@/components/wedding/CoverSection";
import QuranSection from "@/components/wedding/QuranSection";
import CoupleSection from "@/components/wedding/CoupleSection";
import EventSection from "@/components/wedding/EventSection";
import ClosingSection from "@/components/wedding/ClosingSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-wedding-ivory">
      <Suspense fallback={<div className="min-h-screen bg-[#F6F0E6]" />}>
        <CoverSection />
      </Suspense>

      <QuranSection />
      <CoupleSection />
      <EventSection />
      <ClosingSection />
    </main>
  );
}
