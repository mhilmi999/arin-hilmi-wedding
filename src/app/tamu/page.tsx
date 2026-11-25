"use client";

import GuestSeedUnlock from "@/components/GuestSeedUnlock";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import {
  cleanGuestName,
  guestCategories,
  guestDisplayName,
  guestSalutation,
  invitationBasePath,
  invitationPath,
  shortGuestName,
  whatsappLink,
  whatsappMessage,
  type GuestCategory,
  type WeddingGuest,
} from "@/lib/invitation";

const STORAGE_KEY = "arin-hilmi-wedding-guests-v1";

function loadGuests(): WeddingGuest[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WeddingGuest =>
      typeof item === "object" && item !== null &&
      typeof item.id === "string" && typeof item.name === "string" &&
      guestCategories.some((category) => category.value === item.category)
    );
  } catch {
    return [];
  }
}

export default function GuestManagerPage() {
  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GuestCategory>("rekan");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [basePath, setBasePath] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBasePath(invitationBasePath(window.location.pathname));
    const saved = loadGuests();
    setGuests(saved);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  }, [guests, ready]);

  const matches = useMemo(() => guests.filter((guest) =>
    guest.name.toLocaleLowerCase("id-ID").includes(query.toLocaleLowerCase("id-ID").trim())
  ).sort((a, b) => a.name.localeCompare(b.name, "id")), [guests, query]);
  // Jumlah penerima dan estimasi orang berbeda; undangan online tidak mempunyai estimasi.
  const excelGuests = guests.filter((guest) => guest.id.startsWith("xl-"));
  const excelPeople = excelGuests.reduce((sum, guest) => sum + (guest.people || 0), 0);
  const excelOnline = excelGuests.filter((guest) => guest.id.startsWith("xl-online-")).length;
  const selected = guests.find((guest) => guest.id === selectedId) || null;
  const link = selected && typeof window !== "undefined" ? `${window.location.origin}${invitationPath(selected, basePath)}` : "";
  const message = selected ? whatsappMessage(selected, link) : "";

  function applySeed(incoming: WeddingGuest[]): { added: number; skipped: number } {
    // GSheet adalah source of truth untuk entri xl-*; jangan menumpuk versi lama.
    // Tamu yang ditambahkan manual dan nomor WA lokal tetap dipertahankan.
    const current = ready ? guests : loadGuests();
    const currentById = new Map(current.map((guest) => [guest.id, guest]));
    const manual = current.filter((guest) => !guest.id.startsWith("xl-"));
    const official = incoming.map((guest) => {
      // Posisi baris Sheet dapat berubah. Jangan menempelkan nomor WA milik
      // baris lama pada nama berbeda jika urutan baris tersisip/bergeser.
      const byId = currentById.get(guest.id);
      const matched = byId?.name === guest.name
        ? byId
        : current.find((item) => item.name === guest.name && item.group === guest.group);
      return { ...guest, phone: matched?.phone || guest.phone || "" };
    });
    const added = incoming.filter((guest) => !currentById.has(guest.id)).length;
    const merged = [...manual, ...official];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setGuests(merged);
    setReady(true);
    setSelectedId((previous) => merged.some((guest) => guest.id === previous) ? previous : "");
    searchRef.current?.focus();
    return { added, skipped: incoming.length - added };
  }

  function addGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = cleanGuestName(name);
    if (!cleaned) return;
    const guest: WeddingGuest = { id: crypto.randomUUID(), name: cleaned, category, phone: phone.trim() };
    setGuests((current) => [...current, guest]);
    setSelectedId(guest.id);
    setQuery("");
    setName("");
    setPhone("");
  }


  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
      window.alert("Tidak dapat menyalin otomatis. Silakan salin dari kotak pratinjau.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F0E6] px-4 py-8 text-[#32352F] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a className="inline-flex items-center gap-2 text-sm text-[#485340] hover:underline" href={`${basePath}/`}><ArrowLeft size={16} /> Kembali ke undangan</a>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#846B54]">Arin & Hilmi · 26 Desember 2026</p>
        <h1 className="mt-2 font-serif text-4xl text-[#485340] sm:text-5xl">Pengelola Tamu</h1>
        <p className="mt-3 text-sm leading-6 text-[#65685E]">Cari nama, pilih penerima, lalu buat pesan dan tautan WhatsApp otomatis.</p>

        <div className="mt-6 rounded-2xl border border-[#D8C7A8] bg-white/70 p-4 text-sm leading-6 text-[#5D624F]">
          Master tamu dari Excel/Google Sheet disimpan terenkripsi. Buka master di browser ini agar semua nama masuk ke suggestion secara otomatis. Nomor WhatsApp tambahan dan data tamu yang sudah dibuka disimpan di browser ini; halaman belum memiliki login admin.
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[#E6D9C6] bg-white/80 p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-[#485340]">Daftar Tamu <span className="font-sans text-sm font-normal text-[#777C6D]">({guests.length} entri)</span></h2>
            <p className="mt-2 text-xs leading-5 text-[#777C6D]">
              {excelGuests.length > 0
                ? `${excelGuests.length} penerima dari Excel · ${excelPeople} estimasi orang di acara · ${excelOnline} undangan online.`
                : "Master Excel terbaru belum dibuka di browser ini. Ada 121 penerima dari enam sheet yang siap dicari."}
            </p>
            <GuestSeedUnlock ready={ready} onUnlock={applySeed} />
            <label className="mt-5 block text-sm font-medium" htmlFor="search-guest">Cari nama tamu</label>
            <div className="relative mt-2"><Search className="absolute left-3 top-3 text-[#846B54]" size={18} />
              <input ref={searchRef} id="search-guest" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: Ahmad, Brian..." autoComplete="off" className="w-full rounded-xl border border-[#DED4C3] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#485340]" />
            </div>
            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-[#E6D9C6]" role="listbox" aria-label="Hasil pencarian tamu">
              {matches.length ? matches.map((guest) => (
                <button type="button" role="option" aria-selected={selectedId === guest.id} key={guest.id} onClick={() => setSelectedId(guest.id)} className={`flex w-full items-center justify-between gap-2 border-b border-[#EFE7DB] px-3 py-3 text-left text-sm last:border-0 hover:bg-[#F6F0E6] ${selectedId === guest.id ? "bg-[#EEF0E6]" : ""}`}>
                  <span><span className="block font-medium">{guestDisplayName(guest)}</span><span className="block text-xs text-[#777C6D]">{guestCategories.find((c) => c.value === guest.category)?.label}{guest.group ? ` · ${guest.group}` : ""}</span></span>
                  {selectedId === guest.id && <Check size={17} className="shrink-0 text-[#485340]" />}
                </button>
              )) : <p className="px-3 py-4 text-sm text-[#777C6D]">{ready ? "Belum ada nama yang cocok. Jika master belum dibuka, gunakan kotak Buka Master di atas." : "Memuat tamu..."}</p>}
            </div>

            <form onSubmit={addGuest} className="mt-6 border-t border-[#E6D9C6] pt-5">
              <h3 className="flex items-center gap-2 font-medium"><Plus size={17} /> Tambah tamu</h3>
              <label className="mt-4 block text-xs font-medium" htmlFor="new-name">Nama lengkap</label>
              <input required id="new-name" maxLength={160} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tamu" className="mt-1 w-full rounded-xl border border-[#DED4C3] bg-white px-3 py-2.5 text-sm" />
              <label className="mt-3 block text-xs font-medium" htmlFor="new-category">Kategori</label>
              <select id="new-category" value={category} onChange={(e) => setCategory(e.target.value as GuestCategory)} className="mt-1 w-full rounded-xl border border-[#DED4C3] bg-white px-3 py-2.5 text-sm">
                {guestCategories.map((c) => <option value={c.value} key={c.value}>{c.label}</option>)}
              </select>
              <label className="mt-3 block text-xs font-medium" htmlFor="new-phone">WhatsApp (opsional)</label>
              <input id="new-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08... atau 62..." className="mt-1 w-full rounded-xl border border-[#DED4C3] bg-white px-3 py-2.5 text-sm" />
              <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#485340] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3C4636]"><Plus size={16} /> Simpan tamu</button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#E6D9C6] bg-white/80 p-5 shadow-sm">
            <h2 className="font-serif text-2xl text-[#485340]">Undangan Personal</h2>
            {selected ? <>
              <p className="mt-4 text-xs uppercase tracking-widest text-[#846B54]">Pratinjau cover</p>
              <div className="mt-2 rounded-2xl bg-[#F6F0E6] p-5 text-center">
                <p className="text-sm text-[#485340]">{guestSalutation(selected.category)}</p>
                <p className="mt-2 font-serif text-2xl text-[#485340]">{guestDisplayName(selected)}</p>
              </div>
              <p className="mt-5 text-xs font-medium">Tautan undangan</p>
              <p className="mt-1 break-all rounded-xl bg-[#F6F0E6] p-3 text-xs">{link}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => copyValue(link)} className="inline-flex items-center gap-1 rounded-xl border border-[#D8C7A8] px-3 py-2 text-sm"><Copy size={15} /> Salin link</button>
                <a href={invitationPath(selected, basePath)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-[#D8C7A8] px-3 py-2 text-sm"><ExternalLink size={15} /> Pratinjau</a>
              </div>
              <p className="mt-5 text-xs font-medium">Pesan WhatsApp · nama: {shortGuestName(selected)}</p>
              <textarea readOnly rows={13} value={message} aria-label="Pesan WhatsApp" className="mt-2 w-full resize-y rounded-xl border border-[#E6D9C6] bg-[#F6F0E6] p-3 text-xs leading-6" />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => copyValue(message)} className="flex items-center justify-center gap-2 rounded-xl border border-[#D8C7A8] px-3 py-3 text-sm"><Copy size={16} /> {copied ? "Disalin" : "Salin pesan"}</button>
                <a href={whatsappLink(message, selected.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#485340] px-3 py-3 text-sm text-white"><MessageCircle size={16} /> Buka WhatsApp</a>
              </div>
              <button type="button" onClick={() => {
                if (!window.confirm(`Hapus ${selected.name} dari daftar tamu?`)) return;
                setGuests((current) => current.filter((guest) => guest.id !== selected.id));
                setSelectedId("");
                setCopied(false);
              }} className="mt-5 flex items-center gap-2 text-xs text-red-700 hover:underline"><Trash2 size={14} /> Hapus tamu ini</button>
            </> : <p className="mt-6 text-sm leading-6 text-[#777C6D]">Pilih tamu dari hasil pencarian di sebelah kiri, atau tambah tamu baru terlebih dahulu.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
