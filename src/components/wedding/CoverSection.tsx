"use client";

import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";

import { wedding } from "@/data/wedding";

export default function CoverSection() {
  const searchParams = useSearchParams();
  const guestName = searchParams.get("to")?.trim() || "Bapak/Ibu/Saudara/i";

  const handleOpenInvitation = () => {
    window.dispatchEvent(new Event("wedding:open"));
    document.getElementById("quran")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#F6F0E6] px-6 py-10 text-[#32352F]">
      {/*
       * Place the chosen cover photo at public/images/cover.webp.
       * The layered gradients intentionally keep the portrait soft rather than crystal clear.
       */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-[center_68%] opacity-70"
        style={{ backgroundImage: "url('./images/cover.webp')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,240,230,0.98)_0%,rgba(246,240,230,0.82)_28%,rgba(246,240,230,0.45)_58%,rgba(60,70,54,0.35)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#32352F]/35 to-transparent"
      />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#9AAEC0]/16 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rounded-full bg-[#B49A72]/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-md flex-col items-center text-center"
      >
        <div className="pt-[8svh]">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#485340]">
            The Wedding of
          </p>

          <h1 className="mt-5 font-serif text-6xl leading-none tracking-tight text-[#485340] sm:text-7xl">
            {wedding.couple.bride.shortName}
            <span className="mx-2 font-normal italic text-[#B49A72]">&</span>
            {wedding.couple.groom.shortName}
          </h1>
        </div>

        <div className="mt-auto w-full pb-2">
          <div className="mx-auto mb-7 h-px w-14 bg-[#D8C7A8]/75" />

          <p className="text-sm text-[#F6F0E6]/78">Kepada Yth.</p>
          <motion.p
            key={guestName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 font-serif text-2xl font-medium text-[#F6F0E6]"
          >
            {guestName}
          </motion.p>

          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#F6F0E6]/78">
            Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i
            untuk hadir di hari pernikahan kami.
          </p>

          <motion.button
            type="button"
            onClick={handleOpenInvitation}
            whileTap={{ scale: 0.97 }}
            className="mt-7 rounded-full border border-[#F6F0E6]/35 bg-[#485340]/88 px-8 py-3.5 text-sm font-medium tracking-wide text-[#F6F0E6] shadow-[0_12px_35px_rgba(50,53,47,0.2)] backdrop-blur-sm transition hover:bg-[#3C4636]"
          >
            Buka Undangan
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
