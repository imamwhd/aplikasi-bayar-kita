// app.js - Logika Utama Aplikasi BayarKita

// 1. MANAJEMEN STATE (Menyimpan Saldo & Riwayat di Memori Web/LocalStorage)
let appState = {
  saldo: parseInt(localStorage.getItem('bk_saldo')) || 5000000,
  riwayat: JSON.parse(localStorage.getItem('bk_riwayat')) || []
};

// 2. KETIKA WEBSITE PERTAMA KALI DIBUKA
document.addEventListener('DOMContentLoaded', () => {
  updateSaldoDisplay();
  renderRiwayatKeTabel(); // PANGGIL DI SINI agar saat web dibuka riwayat langsung muncul
  switchView('dashboard'); 
});

// 3. FUNGSI UNTUK PINDAH HALAMAN (Single Page Application Style)
function switchView(viewId) {
  // Sembunyikan semua halaman yang memiliki class 'view-section'
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Tampilkan hanya halaman yang sedang diklik user
  const activeSection = document.getElementById(`view-${viewId}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }
}

// 4. FUNGSI UPDATE SALDO
function updateSaldoDisplay() {
  document.getElementById('saldo-display').innerText = `Rp${appState.saldo.toLocaleString('id-ID')}`;
  localStorage.setItem('bk_saldo', appState.saldo);
}

// 5. FUNGSI RESET SALDO KEMBALI KE RP 5 JUTA
function resetSaldo() {
  appState.saldo = 5000000;
  updateSaldoDisplay();
  showToast("Saldo berhasil dikembalikan ke Rp5.000.000", "info");
}

// 6. FUNGSI NOTIFIKASI TOAST (Sistem Pop-up Notifikasi Kustom)
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bgColor = 'bg-emerald-600'; // Default sukses warna hijau
  if (type === 'error') bgColor = 'bg-rose-600'; // Gagal warna merah
  if (type === 'info') bgColor = 'bg-blue-600'; // Info warna biru
  
  toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 pointer-events-auto transition-opacity duration-300 font-medium text-sm`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Hilangkan pop-up otomatis setelah 3 detik
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// LOGIKA UNTUK MENU TAGIHAN UMUM (PLN/PDAM/INTERNET)
// ==========================================

let currentLayananType = 'pln'; // Default awal adalah PLN
let activeTagihanData = null;   // Tempat menyimpan data tagihan sementara setelah dicek

// 1. Fungsi Mengubah Jenis Layanan (PLN / PDAM / Internet)
function setTagihanType(type) {
  currentLayananType = type;
  
  // Ubah gaya warna tombol yang sedang aktif aktif
  document.querySelectorAll('.tagihan-type-btn').forEach(btn => {
    btn.className = "tagihan-type-btn p-3 border border-gray-200 rounded-xl flex flex-col items-center justify-center transition font-medium text-gray-600 text-xs hover:bg-gray-50";
  });
  document.getElementById(`btn-type-${type}`).className = "tagihan-type-btn p-3 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-xl flex flex-col items-center justify-center transition font-bold text-xs";
  
  // Reset input form
  const label = document.getElementById('label-id-pelanggan');
  const input = document.getElementById('input-id-pelanggan');
  input.value = "";
  document.getElementById('error-tagihan').classList.add('hidden');
  resetTagihanView();

  // Ubah petunjuk teks input berdasarkan jenis layanan
  if (type === 'pln') {
    label.innerText = "Nomor Meter / ID Pelanggan PLN";
    input.placeholder = "Contoh: 123456789012 (12 Digit)";
  } else if (type === 'pdam') {
    label.innerText = "Nomor Pelanggan PDAM";
    input.placeholder = "Contoh: 12345678 (8 Digit)";
  } else if (type === 'internet') {
    label.innerText = "Nomor Langganan Internet";
    input.placeholder = "Contoh: 1002003004 (10 Digit)";
  }
}

// Fungsi membersihkan box hasil pencarian ke kondisi awal
function resetTagihanView() {
  document.getElementById('tagihan-placeholder').classList.remove('hidden');
  document.getElementById('tagihan-loading').classList.add('hidden');
  document.getElementById('tagihan-result-box').classList.add('hidden');
  activeTagihanData = null;
}

// 2. Fungsi Tombol "Cek Tagihan" (Validasi Input & Simulasi Loading)
function cekTagihanAction() {
  const inputVal = document.getElementById('input-id-pelanggan').value.trim();
  const errorSpan = document.getElementById('error-tagihan');
  
  // Ambil aturan panjang nomor dari tugas (PLN: 12 digit, PDAM: 8 digit, Internet: 10 digit)
  const lengthRules = { pln: 12, pdam: 8, internet: 10 };
  const targetLength = lengthRules[currentLayananType];
  
  // Validasi Aturan Karakter: Harus angka dan panjangnya pas!
  const regexAngka = new RegExp(`^[0-9]{${targetLength}}$`);

  if (!regexAngka.test(inputVal)) {
    errorSpan.innerText = `⚠️ ID ${currentLayananType.toUpperCase()} harus berisi tepat ${targetLength} digit angka!`;
    errorSpan.classList.remove('hidden');
    return;
  }
  errorSpan.classList.add('hidden'); // Sembunyikan error jika valid

  // Aktifkan State Loading
  document.getElementById('tagihan-placeholder').classList.add('hidden');
  document.getElementById('tagihan-result-box').classList.add('hidden');
  document.getElementById('tagihan-loading').classList.remove('hidden');

  // Beri jeda waktu 1 detik biar seolah-olah membaca database server (Asynchronous)
  setTimeout(() => {
    document.getElementById('tagihan-loading').classList.add('hidden');
    
    // Ambil data dummy dari data.js
    const dataSumber = dbSimulasi[currentLayananType];
    
    if (dataSumber && dataSumber[inputVal]) {
      // Simpan data ke variabel sementara
      activeTagihanData = { ...dataSumber[inputVal], idPel: inputVal, kategori: currentLayananType };
      
      // Kirim data ke fungsi render UI
      renderDataKeTabel();
    } else {
      // Edge Case: Jika data ID tidak ditemukan di data.js
      document.getElementById('tagihan-placeholder').classList.remove('hidden');
      showToast("ID Pelanggan tidak terdaftar atau sudah lunas!", "error");
    }
  }, 1000);
}

// 3. Fungsi Menampilkan Hasil Data Pelanggan ke Layar
function renderDataKeTabel() {
  const container = document.getElementById('tagihan-detail-render');
  const d = activeTagihanData;
  const totalHarga = d.pokok + d.denda;

  // Teks spesifik sesuai jenis produk
  let infoSpesifik = ``;
  if(d.daya) infoSpesifik = `<div><span class="text-gray-400 block text-xs">Daya Listrik</span>${d.daya}</div>`;
  if(d.wilayah) infoSpesifik = `<div><span class="text-gray-400 block text-xs">Wilayah PDAM</span>${d.wilayah}</div>`;
  if(d.paket) infoSpesifik = `<div><span class="text-gray-400 block text-xs">Paket Internet</span>${d.paket}</div>`;

  document.getElementById('badge-layanan').innerText = d.kategori.toUpperCase();

  // Memasukkan kode HTML dinamis dengan Template Literals
  container.innerHTML = `
    <div><span class="text-gray-400 block text-xs">Nama Pelanggan</span><span class="text-gray-900 font-bold">${d.nama}</span></div>
    <div><span class="text-gray-400 block text-xs">Periode Tagihan</span>${d.periode}</div>
    ${infoSpesifik}
    <div><span class="text-gray-400 block text-xs">Batas Jatuh Tempo</span><span class="text-rose-600 font-semibold">${d.jatuhTempo}</span></div>
    <div class="border-t pt-2 mt-2"><span class="text-gray-400 block text-xs">Tagihan Pokok</span>Rp ${d.pokok.toLocaleString('id-ID')}</div>
    <div class="border-t pt-2 mt-2"><span class="text-gray-400 block text-xs">Denda Keterlambatan</span>Rp ${d.denda.toLocaleString('id-ID')}</div>
    <div class="col-span-2 border-t-2 border-dashed pt-3 mt-2 text-base font-black text-indigo-700 flex justify-between">
      <span>Total Pembayaran:</span>
      <span>Rp ${totalHarga.toLocaleString('id-ID')}</span>
    </div>
  `;

  // Munculkan kotak hasil ke layar browser
  document.getElementById('tagihan-result-box').classList.remove('hidden');
}

// 4. Fungsi Proses Pembayaran Saldo & Penyimpanan Riwayat (LocalStorage)
function prosesBayarTagihan() {
  if (!activeTagihanData) return;
  
  const totalCost = activeTagihanData.pokok + activeTagihanData.denda;
  
  // Edge Case: Cek apakah saldo mencukupi
  if (appState.saldo < totalCost) {
    showToast("Gagal! Saldo dompet digital simulasi tidak mencukupi.", "error");
    return;
  }

  // Potong Saldo Utama Aplikasi
  appState.saldo -= totalCost;
  updateSaldoDisplay(); // Perbarui angka di atas layar

  // Cari tahu metode pembayaran apa yang dicentang user
  const metodePilihan = document.querySelector('input[name="metode-bayar"]:checked').value;
  
  // Buat objek data riwayat transaksi baru
  const transaksiBaru = {
    idTrx: 'BK-' + Math.floor(100000 + Math.random() * 900000), // Bikin ID acak
    waktu: new Date().toLocaleString('id-ID'),
    jenis: activeTagihanData.kategori.toUpperCase(),
    nomor: activeTagihanData.idPel,
    nama: activeTagihanData.nama,
    jumlah: totalCost,
    metode: metodePilihan,
    status: "Sukses"
  };

  // Masukkan data baru ke urutan paling atas array riwayat
  appState.riwayat.unshift(transaksiBaru);
  localStorage.setItem('bk_riwayat', JSON.stringify(appState.riwayat));

  showToast("Pembayaran Tagihan Berhasil diproses!", "success");
  
  // Jalankan sistem cetak struk print
  cetakStrukJendelaBaru(transaksiBaru);
  
  // Bersihkan form kembali ke keadaan kosong
  resetTagihanView();
  document.getElementById('input-id-pelanggan').value = "";
}

// 5. Fitur Buka Struk Resmi via window.print()
function cetakStrukJendelaBaru(trx) {
  const jendelaCetak = window.open('', '_blank', 'width=550,height=600');
  jendelaCetak.document.write(`
    <html>
    <head>
      <title>Struk Pembayaran - BayarKita</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 25px; font-size: 14px; }
        .text-center { text-align: center; }
        .garis { border-top: 1px dashed #000; margin: 12px 0; }
        .baris { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .btn-print { background: #4f46e5; color: white; padding: 8px 16px; border: none; font-weight: bold; cursor: pointer; border-radius: 4px; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="text-center">
        <h2>BUKTI PEMBAYARAN RESMI</h2>
        <h3>Aplikasi BayarKita</h3>
        <p>Struk Simulasi Tugas Akhir Frontend Desktop</p>
      </div>
      <div class="garis"></div>
      <div class="baris"><span>NO. TRANSAKSI :</span> <span>${trx.idTrx}</span></div>
      <div class="baris"><span>WAKTU SINKRON :</span> <span>${trx.waktu}</span></div>
      <div class="baris"><span>PRODUK LAYANAN:</span> <span>${trx.jenis}</span></div>
      <div class="baris"><span>ID PELANGGAN  :</span> <span>${trx.nomor}</span></div>
      <div class="baris"><span>NAMA PELANGGAN:</span> <span>${trx.nama}</span></div>
      <div class="baris"><span>METODE BAYAR  :</span> <span>${trx.metode}</span></div>
      <div class="garis"></div>
      <div class="baris" style="font-weight: bold; font-size: 16px;"><span>TOTAL LUNAS  :</span> <span>Rp ${trx.jumlah.toLocaleString('id-ID')}</span></div>
      <div class="garis"></div>
      <div class="text-center" style="color: green; font-weight: bold; margin-top: 20px;">TERIMA KASIH - TRANSAKSI SAH DAN LUNAS</div>
      <br/><br/>
      <div class="text-center no-print">
        <button onclick="window.print()" class="btn-print">Cetak Struk Sekarang (PDF)</button>
      </div>
    </body>
    </html>
  `);
  jendelaCetak.document.close();
}

// ==========================================
// LOGIKA UNTUK MENU UANG KULIAH / SPP (CHECKLIST)
// ==========================================

let activeSppMahasiswa = null; // Menyimpan data profil mahasiswa yang dicari
let selectedSemesterIds = [];  // Menyimpan ID semester yang dicentang oleh user

// 1. Fungsi Pencarian NIM & Validasi Angka
function cekSppAction() {
  const nimVal = document.getElementById('input-nim-spp').value.trim();
  const errorSpan = document.getElementById('error-spp');
  
  // Validasi: NIM disimulasikan harus angka minimal 8 digit
  const regexNim = /^[0-9]{8,12}$/;

  if (!regexNim.test(nimVal)) {
    errorSpan.innerText = "⚠️ NIM tidak valid! Harus berupa angka antara 8 hingga 12 digit.";
    errorSpan.classList.remove('hidden');
    return;
  }
  errorSpan.classList.add('hidden');

  // Switch Tampilan ke Loading
  document.getElementById('spp-placeholder').classList.add('hidden');
  document.getElementById('spp-result-box').classList.add('hidden');
  document.getElementById('spp-loading').classList.remove('hidden');

  // Bersihkan pilihan lama
  selectedSemesterIds = [];

  setTimeout(() => {
    document.getElementById('spp-loading').classList.add('hidden');
    
    // Tarik database simulasi dari objek dbSimulasi.spp di data.js
    const dataMhs = dbSimulasi.spp ? dbSimulasi.spp[nimVal] : null;

    if (dataMhs) {
      activeSppMahasiswa = { ...dataMhs, nim: nimVal };
      
      // Isi teks profil komponen atas
      document.getElementById('txt-spp-nama').innerText = dataMhs.nama;
      document.getElementById('txt-spp-prodi').innerText = dataMhs.prodi;
      document.getElementById('txt-spp-angkatan').innerText = dataMhs.angkatan;
      
      // Susun isi tabel berdasarkan data tagihan miliknya
      renderTabelSppChecklist();
      document.getElementById('spp-result-box').classList.remove('hidden');
    } else {
      document.getElementById('spp-placeholder').classList.remove('hidden');
      showToast("NIM Mahasiswa tidak ditemukan dalam sistem!", "error");
    }
  }, 800);
}

// 2. Fungsi Membuat Baris Tabel Berdasarkan Sisa Tagihan Semester
function renderTabelSppChecklist() {
  const tbody = document.getElementById('spp-table-body');
  tbody.innerHTML = ""; // Bersihkan tabel

  // Ambil list tagihan semester milik mahasiswa tersebut
  const listTagihan = activeSppMahasiswa.tagihan;

  if (listTagihan.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-emerald-600 font-bold bg-emerald-50">🎉 Semua semester sudah lunas! Tidak ada tagihan tersisa.</td></tr>`;
    hitungUlangTotalSpp();
    return;
  }

  listTagihan.forEach((item) => {
    const isChecked = selectedSemesterIds.includes(item.id);
    
    // Susun elemen HTML string baris tabel tr
    const row = document.createElement('tr');
    row.className = "hover:bg-gray-50/80 transition";
    row.innerHTML = `
      <td class="p-4 text-center">
        <input type="checkbox" value="${item.id}" ${isChecked ? 'checked' : ''} 
               onchange="togglePilihanSemester('${item.id}')" 
               class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer">
      </td>
      <td class="p-4">
        <span class="text-gray-900 font-semibold block">${item.semester}</span>
        <span class="text-xs text-gray-400 block font-normal">Biaya Kuliah Pokok + Fasilitas</span>
      </td>
      <td class="p-4 text-gray-500 text-xs">${item.tenggat}</td>
      <td class="p-4 text-right font-bold text-gray-900">Rp ${item.nominal.toLocaleString('id-ID')}</td>
    `;
    tbody.appendChild(row);
  });

  hitungUlangTotalSpp();
}

// 3. Fungsi Trigger Setiap Kali Kotak Checklist Dicentang / Dilepas
function togglePilihanSemester(idSemester) {
  const index = selectedSemesterIds.indexOf(idSemester);
  
  if (index > -1) {
    // Jika sudah ada di array, hapus (artinya user melepas centang)
    selectedSemesterIds.splice(index, 1);
  } else {
    // Jika belum ada, masukkan ke daftar pilihan
    selectedSemesterIds.push(idSemester);
  }

  hitungUlangTotalSpp();
}

// 4. Fungsi Kalkulator Total Harga Otomatis (Real-time)
function hitungUlangTotalSpp() {
  let akumulasiTotal = 0;
  const listTagihan = activeSppMahasiswa ? activeSppMahasiswa.tagihan : [];

  // Hitung jumlah rupiah dari id-id yang dicentang saja
  listTagihan.forEach(item => {
    if (selectedSemesterIds.includes(item.id)) {
      akumulasiTotal += item.nominal;
    }
  });

  // Tampilkan hasil penjumlahan ke UI layar
  document.getElementById('txt-spp-total').innerText = `Rp ${akumulasiTotal.toLocaleString('id-ID')}`;
  document.getElementById('txt-spp-count').innerText = `${selectedSemesterIds.length} komponen semester dipilih`;

  // Logika Tombol Bayar: Hanya menyala biru/hijau jika ada minimal 1 item yang dicentang
  const btnBayar = document.getElementById('btn-spp-bayar');
  if (selectedSemesterIds.length > 0) {
    btnBayar.disabled = false;
    btnBayar.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer text-base";
  } else {
    btnBayar.disabled = true;
    btnBayar.className = "bg-gray-400 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-not-allowed text-base";
  }
}

// 5. Fungsi Eksekusi Potong Saldo & Hapus Item yang Sukses Dibayar
function prosesBayarSpp() {
  if (!activeSppMahasiswa || selectedSemesterIds.length === 0) return;

  let totalBayarSpp = 0;
  let teksDaftarSemester = [];
  const listTagihan = activeSppMahasiswa.tagihan;

  listTagihan.forEach(item => {
    if (selectedSemesterIds.includes(item.id)) {
      totalBayarSpp += item.nominal;
      teksDaftarSemester.push(item.semester);
    }
  });

  // Validasi Batas Keamanan Saldo
  if (appState.saldo < totalBayarSpp) {
    showToast("Gagal! Saldo Anda kurang untuk membayar tagihan perguruan tinggi ini.", "error");
    return;
  }

  // Pengurangan Saldo Dompet Digital Utama
  appState.saldo -= totalBayarSpp;
  updateSaldoDisplay();

  // Bersihkan item yang dibayar dari database simulasi aktif biar tidak muncul lagi
  activeSppMahasiswa.tagihan = listTagihan.filter(item => !selectedSemesterIds.includes(item.id));
  
  // Update data master di dbSimulasi agar ketika di-search ulang datanya sinkron berkurang
  dbSimulasi.spp[activeSppMahasiswa.nim].tagihan = activeSppMahasiswa.tagihan;

  // Catat Dokumen Transaksi Riwayat Finansial Baru
  const riwayatSpp = {
    idTrx: 'SPP-' + Math.floor(200000 + Math.random() * 700000),
    waktu: new Date().toLocaleString('id-ID'),
    jenis: "SPP / UKT",
    nomor: activeSppMahasiswa.nim,
    nama: activeSppMahasiswa.nama + " (" + teksDaftarSemester.join(", ") + ")",
    jumlah: totalBayarSpp,
    metode: "Saldo Utama Simulasi",
    status: "Sukses"
  };

  appState.riwayat.unshift(riwayatSpp);
  localStorage.setItem('bk_riwayat', JSON.stringify(appState.riwayat));

  showToast(`Berhasil melunasi kuliah untuk ${teksDaftarSemester.length} Semester!`, "success");

  // Luncurkan Jendela Print Cetak Dokumen Struk Kuliah Resmi
  cetakStrukJendelaBaru(riwayatSpp);

  // Gambar ulang tabel dalam keadaan bersih/lunas sebagian
  selectedSemesterIds = [];
  renderTabelSppChecklist();
}
// --- DATABASE INSTANT PRODUK PULSA & DATA ---
const dbPulsa = {
  telkomsel: {
    pulsa: [
      { id: 't-p5', name: 'Pulsa Telkomsel 5.000', price: 6500 },
      { id: 't-p10', name: 'Pulsa Telkomsel 10.000', price: 11500 },
      { id: 't-p50', name: 'Pulsa Telkomsel 50.000', price: 51000 },
      { id: 't-p100', name: 'Pulsa Telkomsel 100.000', price: 99000 }
    ],
    data: [
      { id: 't-d1', name: 'Internet Max 5 GB / 30 Hari', price: 35000 },
      { id: 't-d2', name: 'Internet OMG 15 GB / 30 Hari', price: 75000 },
      { id: 't-d3', name: 'Ultra Boost 50 GB / 30 Hari', price: 150000 }
    ]
  },
  indosat: {
    pulsa: [
      { id: 'i-p5', name: 'Pulsa Indosat 5.000', price: 6200 },
      { id: 'i-p10', name: 'Pulsa Indosat 10.000', price: 11200 },
      { id: 'i-p50', name: 'Pulsa Indosat 50.000', price: 50500 },
      { id: 'i-p100', name: 'Pulsa Indosat 100.000', price: 98500 }
    ],
    data: [
      { id: 'i-d1', name: 'Freedom Internet 4 GB / 30 Hari', price: 28000 },
      { id: 'i-d2', name: 'Freedom Combo 16 GB / 30 Hari', price: 62000 },
      { id: 'i-d3', name: 'Freedom Unlimited 30 GB / 30 Hari', price: 110000 }
    ]
  },
  xl: {
    pulsa: [
      { id: 'x-p5', name: 'Pulsa XL Axiata 5.000', price: 6400 },
      { id: 'x-p10', name: 'Pulsa XL Axiata 10.000', price: 11400 },
      { id: 'x-p50', name: 'Pulsa XL Axiata 50.000', price: 50800 },
      { id: 'x-p100', name: 'Pulsa XL Axiata 100.000', price: 98800 }
    ],
    data: [
      { id: 'x-d1', name: 'Xtra Combo Mini 3.5 GB', price: 18000 },
      { id: 'x-d2', name: 'Xtra Flex 18 GB / 30 Hari', price: 55000 },
      { id: 'x-d3', name: 'Xtra Combo VIP 40 GB', price: 125000 }
    ]
  }
};

let currentPulsaService = 'pulsa'; // default service
let detectedOperatorName = ''; 
let selectedPulsaProduct = null;

// Mengatur tab Pulsa vs Paket Data
function setPulsaService(service) {
  currentPulsaService = service;
  
  const btnPulsa = document.getElementById('btn-srv-pulsa');
  const btnData = document.getElementById('btn-srv-data');
  
  if(service === 'pulsa') {
    btnPulsa.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg bg-white text-indigo-700 shadow-sm transition";
    btnData.className = "flex-1 text-center py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 transition";
  } else {
    btnData.className = "flex-1 text-center py-2 text-sm font-bold rounded-lg bg-white text-indigo-700 shadow-sm transition";
    btnPulsa.className = "flex-1 text-center py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 transition";
  }
  
  // Refresh item list jika nomor hp sudah valid terdeteksi
  if(detectedOperatorName) {
    renderPulsaItems();
  }
}

// Fitur Otomatis Membaca Operator Seluler Indonesia
function detectOperator() {
  const phone = document.getElementById('input-phone').value.trim();
  const badge = document.getElementById('operator-badge');
  const placeholder = document.getElementById('pulsa-placeholder');
  const gridBox = document.getElementById('pulsa-grid-box');
  const errBox = document.getElementById('error-pulsa');
  
  errBox.classList.add('hidden');
  selectedPulsaProduct = null;
  document.getElementById('pulsa-action-box').classList.add('hidden');

  // Minimal butuh 4 digit angka awal (Prefix)
  if (phone.length < 4) {
    badge.classList.add('hidden');
    placeholder.classList.remove('hidden');
    gridBox.classList.add('hidden');
    detectedOperatorName = '';
    return;
  }

  const prefix = phone.substring(0, 4);
  
  // Peta prefix provider indonesia
  if (['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'].includes(prefix)) {
    detectedOperatorName = 'telkomsel';
  } else if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) {
    detectedOperatorName = 'indosat';
  } else if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(prefix)) {
    detectedOperatorName = 'xl';
  } else {
    detectedOperatorName = '';
  }

  if (detectedOperatorName) {
    badge.innerText = detectedOperatorName.toUpperCase();
    badge.classList.remove('hidden');
    placeholder.classList.add('hidden');
    gridBox.classList.remove('hidden');
    document.getElementById('txt-operator-name').innerText = detectedOperatorName;
    renderPulsaItems();
  } else {
    badge.classList.add('hidden');
    placeholder.classList.remove('hidden');
    gridBox.classList.add('hidden');
  }
}

