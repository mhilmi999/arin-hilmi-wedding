# Sinkronisasi Google Sheet privat — Wedding Arin & Hilmi

Source: Spreadsheet ID `1OCFSNDby2mERyZKTqgHWO7M1m2RY3w_SZz4-epTNkC4`.

Website ini di-host sebagai **static export di GitHub Pages**. Karena itu,
Google Sheet privat tidak bisa dibaca langsung dari JavaScript browser tanpa
membocorkan kredensial. GitHub Actions mengambil data via service account,
mengenkripsinya menjadi `src/lib/guest-seed.encrypted.json` **hanya selama build**,
lalu menerbitkan hasilnya ke GitHub Pages.

## Setup sekali

1. Pastikan file Drive adalah **Google Spreadsheet asli**, bukan `.xlsx` yang
   hanya disimpan di Drive. Jika masih `.xlsx`, buka dan pilih *Simpan sebagai
   Google Spreadsheet*; ID Google Spreadsheet yang baru perlu menggantikan
   `SHEET_ID` di `scripts/wedding_guest_data.py`.
2. Di Google Cloud Console, buat project, aktifkan **Google Sheets API**, lalu
   buat **Service Account**. Siapkan file JSON key (simpan sebagai rahasia).
3. Buka Spreadsheet Google dan **Share** ke alamat `client_email` dari JSON
   service account dengan izin **Viewer**. Tidak perlu *Anyone with the link*.
4. Pada GitHub repository buka **Settings → Secrets and variables → Actions**.
   Tambahkan *repository secrets*:
   - `GSHEET_SERVICE_ACCOUNT_JSON` = seluruh konten JSON service account.
   - `WEDDING_GUEST_MASTER_KEY` = kunci master tamu yang sebelumnya digunakan
     untuk membuka daftar di website. Jangan tulis kunci ini di source control.
5. Pastikan keenam tab Google Sheet bernama persis:
   `Keluarga Abi`, `Keluarga Mama`, `Tamu KAI`, `Tamu ITS`, `Tamu Arin`, `Sheet2`.
   Struktur kolom masing-masing harus sama dengan workbook terbaru.
6. Jalankan workflow **Deploy Next.js site to Pages** melalui **Actions →
   Run workflow** untuk sinkron pertama. Berikutnya dijalankan otomatis tiap
   enam jam (waktu aktual GitHub Actions dapat terlambat).

## Perilaku data

- Data dari keenam sheet diambil dan dipetakan menjadi master tamu terenkripsi;
  sheet transaksi/vendor/anggaran **diabaikan**.
- Nama yang berubah/dihapus di Google Sheet akan tercermin saat master terbaru
  didekripsi; data lama dengan ID `xl-*` diganti, bukan ditambahkan.
- Entri manual (ID bukan `xl-*`) dan nomor telepon yang sudah diisi di browser
  dipertahankan. Perubahan lokal atas nama/kategori master `xl-*` digantikan
  oleh Google Sheet saat sinkron.
- Browser admin yang pernah membuka master akan mencoba memperbarui otomatis
  menggunakan **CryptoKey non-exportable** yang disimpan di IndexedDB browser.
  Jika browser memblokir IndexedDB atau kunci menjadi tidak valid, masukkan
  lagi kunci master pada halaman `/tamu/`.
- Tidak ada autentikasi admin pada `/tamu/` saat ini. Jangan bagikan kunci
  master atau buka halaman tersebut di perangkat publik. Master disimpan
  terenkripsi di situs, tetapi nama yang sudah dibuka disimpan dalam
  `localStorage` browser admin (bukan server privat).
- Perubahan di Google Sheet tidak realtime; sinkron lewat build setiap 6 jam.

## Uji masalah koneksi

- `403`: service account belum di-share ke Spreadsheet atau Sheets API belum aktif.
- `404`: Spreadsheet ID keliru / file masih `.xlsx` / akses akun salah.
- `400`: salah satu nama tab atau range berubah.
- Gagal dekripsi: secret master key berbeda dari kunci master yang sudah dipakai.

Tidak perlu menanam API key Google ke JavaScript atau membuat Sheet publik.
