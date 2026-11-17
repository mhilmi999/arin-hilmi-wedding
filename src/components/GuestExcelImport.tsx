"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { cleanGuestName, guestCategories, type GuestCategory } from "@/lib/invitation";
import { readGuestWorkbook, type SpreadsheetSheet } from "@/lib/xlsx-guest-reader";

export type ImportedGuest = { name: string; category: GuestCategory; phone: string };
type Props = { onImport: (guests: ImportedGuest[]) => { added: number; skipped: number } };

function cleanKey(value: string): string {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function detectColumn(row: string[], type: "name" | "phone" | "category"): number {
  const patterns = {
    name: /^(nama(tamu|undangan|penerima|lengkap|guest)?|guestname|penerima)$/,
    phone: /^(no|nomor)?(hp|wa|whatsapp|telepon|telp|handphone|ponsel)|^(phone|mobile|contactnumber)$/,
    category: /^(kategori|kategoritamu|jenistamu|golongan|kelompok|relasi|hubungan|group|grup|category)$/,
  };
  return row.findIndex((value) => patterns[type].test(cleanKey(value || "")));
}

function bestHeader(rows: string[][]): number {
  let best = 0;
  let score = -1;
  for (let i = 0; i < Math.min(16, rows.length); i++) {
    const row = rows[i];
    const current = (detectColumn(row, "name") >= 0 ? 4 : 0) +
      (detectColumn(row, "phone") >= 0 ? 1 : 0) + (detectColumn(row, "category") >= 0 ? 1 : 0);
    if (current > score) { best = i; score = current; }
  }
  return best;
}

function categorize(value: string, fallback: GuestCategory): GuestCategory {
  const text = value.toLowerCase();
  if (/keluarga|family|famili/.test(text)) return "keluarga";
  if (/senior|vip|pimpinan|pejabat|direksi/.test(text)) return "senior";
  if (/teman|rekan|kantor|pegawai|pelaksana|sahabat|kolega|friend|staff|staf/.test(text)) return "rekan";
  if (/umum|general/.test(text)) return "umum";
  return fallback;
}

const selectStyle = "mt-1 block w-full rounded-lg border border-[#DED4C3] bg-white p-2 text-sm";

export default function GuestExcelImport({ onImport }: Props) {
  const [sheets, setSheets] = useState<SpreadsheetSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [nameIndex, setNameIndex] = useState(-1);
  const [categoryIndex, setCategoryIndex] = useState(-1);
  const [phoneIndex, setPhoneIndex] = useState(-1);
  const [defaultCategory, setDefaultCategory] = useState<GuestCategory>("umum");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const sheet = sheets[sheetIndex];
  const headers = sheet?.rows[headerIndex] || [];
  const countColumns = Math.min(60, Math.max(1, ...(sheet?.rows || []).slice(0, 40).map((row) => row.length)));
  const options = Array.from({ length: countColumns }, (_, index) => ({
    value: index,
    label: `${index + 1}. ${headers[index]?.trim() || `Kolom ${index + 1}`}`,
  }));

  function pickSheet(next: SpreadsheetSheet[], index: number) {
    const idx = bestHeader(next[index]?.rows || []);
    const header = next[index]?.rows[idx] || [];
    setSheetIndex(index);
    setHeaderIndex(idx);
    setNameIndex(detectColumn(header, "name"));
    setCategoryIndex(detectColumn(header, "category"));
    setPhoneIndex(detectColumn(header, "phone"));
    setStatus("");
    setError("");
  }

  async function loadFile(file?: File) {
    if (!file) return;
    setLoading(true);
    setError("");
    setStatus("");
    setSheets([]);
    setFilename(file.name);
    try {
      const loaded = await readGuestWorkbook(file);
      setSheets(loaded);
      const suggested = loaded.findIndex((item) => /tamu|undangan|guest|invite|keluarga|rekan/i.test(item.name));
      pickSheet(loaded, suggested >= 0 ? suggested : 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal membaca file Excel.");
    } finally {
      setLoading(false);
    }
  }

  const importable = useMemo(() => {
    if (!sheet || nameIndex < 0) return [];
    return sheet.rows.slice(headerIndex + 1).map((row) => ({
      name: cleanGuestName(row[nameIndex] || ""),
      category: categoryIndex < 0 ? defaultCategory : categorize(row[categoryIndex] || "", defaultCategory),
      phone: phoneIndex < 0 ? "" : (row[phoneIndex] || "").replace(/\s/g, ""),
    })).filter((item) => item.name && !/^(total|jumlah|subtotal|nama|no|nomor|grand total)$/i.test(item.name));
  }, [sheet, headerIndex, nameIndex, categoryIndex, phoneIndex, defaultCategory]);

  return <details className="mt-6 rounded-2xl border border-[#D8C7A8] bg-white/80 p-4">
    <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#485340]"><FileSpreadsheet size={18} /> Impor daftar tamu dari Excel (.xlsx)</summary>
    <p className="mt-3 text-xs leading-5 text-[#65685E]">Impor nama sekaligus dari Excel, lalu cari melalui suggestion. Data diproses dan disimpan hanya di browser ini; tidak dikirim ke server.</p>
    <label className="mt-4 block text-xs font-medium" htmlFor="guest-file">Pilih file Excel</label>
    <input id="guest-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void loadFile(event.target.files?.[0])} className="mt-1 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#485340] file:px-3 file:py-2 file:text-white" />
    {loading && <p className="mt-3 text-xs">Membaca workbook...</p>}
    {filename && !loading && <p className="mt-2 text-xs text-[#65685E]">File: {filename}</p>}
    {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700" role="alert">{error}</p>}
    {!!sheet && !loading && <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium">Sheet Excel
          <select value={sheetIndex} onChange={(event) => pickSheet(sheets, Number(event.target.value))} className={selectStyle}>
            {sheets.map((item, index) => <option key={index} value={index}>{item.name} ({item.rows.length} baris)</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium">Baris judul kolom
          <select value={headerIndex} onChange={(event) => {
            const next = Number(event.target.value);
            setHeaderIndex(next);
            setNameIndex(detectColumn(sheet.rows[next] || [], "name"));
            setPhoneIndex(detectColumn(sheet.rows[next] || [], "phone"));
            setCategoryIndex(detectColumn(sheet.rows[next] || [], "category"));
          }} className={selectStyle}>
            {sheet.rows.slice(0, 25).map((row, index) => <option key={index} value={index}>Baris {index + 1}: {row.filter(Boolean).slice(0, 3).join(" · ").slice(0, 70)}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium">Kolom nama tamu (wajib)
          <select value={nameIndex} onChange={(event) => setNameIndex(Number(event.target.value))} className={selectStyle}>
            <option value={-1}>— Pilih kolom nama —</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium">Kolom kategori (opsional)
          <select value={categoryIndex} onChange={(event) => setCategoryIndex(Number(event.target.value))} className={selectStyle}>
            <option value={-1}>— Tidak ada —</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium">Kolom WhatsApp (opsional)
          <select value={phoneIndex} onChange={(event) => setPhoneIndex(Number(event.target.value))} className={selectStyle}>
            <option value={-1}>— Tidak ada —</option>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium">Kategori default jika tak tersedia di Excel
          <select value={defaultCategory} onChange={(event) => setDefaultCategory(event.target.value as GuestCategory)} className={selectStyle}>
            {guestCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>
      {nameIndex >= 0 ? <>
        <p className="mt-4 text-xs font-semibold text-[#485340]">Pratinjau: {importable.length} baris calon tamu</p>
        <div className="mt-2 max-h-32 overflow-auto rounded-lg border border-[#E6D9C6] bg-[#F6F0E6] p-3 text-xs">
          {importable.slice(0, 6).map((item, index) => <p key={index} className="py-0.5">{index + 1}. {item.name} · {guestCategories.find((cat) => cat.value === item.category)?.label}</p>)}
          {!importable.length && "Tidak ada nama yang dapat diimpor."}
        </div>
        <button type="button" disabled={!importable.length} onClick={() => {
          const result = onImport(importable);
          setStatus(`${result.added} tamu ditambahkan, ${result.skipped} duplikat dilewati. Sekarang cari nama lewat kolom pencarian.`);
        }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#485340] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Upload size={16} /> Impor {importable.length} nama</button>
      </> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Kolom nama belum terdeteksi. Pilih sheet dan kolom nama tamu. Kalau workbook hanya berisi anggaran/persiapan, diperlukan sheet daftar tamu.</p>}
    </>}
    {status && <p className="mt-3 rounded-lg bg-[#EEF0E6] p-3 text-sm text-[#485340]" role="status">{status}</p>}
  </details>;
}
