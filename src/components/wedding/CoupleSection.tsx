import { wedding } from "@/data/wedding";

export default function CoupleSection() {
  const { bride, groom } = wedding.couple;

  return (
    <section
      id="couple"
      className="relative overflow-hidden bg-[#F6F0E6] px-6 py-24 text-[#32352F] md:py-32"
    >
      {/* subtle decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full border border-[#B49A72]/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-32 h-64 w-64 rounded-full border border-[#B49A72]/10"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#846B54] md:text-xs">
          Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
        </p>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#32352F]/70 md:text-[0.95rem]">
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta&apos;ala,
          kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri
          acara pernikahan kami.
        </p>

        <div className="mt-16 grid items-start gap-12 md:mt-20 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          {/* Bride */}
          <div>
            <div className="mx-auto mb-8 aspect-[4/5] w-full max-w-[270px] rounded-[999px_999px_36px_36px] border border-[#B49A72]/35 bg-[#EAE0D1]" />

            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#846B54]">
              The Bride
            </p>

            <h2 className="mt-3 font-serif text-5xl leading-none text-[#485340] md:text-6xl">
              {bride.shortName}
            </h2>

            <p className="mx-auto mt-5 max-w-sm font-serif text-xl leading-snug text-[#32352F] md:text-2xl">
              {bride.fullName}
            </p>

            <div className="mx-auto my-6 h-px w-10 bg-[#B49A72]/50" />

            <p className="text-xs uppercase tracking-[0.18em] text-[#846B54]/80">
              {bride.relation}
            </p>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#32352F]/72">
              {bride.father}
            </p>

            <p className="mt-1 font-serif text-xl italic text-[#B49A72]">
              &
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#32352F]/72">
              {bride.mother}
            </p>
          </div>

          {/* Ampersand */}
          <div className="flex items-center justify-center md:min-h-[520px]">
            <div className="flex items-center gap-4 md:flex-col">
              <span className="h-px w-10 bg-[#B49A72]/30 md:h-10 md:w-px" />

              <span className="font-serif text-5xl italic text-[#B49A72]">
                &
              </span>

              <span className="h-px w-10 bg-[#B49A72]/30 md:h-10 md:w-px" />
            </div>
          </div>

          {/* Groom */}
          <div>
            <div className="mx-auto mb-8 aspect-[4/5] w-full max-w-[270px] rounded-[999px_999px_36px_36px] border border-[#B49A72]/35 bg-[#EAE0D1]" />

            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#846B54]">
              The Groom
            </p>

            <h2 className="mt-3 font-serif text-5xl leading-none text-[#485340] md:text-6xl">
              {groom.shortName}
            </h2>

            <p className="mx-auto mt-5 max-w-sm font-serif text-xl leading-snug text-[#32352F] md:text-2xl">
              {groom.fullName}
            </p>

            <div className="mx-auto my-6 h-px w-10 bg-[#B49A72]/50" />

            <p className="text-xs uppercase tracking-[0.18em] text-[#846B54]/80">
              {groom.relation}
            </p>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#32352F]/72">
              {groom.father}
            </p>

            <p className="mt-1 font-serif text-xl italic text-[#B49A72]">
              &
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#32352F]/72">
              {groom.mother}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}