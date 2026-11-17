"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole, RefreshCcw } from "lucide-react";
import encrypted from "@/lib/guest-seed.encrypted.json";
import { guestCategories, type WeddingGuest } from "@/lib/invitation";

type Props = {
  onUnlock: (guests: WeddingGuest[]) => { added: number; skipped: number };
};

const MARKER_KEY = "arin-hilmi-guest-master-unlocked-v1";

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function unlockSeed(passphrase: string): Promise<WeddingGuest[]> {
  const raw = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: decodeBase64(encrypted.salt), iterations: encrypted.iterations },
    raw, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(encrypted.iv) },
    key, decodeBase64(encrypted.ciphertext)
  );
  const json: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  if (!json || typeof json !== "object" || !("guests" in json) || !Array.isArray(json.guests)) {
    throw new Error("Format master tamu tidak dikenali");
  }
  const records = json.guests as unknown[];
  const valid = records.filter((item): item is WeddingGuest =>
    !!item && typeof item === "object" &&
    "id" in item && typeof item.id === "string" &&
    "name" in item && typeof item.name === "string" &&
    "category" in item && guestCategories.some((category) => category.value === item.category) &&
    "group" in item && typeof item.group === "string"
  );
  if (valid.length !== encrypted.count) throw new Error("Jumlah data tamu tidak sesuai");
  return valid;
}

export default function GuestSeedUnlock({ onUnlock }: Props) {
  const [alreadyLoaded, setAlreadyLoaded] = useState(false);
  const [showUnlock, setShowUnlock] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (localStorage.getItem(MARKER_KEY) === "1") {
      setAlreadyLoaded(true);
      setShowUnlock(false);
    }
  }, []);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;
    setLoading(true);
    setStatus("");
    try {
      const guests = await unlockSeed(password);
      const { added, skipped } = onUnlock(guests);
      localStorage.setItem(MARKER_KEY, "1");
      setAlreadyLoaded(true);
      setShowUnlock(false);
      setPassword("");
      setStatus(`Master Excel dipulihkan: ${added} nama ditambahkan, ${skipped} sudah ada.`);
    } catch {
      setStatus("Kunci tidak cocok atau data master tidak dapat dibuka. Periksa kunci akses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#D8C7A8] bg-white/80 p-4 text-sm leading-6 text-[#5D624F]">
      <h2 className="flex items-center gap-2 font-serif text-xl text-[#485340]">
        {alreadyLoaded ? <CheckCircle2 size={19} /> : <LockKeyhole size={19} />}
        Master Tamu dari Excel
      </h2>
      <p className="mt-1 text-sm text-[#65685E]">
        {encrypted.count} penerima sudah disiapkan dari rekap Arin & Hilmi. Tidak perlu mengunggah Excel lagi.
        Nama dienkripsi di situs publik agar daftar tidak terbaca begitu saja oleh pengunjung.
      </p>
      {showUnlock ? (
        <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={handleUnlock}>
          <input
            type="password" value={password} onChange={(event) => setPassword(event.target.value)}
            placeholder="Kunci akses master tamu" aria-label="Kunci akses master tamu"
            autoComplete="off" required
            className="min-w-0 flex-1 rounded-xl border border-[#DED4C3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#485340]"
          />
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#485340] px-4 py-2.5 text-sm text-white disabled:opacity-60">
            <KeyRound size={16} /> {loading ? "Membuka..." : "Buka daftar"}
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => { setShowUnlock(true); setStatus(""); }}
          className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#485340] hover:underline">
          <RefreshCcw size={14} /> Pulihkan master / tambah data yang hilang
        </button>
      )}
      {status && <p role="status" className="mt-2 text-xs">{status}</p>}
    </section>
  );
}
