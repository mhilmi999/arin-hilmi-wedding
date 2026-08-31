"use client";

import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";

import { wedding } from "@/data/wedding";

export default function CoverSection() {
  const searchParams = useSearchParams();

  const guestName =
    searchParams.get("to")?.trim() || "Bapak/Ibu/Saudara/i";

  const handleOpenInvitation = () => {
    document
      .getElementById("quran")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#F6F0E6] px-6 py-10 text-[#32352F]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#B49A72]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#485340]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center"
      >
        <p className="mb-8 text-xs tracking-[0.35em] text-[#846B54]">
          26 · 12 · 2026
        </p>

        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#485340]">
          The Wedding of
        </p>

        <h1 className="font-serif text-6xl leading-none tracking-tight text-[#485340]">
          {wedding.couple.bride.shortName}
          <span className="mx-2 font-normal text-[#B49A72]">&</span>
          {wedding.couple.groom.shortName}
        </h1>

        <div className="my-10 h-px w-16 bg-[#B49A72]/70" />

        <p className="text-sm text-[#846B54]">Kepada Yth.</p>

        <motion.p
          key={guestName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xl font-medium text-[#32352F]"
        >
          {guestName}
        </motion.p>

        <p className="mt-6 max-w-xs text-sm leading-6 text-[#32352F]/70">
          Dengan penuh kebahagiaan, kami mengundang
          Bapak/Ibu/Saudara/i untuk hadir di hari pernikahan kami.
        </p>

        <motion.button
          type="button"
          onClick={handleOpenInvitation}
          whileTap={{ scale: 0.97 }}
          className="mt-10 rounded-full bg-[#485340] px-8 py-3.5 text-sm font-medium tracking-wide text-[#F6F0E6] transition hover:bg-[#3C4636]"
        >
          Buka Undangan
        </motion.button>
      </motion.div>
    </section>
  );
}