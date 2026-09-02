const galleryImages = [
  { src: "./images/gallery/01.webp", position: "center" },
  { src: "./images/gallery/02.webp", position: "center" },
  { src: "./images/gallery/03.webp", position: "center" },
  { src: "./images/gallery/04.webp", position: "center" },
  { src: "./images/gallery/05.webp", position: "center" },
  { src: "./images/gallery/06.webp", position: "center" },
] as const;

export default function GallerySection() {
  return (
    <section
      id="galeri"
      className="relative overflow-hidden bg-[#F6F0E6] px-4 py-24 text-[#32352F] sm:px-6"
    >
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#9AAEC0]/9 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-64 w-64 rounded-full bg-[#B49A72]/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <div className="px-2 text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#846B54]">
            Our Moments
          </p>
          <h2 className="mt-4 font-serif text-5xl leading-none text-[#485340] sm:text-6xl">
            Photo Gallery
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#32352F]/65">
            Sepenggal cerita yang kami simpan, menuju hari yang akan kami
            kenang selamanya.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.src}
              role="img"
              aria-label={`Foto galeri Arin dan Hilmi ${index + 1}`}
              className="aspect-[3/4] overflow-hidden rounded-[1.4rem] border border-[#B49A72]/15 bg-[#EAE0D1] bg-cover shadow-[0_12px_35px_rgba(72,83,64,0.08)] sm:rounded-[1.75rem]"
              style={{
                backgroundImage: `url('${image.src}')`,
                backgroundPosition: image.position,
              }}
            />
          ))}
        </div>

        <div className="mx-auto mt-12 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#B49A72]/35" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#B49A72]/65" />
          <span className="h-px w-8 bg-[#B49A72]/35" />
        </div>
      </div>
    </section>
  );
}
