export type GuestCategory = "umum" | "senior" | "keluarga" | "rekan";

export type WeddingGuest = {
  id: string;
  name: string;
  category: GuestCategory;
  phone?: string;
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

export function guestDisplayName(guest: Pick<WeddingGuest, "name" | "category">): string {
  const name = cleanGuestName(guest.name);
  if (guest.category !== "keluarga" || /(?:&|dan|beserta)\s+keluarga\b/i.test(name)) return name;
  return `${name} & Keluarga`;
}

// Two words of the person's name, preserving a leading honorific and family suffix.
export function shortGuestName(guest: Pick<WeddingGuest, "name" | "category">): string {
  const full = cleanGuestName(guest.name).replace(/\s*(?:&|dan|beserta)\s+keluarga\s*$/i, "");
  const words = full.split(" ").filter(Boolean);
  const honorifics = /^(bapak|ibu|pak|bu|mas|mbak|kak|dr\.?|drg\.?|prof\.?|h\.?|hj\.?)$/i;
  const prefix: string[] = [];
  while (words.length && honorifics.test(words[0])) prefix.push(words.shift()!);
  const short = [...prefix, ...words.slice(0, 2)].join(" ") || full;
  return guest.category === "keluarga" ? `${short} & Keluarga` : short;
}

export function invitationBasePath(pathname: string): string {
  return pathname.replace(/\/tamu(?:\/index\.html|\/|\.html)?$/, "").replace(/\/$/, "");
}

export function invitationPath(guest: Pick<WeddingGuest, "name" | "category">, basePath = ""): string {
  const params = new URLSearchParams({ to: guestDisplayName(guest), kategori: guest.category });
  return `${basePath.replace(/\/$/, "")}/?${params.toString()}`;
}

export function whatsappMessage(guest: Pick<WeddingGuest, "name" | "category">, url: string): string {
  const salutation = guestSalutation(guest.category);
  return `UNDANGAN PERNIKAHAN 💌\n━━━━━━━━━━━━━━━━━━\n\nAssalamu'alaikum Wr. Wb.\n\n${salutation}\n${shortGuestName(guest)}\n\nDengan memohon rahmat dan ridho Allah SWT, kami bermaksud membagikan kabar bahagia serta memohon doa restu pada acara pernikahan kami:\n\nArin & Hilmi\n\nSabtu, 26 Desember 2026\n\nDetail acara:\n${url}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila berkenan hadir dan memberikan doa restu.\n\nWassalamu'alaikum Wr. Wb.\n\nArin & Hilmi`;
}

export function whatsappLink(message: string, phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}`
    : /^8\d{8,14}$/.test(digits) ? `62${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