// Merender daftar harga ke kolom kanan berdasarkan operator yang dibaca
function renderPulsaItems() {
  const container = document.getElementById('pulsa-items-render');
  container.innerHTML = '';
  
  const items = dbPulsa[detectedOperatorName][currentPulsaService];
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.id = `item-pulsa-${item.id}`;
    card.className = "border border-gray-200 p-4 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition flex justify-between items-center";
    card.onclick = () => selectPulsaProduct(item);
    
    card.innerHTML = `
      <div class="pr-2">
        <p class="font-bold text-gray-800 text-sm">${item.name}</p>
        <span class="text-[11px] text-gray-400 block mt-0.5">Sistem Pengisian Instan</span>
      </div>
      <div class="text-right whitespace-nowrap">
        <span class="font-black text-sm text-indigo-600">Rp ${item.price.toLocaleString('id-ID')}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Aksi memilih nominal paket
function selectPulsaProduct(item) {
  selectedPulsaProduct = item;
  
  // Hapus semua efek select aktif sebelumnya
  document.querySelectorAll('[id^="item-pulsa-"]').forEach(el => {
    el.classList.remove('border-indigo-600', 'bg-indigo-50');
  });
  
  // Tambahkan style aktif pada item terpilih
  const activeCard = document.getElementById(`item-pulsa-${item.id}`);
  if(activeCard) {
    activeCard.classList.add('border-indigo-600', 'bg-indigo-50');
  }
  
  document.getElementById('txt-pulsa-selected').innerText = item.name;
  document.getElementById('txt-pulsa-price').innerText = `Rp ${item.price.toLocaleString('id-ID')}`;
  document.getElementById('pulsa-action-box').classList.remove('hidden');
}

// Logika pemotongan saldo pasca tombol "Bayar Sekarang" ditekan
function prosesBayarPulsa() {
  const phone = document.getElementById('input-phone').value.trim();
  const errBox = document.getElementById('error-pulsa');
  
  if(phone.length < 10 || phone.length > 13) {
    errBox.innerText = "Nomor Handphone tidak valid (Wajib antara 10 - 13 digit)!";
    errBox.classList.remove('hidden');
    return;
  }
  
  if(!selectedPulsaProduct) return;

  // Parsing nominal murni saldo saat ini dari DOM element navbar
  const saldoElement = document.getElementById('saldo-display');
  let currentSaldo = parseInt(saldoElement.innerText.replace(/[^0-9]/g, ''));

  if(currentSaldo >= selectedPulsaProduct.price) {
    currentSaldo -= selectedPulsaProduct.price;
    saldoElement.innerText = `Rp${currentSaldo.toLocaleString('id-ID')}`;
    
    // Memanggil toast notifikasi sukses (Asumsi fungsi toast() bawaan file lama Anda siap pakai)
    if(typeof showToast === 'function') {
      showToast("✅ Transaksi Berhasil! Pulsa/Paket data sedang dikirim ke nomor " + phone, "success");
    } else {
      alert("✅ Transaksi Berhasil! Pulsa/Paket data sedang dikirim ke nomor " + phone);
    }
    
    // Reset form view pulsa kembali ke awal setelah sukses
    document.getElementById('input-phone').value = '';
    detectOperator();
  } else {
    if(typeof showToast === 'function') {
      showToast("❌ Saldo Dompet Anda Tidak Mencukupi untuk transaksi ini!", "danger");
    } else {
      alert("❌ Saldo Dompet Anda Tidak Mencukupi!");
    }
  }
}
// FUNGSI UNTUK MAPPING/LOOPING RIWAYAT KE DALAM TABEL HTML
function renderRiwayatKeTabel() {
  const tbody = document.getElementById('riwayat-table-body');
  if (!tbody) return; // Mencegah error jika elemen tabel tidak ada di halaman aktif

  tbody.innerHTML = ""; // Bersihkan tabel terlebih dahulu dari data lama

  // Kondisi jika riwayat masih kosong
  if (appState.riwayat.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-400 text-sm font-medium">
          <i class="fa-solid fa-clock-rotate-left block text-xl mb-2 text-gray-300"></i>
          Belum ada riwayat transaksi.
        </td>
      </tr>
    `;
    return;
  }

  // PROSES LOOPING / MAPPING DATA ARRAY RIWAYAT
  appState.riwayat.forEach((trx) => {
    // Tentukan warna badge berdasarkan jenis layanan
    let badgeColor = 'bg-gray-100 text-gray-700';
    if (trx.jenis === 'PLN' || trx.jenis === 'PDAM' || trx.jenis === 'INTERNET') badgeColor = 'bg-indigo-50 text-indigo-700 font-semibold';
    if (trx.jenis === 'SPP / UKT') badgeColor = 'bg-emerald-50 text-emerald-700 font-semibold';
    if (trx.jenis === 'PULSA' || trx.jenis === 'DATA') badgeColor = 'bg-blue-50 text-blue-700 font-semibold';

    // Buat elemen baris tabel (tr) baru
    const row = document.createElement('tr');
    row.className = "border-b border-gray-50 hover:bg-gray-50/50 transition text-sm text-gray-600";
    
    // Gunakan Template Literals untuk memasukkan data transaksi
    row.innerHTML = `
      <td class="p-4 font-bold text-gray-900">${trx.idTrx}</td>
      <td class="p-4 text-xs text-gray-400">${trx.waktu}</td>
      <td class="p-4">
        <span class="text-[11px] px-2.5 py-1 rounded-md ${badgeColor}">${trx.jenis}</span>
      </td>
      <td class="p-4">
        <span class="font-medium text-gray-800 block">${trx.nama}</span>
        <span class="text-xs text-gray-400 block">${trx.nomor}</span>
      </td>
      <td class="p-4 font-bold text-gray-900">Rp ${trx.jumlah.toLocaleString('id-ID')}</td>
      <td class="p-4">
        <span class="text-emerald-600 font-bold flex items-center space-x-1">
          <i class="fa-solid fa-circle-check text-xs"></i> <span>${trx.status}</span>
        </span>
      </td>
    `;
    
    // Masukkan baris tersebut ke dalam tbody
    tbody.appendChild(row);
  });
}

