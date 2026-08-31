import { wedding } from "@/data/wedding";

export default function EventSection() {
  return (
    <section className="bg-[#EDE4D6] px-6 py-24 text-[#32352F]">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#846B54]">
          Save The Date
        </p>

        <h2 className="mt-4 font-serif text-5xl text-[#485340]">
          26 Desember
        </h2>

        <p className="mt-1 font-serif text-3xl text-[#B49A72]">
          2026
        </p>

        <div className="mx-auto my-12 h-px w-16 bg-[#B49A72]/50" />

        <div className="rounded-3xl bg-[#F6F0E6] p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#846B54]">
            Akad Nikah
          </p>

          <h3 className="mt-4 font-serif text-2xl text-[#485340]">
            {wedding.akad.date}
          </h3>

          <p className="mt-2 text-sm font-medium">{wedding.akad.time}</p>

          <p className="mt-6 font-medium text-[#485340]">
            {wedding.venue.name}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#32352F]/65">
            {wedding.venue.address}
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-[#F6F0E6] p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#846B54]">
            Resepsi Pernikahan
          </p>

          <h3 className="mt-4 font-serif text-2xl text-[#485340]">
            {wedding.reception.date}
          </h3>

          <p className="mt-2 text-sm font-medium">
            {wedding.reception.time ?? "Waktu akan diinformasikan kemudian"}
          </p>

          <p className="mt-6 font-medium text-[#485340]">
            {wedding.venue.name}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#32352F]/65">
            {wedding.venue.address}
          </p>
        </div>
      </div>
    </section>
  );
}