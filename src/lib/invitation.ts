export type GuestCategory = "umum" | "senior" | "keluarga" | "rekan";

export type WeddingGuest = {
  id: string;
  name: string;
  category: GuestCategory;
  phone?: string;
  group?: string; // Asal data dari workbook; opsional untuk tamu yang ditambah manual.
  people?: number; // Estimasi jumlah undangan/orang; tidak selalu tersedia (online).
};

export const guestCategories: { value: GuestCategory; label: string }[] = [
  { value: "umum", label: "Tamu umum" },
  { value: "senior", label: "Tamu senior" },
  { value: "keluarga", label: "Undangan keluarga" },
  { value: "rekan", label: "Teman / rekan / pelaksana kantor" },
];

export function cleanGuestName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, 160);
}

export function isGuestCategory(value: string | null): value is GuestCategory {
  return guestCategories.some((category) => category.value === value);
}

export function guestSalutation(category: GuestCategory): string {
  return category === "rekan" ? "Kepada" : "Kepada Yth.";
}

export function guestDisplayName(guest: Pick<WeddingGuest, "name" | "category" | "group">): string {
  const name = cleanGuestName(guest.name).replace(/\s*\+\s*keluarga\s*$/i, " & Keluarga");
  // Excel mencatat anggota keluarga secara individual; jangan menambahkan
  // "& Keluarga" kepada Nadia, Dika, Pakde Teguh, dll secara keliru.
  if (guest.category !== "keluarga" || guest.group || /(?:&|dan|beserta)\s+keluarga\b/i.test(name)) return name;
  return `${name} & Keluarga`;
}

// Two words of the person's name, preserving a leading honorific and family suffix.
export function shortGuestName(guest: Pick<WeddingGuest, "name" | "category" | "group">): string {
  const display = guestDisplayName(guest);
  const suffixMatch = display.match(/\s*(?:&|dan|beserta)\s+(keluarga|partner)\s*$/i);
  const suffix = suffixMatch ? ` & ${suffixMatch[1] === "partner" ? "Partner" : "Keluarga"}` : "";
  const full = suffixMatch ? display.slice(0, -suffixMatch[0].length) : display;
  const words = full.split(" ").filter(Boolean);
  const honorifics = /^(bapak|ibu|pak|bu|mas|mbak|kak|pakde|bude|mbah|eyang|om|tante|keluarga|dr\.?|drg\.?|dr\.techn\.|dr\.eng\.|ir\.?|prof\.?|h\.?|hj\.?)$/i;
  const prefix: string[] = [];
  while (words.length && honorifics.test(words[0])) prefix.push(words.shift()!);
  const short = [...prefix, ...words.slice(0, 2)].join(" ") || full;
  return `${short}${suffix}`;
}

export function invitationBasePath(pathname: string): string {
  return pathname.replace(/\/tamu(?:\/index\.html|\/|\.html)?$/, "").replace(/\/$/, "");
}

export function invitationPath(guest: Pick<WeddingGuest, "name" | "category" | "group">, basePath = ""): string {
  const params = new URLSearchParams({ to: guestDisplayName(guest), kategori: guest.category });
  return `${basePath.replace(/\/$/, "")}/?${params.toString()}`;
}

export function whatsappMessage(guest: Pick<WeddingGuest, "name" | "category" | "group">, url: string): string {
  return `Assalamu’alaikum Warahmatullahi Wabarakatuh,
Bismillahirrahmanirrahim

Dear
${shortGuestName(guest)}

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud membagikan kabar bahagia serta memohon doa restu pada acara pernikahan kami:

Nabilah Arina Khoirunnisa
&
Muhammad Hilmi Ramadhan

yang akan diselenggarakan pada:

Hari/Tanggal: Sabtu, 26 Desember 2026
Waktu Resepsi: 10.00-12.00 WIB
Tempat: Graha YKP Surabaya, Jl. Penjaringan Sari No. 39, Surabaya, Jawa Timur

Detail acara:
${url}

Merupakan kehormatan bagi kami apabila Saudara/i berkenan untuk hadir saat pernikahan kami. Kami memohon doa restu untuk kelancaran dan keberkahan pernikahan yang akan kami jalani.

Wassalamu’alaikum Warahmatullahi Wabarakatuh

Yang berbahagia,
Arin & Hilmi`;
}

export function whatsappLink(message: string, phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}`
    : /^8\d{8,14}$/.test(digits) ? `62${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
