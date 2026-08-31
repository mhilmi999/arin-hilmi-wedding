import { wedding } from "@/data/wedding";

export default function CoupleSection() {
  const { bride, groom } = wedding.couple;

  return (
    <section className="bg-[#F6F0E6] px-6 py-24 text-[#32352F]">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[#846B54]">
          Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
        </p>

        <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-[#32352F]/75">
          Dengan memohon Rahmat dan Ridho Allah Subhanahu Wa Ta&apos;ala
          kami bermaksud untuk mengundang Bapak/Ibu/Saudara/i untuk
          menghadiri acara pernikahan kami.
        </p>

        {/* Bride */}
        <div className="mt-16">
          <div className="mx-auto mb-8 aspect-[4/5] w-full max-w-[260px] rounded-[999px_999px_32px_32px] border border-[#B49A72]/40 bg-[#EAE0D1]" />

          <h2 className="font-serif text-4xl text-[#485340]">
            {bride.fullName}
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#32352F]/70">
            {bride.parents}
          </p>
        </div>

        <p className="my-14 font-serif text-4xl italic text-[#B49A72]">
          &
        </p>

        {/* Groom */}
        <div>
          <div className="mx-auto mb-8 aspect-[4/5] w-full max-w-[260px] rounded-[999px_999px_32px_32px] border border-[#B49A72]/40 bg-[#EAE0D1]" />

          <h2 className="font-serif text-4xl text-[#485340]">
            {groom.fullName}
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#32352F]/70">
            {groom.parents}
          </p>
        </div>
      </div>
    </section>
  );
}