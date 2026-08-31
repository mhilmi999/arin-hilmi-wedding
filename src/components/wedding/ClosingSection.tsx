import { wedding } from "@/data/wedding";

export default function ClosingSection() {
  const { bride, groom } = wedding.couple;

  return (
    <section className="relative flex min-h-[72svh] items-center overflow-hidden bg-[#F6F0E6] px-6 py-24 text-center text-[#32352F]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#B49A72]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#485340]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#846B54]">
          Terima Kasih
        </p>

        <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-[#32352F]/72">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu kepada
          kami.
        </p>

        <p className="mt-10 text-xs uppercase tracking-[0.24em] text-[#846B54]">
          Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
        </p>

        <div className="mx-auto my-10 h-px w-14 bg-[#B49A72]/60" />

        <p className="font-serif text-5xl leading-none text-[#485340] sm:text-6xl">
          {bride.shortName}
          <span className="mx-2 font-normal italic text-[#B49A72]">&</span>
          {groom.shortName}
        </p>

        <p className="mt-5 text-xs font-semibold tracking-[0.3em] text-[#846B54]">
          26 · 12 · 2026
        </p>
      </div>
    </section>
  );
}
