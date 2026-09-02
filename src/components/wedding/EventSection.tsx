"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { wedding } from "@/data/wedding";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EMPTY_COUNTDOWN: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getCountdown(target: number): Countdown {
  const distance = Math.max(target - Date.now(), 0);

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export default function EventSection() {
  const targetDate = useMemo(() => new Date(wedding.date).getTime(), []);
  const [countdown, setCountdown] = useState<Countdown>(EMPTY_COUNTDOWN);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(targetDate));
      setIsReady(true);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${wedding.venue.name}, ${wedding.venue.address}`,
  )}`;

  const countdownItems = [
    ["Hari", countdown.days],
    ["Jam", countdown.hours],
    ["Menit", countdown.minutes],
    ["Detik", countdown.seconds],
  ] as const;

  return (
    <section
      id="acara"
      className="relative overflow-hidden bg-[#EDE4D6] px-6 py-24 text-[#32352F]"
    >
      <div className="pointer-events-none absolute -left-28 top-36 h-72 w-72 rounded-full bg-[#485340]/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-36 h-64 w-64 rounded-full bg-[#9AAEC0]/10 blur-3xl" />

      <div className="relative mx-auto max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#846B54]">
          Save The Date
        </p>

        <h2 className="mt-5 whitespace-nowrap font-serif text-[2.65rem] leading-none text-[#485340] sm:text-6xl">
          26 Desember 2026
        </h2>

        <div className="mx-auto my-9 h-px w-16 bg-[#B49A72]/55" />

        <p className="mx-auto max-w-sm text-sm leading-7 text-[#32352F]/70">
          InsyaAllah, hari yang kami nantikan akan tiba dalam
        </p>

        <div className="mt-7 grid grid-cols-4 gap-2.5 sm:gap-3">
          {countdownItems.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#B49A72]/20 bg-[#F6F0E6]/90 px-2 py-4 shadow-[0_8px_30px_rgba(72,83,64,0.05)] backdrop-blur-sm"
            >
              <p className="font-serif text-2xl font-semibold tabular-nums text-[#485340] sm:text-3xl">
                {isReady ? String(value).padStart(2, "0") : "--"}
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#846B54] sm:text-[0.68rem]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2.25rem] border border-[#B49A72]/20 bg-[#F6F0E6] px-6 py-8 shadow-[0_18px_50px_rgba(72,83,64,0.07)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full border border-[#B49A72]/15" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full border border-[#9AAEC0]/20" />

          <div className="relative">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#846B54]">
              Wedding Day
            </p>

            <p className="mt-4 font-serif text-3xl leading-none text-[#485340] sm:text-4xl">
              Sabtu
            </p>

            <p className="mt-1 font-serif text-3xl text-[#485340] sm:text-4xl">
              26 Desember 2026
            </p>

            <div className="mx-auto my-6 h-px w-12 bg-[#B49A72]/35" />

            <div className="grid grid-cols-2 divide-x divide-[#B49A72]/20">
              <div className="px-2 sm:px-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#846B54]">
                  Akad Nikah
                </p>
                <p className="mt-3 font-serif text-[1.45rem] leading-tight text-[#485340] sm:text-3xl">
                  {wedding.akad.time}
                </p>
              </div>

              <div className="px-2 sm:px-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#846B54]">
                  Resepsi
                </p>
                <p className="mt-3 font-serif text-[1.45rem] leading-tight text-[#485340] sm:text-3xl">
                  {wedding.reception.time}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-[2rem] bg-[#485340] px-7 py-9 text-[#F6F0E6] shadow-[0_22px_60px_rgba(50,53,47,0.16)]">
          <MapPin aria-hidden="true" className="mx-auto h-5 w-5 text-[#D8C7A8]" />
          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#D8C7A8]">
            Lokasi Acara
          </p>
          <h3 className="mt-4 font-serif text-3xl">{wedding.venue.name}</h3>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#F6F0E6]/70">
            {wedding.venue.address}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center justify-center rounded-full border border-[#D8C7A8]/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F6F0E6] transition hover:bg-[#F6F0E6] hover:text-[#485340]"
          >
            Buka Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
