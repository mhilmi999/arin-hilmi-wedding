import { Suspense } from "react";

import CoverSection from "@/components/wedding/CoverSection";
import QuranSection from "@/components/wedding/QoranSection";
import CoupleSection from "@/components/wedding/CoupleSection";
import EventSection from "@/components/wedding/EventSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-wedding-ivory">
      <Suspense fallback={<div className="min-h-screen bg-[#F6F0E6]" />}>
        <CoverSection />
      </Suspense>

      <QuranSection />
      <CoupleSection />
      <EventSection />
    </main>
  );
}