import { wedding } from "@/data/wedding";

type Person = (typeof wedding.couple)["bride"] | (typeof wedding.couple)["groom"];

function CoupleProfile({
  person,
  label,
  image,
}: {
  person: Person;
  label: string;
  image: string;
}) {
  return (
    <div>
      <div className="relative mx-auto mb-9 w-full max-w-[275px]">
        <div className="absolute -inset-2 rounded-[48%_48%_44%_44%/56%_56%_44%_44%] border border-[#B49A72]/45" />
        <div
          role="img"
          aria-label={`Foto ${person.shortName}`}
          className="aspect-[4/5] w-full overflow-hidden rounded-[48%_48%_44%_44%/56%_56%_44%_44%] border-4 border-[#F6F0E6] bg-[#EAE0D1] bg-cover bg-center shadow-[0_18px_45px_rgba(72,83,64,0.12)]"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <span className="absolute -bottom-4 left-1/2 h-8 w-8 -translate-x-1/2 rotate-45 border border-[#B49A72]/45 bg-[#F6F0E6]" />
      </div>

      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#846B54]">
        {label}
      </p>

      <h2 className="mt-3 font-serif text-5xl leading-none text-[#485340] md:text-6xl">
        {person.shortName}
      </h2>

      <p className="mx-auto mt-5 max-w-sm font-serif text-xl leading-snug text-[#32352F] md:text-2xl">
        {person.fullName}
      </p>

      <div className="mx-auto my-6 h-px w-10 bg-[#B49A72]/50" />

      <p className="text-xs uppercase tracking-[0.18em] text-[#846B54]/80">
        {person.relation}
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#32352F]/72">
        {person.father}
      </p>
      <p className="mt-1 font-serif text-xl italic text-[#B49A72]">&</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#32352F]/72">
        {person.mother}
      </p>
    </div>
  );
}

export default function CoupleSection() {
  const { bride, groom } = wedding.couple;

  return (
    <section
      id="couple"
      className="relative overflow-hidden bg-[#F6F0E6] px-6 py-24 text-[#32352F] md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full border border-[#B49A72]/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-32 h-64 w-64 rounded-full border border-[#9AAEC0]/15"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#846B54] md:text-xs">
          Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
        </p>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#32352F]/70 md:text-[0.95rem]">
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta&apos;ala, kami
          bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara
          pernikahan kami.
        </p>

        <div className="mt-16 grid items-start gap-12 md:mt-20 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <CoupleProfile
            person={bride}
            label="The Bride"
            image="./images/bride.webp"
          />

          <div className="flex items-center justify-center md:min-h-[560px]">
            <div className="flex items-center gap-4 md:flex-col">
              <span className="h-px w-10 bg-[#B49A72]/30 md:h-10 md:w-px" />
              <span className="font-serif text-5xl italic text-[#B49A72]">&</span>
              <span className="h-px w-10 bg-[#B49A72]/30 md:h-10 md:w-px" />
            </div>
          </div>

          <CoupleProfile
            person={groom}
            label="The Groom"
            image="./images/groom.webp"
          />
        </div>
      </div>
    </section>
  );
}
