"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole, RefreshCcw } from "lucide-react";
import encrypted from "@/lib/guest-seed.encrypted.json";
import { guestCategories, type WeddingGuest } from "@/lib/invitation";

type Props = {
  ready: boolean;
  onUnlock: (guests: WeddingGuest[]) => { added: number; skipped: number };
};

const MARKER_KEY = "arin-hilmi-guest-master-unlocked-v1";
const STORAGE_KEY = "arin-hilmi-wedding-guests-v1";
const DB_NAME = "arin-hilmi-guest-master-key";
const STORE_NAME = "keys";

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function openKeyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function cachedKey(): Promise<CryptoKey | null> {
  const db = await openKeyDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get("master");
      req.onsuccess = () => resolve(req.result instanceof CryptoKey ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

async function saveKey(key: CryptoKey): Promise<void> {
  const db = await openKeyDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(key, "master");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function keyFromPassphrase(passphrase: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: decodeBase64(encrypted.salt), iterations: encrypted.iterations },
    raw, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
}

async function decryptSeed(key: CryptoKey): Promise<WeddingGuest[]> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64(encrypted.iv) },
    key, decodeBase64(encrypted.ciphertext)
  );
  const json: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  if (!json || typeof json !== "object" || !("guests" in json) || !Array.isArray(json.guests)) {
    throw new Error("Format master tamu tidak dikenali");
  }
  const valid = (json.guests as unknown[]).filter((item): item is WeddingGuest =>
    !!item && typeof item === "object" &&
    "id" in item && typeof item.id === "string" &&
    "name" in item && typeof item.name === "string" &&
    "category" in item && guestCategories.some((category) => category.value === item.category) &&
    "group" in item && typeof item.group === "string"
  );
  if (valid.length !== encrypted.count) throw new Error("Jumlah data tamu tidak sesuai");
  return valid;
}

function masterAlreadyLoaded(): boolean {
  if (localStorage.getItem(MARKER_KEY) !== encrypted.version) return false;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return false;
    const ids = new Set(saved.flatMap((guest: unknown) => (
      guest && typeof guest === "object" && "id" in guest && typeof guest.id === "string" && guest.id.startsWith("xl-")
        ? [guest.id] : []
    )));
    return ids.size === encrypted.count;
  } catch {
    return false;
  }
}

export default function GuestSeedUnlock({ ready, onUnlock }: Props) {
  const unlockRef = useRef(onUnlock);
  useEffect(() => { unlockRef.current = onUnlock; }, [onUnlock]);
  const [alreadyLoaded, setAlreadyLoaded] = useState(false);
  const [showUnlock, setShowUnlock] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (masterAlreadyLoaded()) {
      setAlreadyLoaded(true);
      setShowUnlock(false);
      return;
    }
    let cancelled = false;
    // Kunci AES-GCM non-exportable disimpan hanya di IndexedDB admin browser.
    // Saat hasil sync GSheet baru ter-deploy, browser yang sudah pernah unlock
    // dapat memperbarui daftar secara otomatis tanpa password lagi.
    (async () => {
      try {
        const key = await cachedKey();
        if (!key) return;
        const guests = await decryptSeed(key);
        if (cancelled) return;
        unlockRef.current(guests);
        localStorage.setItem(MARKER_KEY, encrypted.version);
        setAlreadyLoaded(true);
        setShowUnlock(false);
        setStatus(`Master diperbarui otomatis: ${encrypted.count} penerima.`);
      } catch {
        if (!cancelled) {
          setAlreadyLoaded(false);
          setShowUnlock(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [ready]);

  async function handleUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;
    setLoading(true);
    setStatus("");
    try {
      const key = await keyFromPassphrase(password);
      const guests = await decryptSeed(key);
      const { added } = onUnlock(guests);
      localStorage.setItem(MARKER_KEY, encrypted.version);
      try { await saveKey(key); } catch { /* private browsing may block IndexedDB */ }
      setAlreadyLoaded(true);
      setShowUnlock(false);
      setPassword("");
      setStatus(`Master diperbarui: ${encrypted.count} penerima (${added} baru), ${encrypted.peopleTotal} estimasi orang.`);
    } catch {
      setStatus("Kunci tidak cocok atau data master tidak dapat dibuka. Periksa kunci akses.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-[#D8C7A8] bg-[#F8F6F0] p-3 text-sm leading-6 text-[#5D624F]">
      <h2 className="flex items-center gap-2 font-serif text-xl text-[#485340]">
        {alreadyLoaded ? <CheckCircle2 size={19} /> : <LockKeyhole size={19} />}
        Master Tamu dari Excel / Google Sheet
      </h2>
      <p className="mt-1 text-sm text-[#65685E]">
        {encrypted.count} penerima dari enam sheet · {encrypted.peopleTotal} estimasi orang · {encrypted.onlineCount} undangan online.
        {alreadyLoaded
          ? " Daftar terbaru sudah ada di suggestion."
          : " Buka master sekali dengan kunci yang sama agar semua nama langsung muncul."}
        {" "}Master tetap terenkripsi di website publik.
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
            <KeyRound size={16} /> {loading ? "Membuka..." : `Tampilkan ${encrypted.count} nama`}
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => { setShowUnlock(true); setStatus(""); }}
          className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#485340] hover:underline">
          <RefreshCcw size={14} /> Sinkronkan ulang master
        </button>
      )}
      {status && <p role="status" className="mt-2 text-xs">{status}</p>}
    </section>
  );
}