// FUNGSI UNTUK MENCETAK RIWAYAT KE TABEL HTML
function renderRiwayatKeTabel() {
  // 1. Ambil elemen tbody yang sudah kita beri ID di Langkah 1
  const tbody = document.getElementById('riwayat-table-body');
  if (!tbody) return; // Jika elemen tidak ditemukan di halaman ini, batalkan agar tidak error

  // 2. Kosongkan isi tabel terlebih dahulu agar data tidak menumpuk dobel
  tbody.innerHTML = ""; 

  // ... bagian kode simpan riwayat ...
appState.riwayat.unshift(transaksiBaru);
localStorage.setItem('bk_riwayat', JSON.stringify(appState.riwayat));

renderRiwayatKeTabel(); // <-- Tambahkan ini di akhir fungsi
showToast("Pembayaran Tagihan Berhasil diproses!", "success");

// ... bagian kode simpan riwayat ...
appState.riwayat.unshift(riwayatSpp);
localStorage.setItem('bk_riwayat', JSON.stringify(appState.riwayat));

renderRiwayatKeTabel(); // <-- Tambahkan ini di akhir fungsi
showToast(`Berhasil melunasi kuliah...`, "success");

// ... bagian kode simpan riwayat ...
appState.riwayat.unshift(transaksiPulsa);
localStorage.setItem('bk_riwayat', JSON.stringify(appState.riwayat));

renderRiwayatKeTabel(); // <-- Tambahkan ini di akhir fungsi
showToast(`✅ Transaksi Berhasil!...`, "success");

  // 3. JIKA RIWAYAT MASIH KOSONG: Tampilkan pesan khusus
  if (appState.riwayat.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-400 text-sm font-medium">
          Belum ada riwayat transaksi.
        </td>
      </tr>
    `;
    return; // Berhenti di sini karena tidak ada data yang perlu dilooping
  }

  // 4. JIKA ADA DATA: Lakukan looping/mapping menggunakan forEach
  appState.riwayat.forEach((trx) => {
    
    // Atur warna badge/label berdasarkan jenis layanannya supaya rapi
    let badgeColor = 'bg-gray-100 text-gray-700';
    if (trx.jenis === 'PLN' || trx.jenis === 'PDAM' || trx.jenis === 'INTERNET') badgeColor = 'bg-indigo-50 text-indigo-700 font-semibold';
    if (trx.jenis === 'SPP / UKT') badgeColor = 'bg-emerald-50 text-emerald-700 font-semibold';
    if (trx.jenis === 'PULSA' || trx.jenis === 'DATA') badgeColor = 'bg-blue-50 text-blue-700 font-semibold';

    // Buat elemen baris tabel (<tr>) baru di memori browser
    const row = document.createElement('tr');
    row.className = "border-b border-gray-50 hover:bg-gray-50/50 transition text-sm text-gray-600";
    
    // Isi baris tersebut dengan data transaksi (idTrx, waktu, nama, jumlah, dll)
    row.innerHTML = `
      <td class="p-4 font-bold text-gray-900">${trx.idTrx}</td>
      <td class="p-4 text-xs text-gray-400">${trx.waktu}</td>
      <td class="p-4">
        <span class="text-[11px] px-2.5 py-1 rounded-md ${badgeColor}">${trx.jenis}</span>
      </td>
      <td class="p-4">
        <span class="font-medium text-gray-800 block">${trx.nama}</span>
        <span class="text-xs text-gray-400 block">${trx.nomor}</span>
      </td>
      <td class="p-4 font-bold text-gray-900">Rp ${trx.jumlah.toLocaleString('id-ID')}</td>
      <td class="p-4">
        <span class="text-emerald-600 font-bold">
          ${trx.status}
        </span>
      </td>
    `;
    
    // Masukkan baris yang sudah jadi ke dalam tbody HTML
    tbody.appendChild(row);
  });
}
let currentView = "dashboard";
let viewHistory = [];

function switchView(view) {

    if (view !== currentView) {
        viewHistory.push(currentView);
        currentView = view;
    }

    document.querySelectorAll(".view-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("view-" + view).classList.remove("hidden");
}

function goBack() {

    if (viewHistory.length === 0) return;

    const previousView = viewHistory.pop();
    currentView = previousView;

    document.querySelectorAll(".view-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("view-" + previousView).classList.remove("hidden");
}