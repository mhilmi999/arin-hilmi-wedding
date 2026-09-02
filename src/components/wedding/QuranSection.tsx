function QuranStandIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 112"
      className="mx-auto h-auto w-28 text-[#D8C7A8]/65 sm:w-32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M29 26c19-9 38-9 61 5v46c-21-12-40-13-61-5V26Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M151 26c-19-9-38-9-61 5v46c21-12 40-13 61-5V26Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M90 31v46" stroke="currentColor" strokeWidth="1.5" />
      <path d="M56 81 32 105M124 81l24 24M70 78l-16 27M110 78l16 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M39 105h102" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function QuranSection() {
  return (
    <section
      id="quran"
      className="relative flex min-h-[90svh] items-center overflow-hidden bg-[#485340] px-6 py-24 text-center text-[#F6F0E6]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D8C7A8]/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-24 h-56 w-56 rounded-full bg-[#9AAEC0]/7 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <p
          lang="ar"
          dir="rtl"
          className="font-arabic text-[1.55rem] leading-loose text-[#D8C7A8] md:text-[1.85rem]"
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>

        <p className="mt-7 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#D8C7A8]/85 md:text-xs">
          QS. Ar-Rum · 21
        </p>

        <p
          lang="ar"
          dir="rtl"
          className="font-arabic mx-auto mt-8 max-w-2xl text-[1.45rem] font-medium leading-[2] text-[#F8F2E8] md:text-[1.85rem] md:leading-[2]"
        >
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ
          أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ
          مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ
          لِقَوْمٍ يَتَفَكَّرُونَ
        </p>

        <div className="mx-auto my-8 flex items-center justify-center gap-3 md:my-10">
          <span className="h-px w-8 bg-[#D8C7A8]/30" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#D8C7A8]/70" />
          <span className="h-px w-8 bg-[#D8C7A8]/30" />
        </div>

        <p className="mx-auto max-w-xl font-serif text-[1.35rem] leading-[1.65] text-[#F6F0E6]/88 md:text-[1.7rem] md:leading-[1.65]">
          “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan
          pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung
          dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa
          kasih dan sayang. Sungguh, pada yang demikian itu benar-benar
          terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.”
        </p>

        <p className="mt-7 text-[0.62rem] uppercase tracking-[0.26em] text-[#D8C7A8]/65">
          Ar-Rum · 30:21
        </p>

        <div className="mt-10">
          <QuranStandIllustration />
        </div>
      </div>
    </section>
  );
}
