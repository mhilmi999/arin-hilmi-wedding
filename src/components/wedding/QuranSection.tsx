export default function QuranSection() {
  return (
    <section
      id="quran"
      className="relative flex min-h-[90svh] items-center overflow-hidden bg-[#485340] px-6 py-24 text-center text-[#F6F0E6]"
    >
      {/* subtle decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D8C7A8]/5 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <p className="mb-10 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#D8C7A8] md:text-xs">
          QS. Ar-Rum · 21
        </p>

        <p
          lang="ar"
          dir="rtl"
          className="font-arabic mx-auto max-w-2xl text-[1.55rem] font-medium leading-[2] text-[#F8F2E8] md:text-[2rem] md:leading-[2]"
        >
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ
          أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ
          مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ
          لِقَوْمٍ يَتَفَكَّرُونَ
        </p>

        <div className="mx-auto my-10 flex items-center justify-center gap-3 md:my-12">
          <span className="h-px w-8 bg-[#D8C7A8]/30" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#D8C7A8]/70" />
          <span className="h-px w-8 bg-[#D8C7A8]/30" />
        </div>

        <p className="mx-auto max-w-2xl font-serif text-[1.65rem] leading-[1.6] text-[#F6F0E6]/95 md:text-[2.25rem] md:leading-[1.6]">
          “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia
          menciptakan pasangan-pasangan untukmu dari jenismu sendiri,
          agar kamu cenderung dan merasa tenteram kepadanya, dan Dia
          menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada
          yang demikian itu benar-benar terdapat tanda-tanda
          (kebesaran Allah) bagi kaum yang berpikir.”
        </p>

        <p className="mt-8 text-[0.65rem] uppercase tracking-[0.26em] text-[#D8C7A8]/70">
          Ar-Rum · 30:21
        </p>
      </div>
    </section>
  );
}