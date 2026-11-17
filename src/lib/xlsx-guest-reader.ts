/** Small browser-only XLSX reader for guest list import; no uploaded data leaves this device. */
export type SpreadsheetSheet = { name: string; rows: string[][] };

type ZipEntry = { offset: number; size: number; method: number; uncompressed: number };

function parseXml(xml: string, label: string): Document {
  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  if (parsed.getElementsByTagName("parsererror").length) throw new Error(`Format XML ${label} tidak valid.`);
  return parsed;
}

function zipEntries(buffer: ArrayBuffer): Map<string, ZipEntry> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error("File bukan format XLSX/ZIP yang valid.");
  const count = view.getUint16(end + 10, true);
  let pos = view.getUint32(end + 16, true);
  if (count > 1000) throw new Error("Terlalu banyak file di workbook.");
  const decoder = new TextDecoder("utf-8");
  const files = new Map<string, ZipEntry>();
  for (let i = 0; i < count; i++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw new Error("Struktur ZIP tidak valid.");
    const method = view.getUint16(pos + 10, true);
    const size = view.getUint32(pos + 20, true);
    const uncompressed = view.getUint32(pos + 24, true);
    const nameLength = view.getUint16(pos + 28, true);
    const extraLength = view.getUint16(pos + 30, true);
    const commentLength = view.getUint16(pos + 32, true);
    const offset = view.getUint32(pos + 42, true);
    const filename = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLength));
    if (files.has(filename)) throw new Error("Ada entri ZIP duplikat.");
    files.set(filename, { offset, size, method, uncompressed });
    pos += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

async function extract(buffer: ArrayBuffer, entries: Map<string, ZipEntry>, filename: string): Promise<string | null> {
  const item = entries.get(filename);
  if (!item) return null;
  if (item.uncompressed > 30 * 1024 * 1024) throw new Error(`Sheet ${filename} terlalu besar.`);
  const view = new DataView(buffer);
  if (item.offset + 30 > buffer.byteLength || view.getUint32(item.offset, true) !== 0x04034b50) throw new Error("Header XLSX rusak.");
  const start = item.offset + 30 + view.getUint16(item.offset + 26, true) + view.getUint16(item.offset + 28, true);
  if (start + item.size > buffer.byteLength) throw new Error("Konten XLSX terpotong.");
  const bytes = new Uint8Array(buffer, start, item.size);
  if (item.method === 0) return new TextDecoder().decode(bytes);
  if (item.method !== 8) throw new Error("Metode kompresi XLSX tidak didukung.");
  const output = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new TextDecoder().decode(await new Response(output).arrayBuffer());
}

function pathForTarget(target: string): string {
  const segments = (target.startsWith("/") ? target.slice(1) : `xl/${target}`).split("/");
  const normalized: string[] = [];
  for (const part of segments) {
    if (part === "..") normalized.pop();
    else if (part && part !== ".") normalized.push(part);
  }
  const path = normalized.join("/");
  if (!path.startsWith("xl/")) throw new Error("Referensi sheet tidak valid.");
  return path;
}

export async function readGuestWorkbook(file: File): Promise<SpreadsheetSheet[]> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error("Pilih file Excel .xlsx (bukan .xls).");
  if (file.size > 20 * 1024 * 1024) throw new Error("File Excel maksimal 20 MB.");
  const buffer = await file.arrayBuffer();
  const entries = zipEntries(buffer);
  const workbookXml = await extract(buffer, entries, "xl/workbook.xml");
  const relationsXml = await extract(buffer, entries, "xl/_rels/workbook.xml.rels");
  if (!workbookXml || !relationsXml) throw new Error("Workbook tidak memiliki daftar sheet.");
  const workbook = parseXml(workbookXml, "workbook");
  const relations = parseXml(relationsXml, "relationships");
  const paths = new Map<string, string>();
  for (const relation of Array.from(relations.getElementsByTagName("Relationship"))) {
    const id = relation.getAttribute("Id");
    const target = relation.getAttribute("Target");
    if (id && target && !/^\w+:\/\//.test(target)) paths.set(id, pathForTarget(target));
  }
  const sharedXml = await extract(buffer, entries, "xl/sharedStrings.xml");
  const strings = sharedXml ? Array.from(parseXml(sharedXml, "sharedStrings").getElementsByTagName("si"))
    .map((item) => Array.from(item.getElementsByTagName("t")).map((text) => text.textContent || "").join("")) : [];
  const sheets = Array.from(workbook.getElementsByTagName("sheet"));
  if (sheets.length > 40) throw new Error("Workbook terlalu banyak sheet.");
  const result: SpreadsheetSheet[] = [];
  for (const sheet of sheets) {
    const name = sheet.getAttribute("name") || "Sheet";
    const relId = sheet.getAttribute("r:id") || sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    const target = relId ? paths.get(relId) : undefined;
    if (!target) continue;
    const xml = await extract(buffer, entries, target);
    if (!xml) continue;
    const doc = parseXml(xml, name);
    const rows: string[][] = [];
    const sheetRows = Array.from(doc.getElementsByTagName("sheetData")[0]?.getElementsByTagName("row") || []);
    for (const row of sheetRows.slice(0, 20000)) {
      const cells: string[] = [];
      let fallbackIndex = 0;
      for (const cell of Array.from(row.getElementsByTagName("c"))) {
        const position = cell.getAttribute("r")?.match(/^([A-Z]+)/i)?.[1];
        let index = 0;
        if (position) for (const letter of position.toUpperCase()) index = index * 26 + letter.charCodeAt(0) - 64;
        index = position ? index - 1 : fallbackIndex;
        fallbackIndex = index + 1;
        if (index < 0 || index >= 100) continue;
        const raw = cell.getElementsByTagName("v")[0]?.textContent || "";
        const type = cell.getAttribute("t");
        const value = type === "s" ? (strings[Number(raw)] || "")
          : type === "inlineStr" ? Array.from(cell.getElementsByTagName("t")).map((t) => t.textContent || "").join("")
            : raw;
        cells[index] = value.trim();
      }
      if (cells.some(Boolean)) rows.push(cells);
    }
    result.push({ name, rows });
  }
  if (!result.length) throw new Error("Tidak ada sheet yang bisa dibaca.");
  return result;
}
