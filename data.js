  // data.js - Data Simulasi Aplikasi BayarKita (NIM Ganjil: 221011450631)
const dbSimulasi = {
  // Data Tagihan PLN (12 Digit Angka)
  pln: {
    "123456789012": { nama: "Budi Santoso", daya: "1300 VA", periode: "Juli 2026", pokok: 245000, denda: 0, jatuhTempo: "20-07-2026" },
    "876543210987": { nama: "Siti Aminah", daya: "900 VA", periode: "Juli 2026", pokok: 120000, denda: 5000, jatuhTempo: "20-07-2026" }
  },
  
  // Data Tagihan PDAM (8 Digit Angka)
  pdam: {
    "12345678": { nama: "Hendro Wijaya", wilayah: "Kota Bandung", periode: "Juni 2026", pokok: 85000, denda: 0, jatuhTempo: "25-07-2026" }
  },

  // Data Tagihan Internet (10 Digit Angka)
  internet: {
    "1002003004": { nama: "Ahmad Jalaludin", paket: "IndiHome 50 Mbps", periode: "Juli 2026", pokok: 375000, denda: 0, jatuhTempo: "15-07-2026" }
  },

  // Data Khusus Kampus: Cicilan SPP Berdasarkan NIM (12 Digit Angka)
  spp: {
    "221011450631": {
      nama: "Mahasiswa Ganjil",
      prodi: "Teknik Informatika",
      cicilan: [
        { id: "SPP-01", desc: "SPP Semester Ganjil 2026 - Cicilan 1", amount: 2000000, status: "Belum Lunas" },
        { id: "SPP-02", desc: "SPP Semester Ganjil 2026 - Cicilan 2", amount: 2000000, status: "Belum Lunas" },
        { id: "UTS-2026", desc: "Biaya Ujian Tengah Semester (UTS)", amount: 500000, status: "Belum Lunas" },
        { id: "LAB-2026", desc: "Praktikum Jaringan Komputer", amount: 350000, status: "Lunas" }
      ]
    }
  },

  // Peta awalan nomor HP untuk deteksi operator otomatis
  providerPrefix: {
    "0811": "Telkomsel", "0812": "Telkomsel", "0813": "Telkomsel",
    "0859": "XL Axiata", "0877": "XL Axiata", "0878": "XL Axiata",
    "0815": "Indosat Ooredoo", "0857": "Indosat Ooredoo",
    "0895": "Tri (3)", "0896": "Tri (3)"
  }
};