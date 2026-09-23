// =============================================================================
// BIMO MANUFACTURING LABS - GOOGLE SHEETS & GRADEBOOK SERVICE
// Mengintegrasikan pencatatan nilai siswa ke Google Spreadsheet & Local Storage
// =============================================================================

const STORAGE_KEY_SCORES = 'bimo_quiz_scores';
const STORAGE_KEY_WEBHOOK = 'bimo_sheets_webhook_url';
const STORAGE_KEY_SHEET_DOC = 'bimo_sheets_doc_url';

// Default / fallback Webhook URL (Bisa diganti oleh guru melalui Panel Monitoring Nilai)
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyK77i-GvCECETlbF2xJfOFSpAed6unfBlwNTDOeH7wBhJuPfpb8pJHkF1ExrYOzQe2lA/exec';

// Tautan Langsung Dokumen Google Spreadsheet Nilai Siswa (SMKN 2 Depok)
export const DEFAULT_SPREADSHEET_DOC_URL = 'https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706';

/**
 * Data Nilai Siswa Awal (Kosong, murni menampung data riil siswa)
 */
export const SAMPLE_STUDENT_SCORES = [];

/**
 * Mengambil URL Google Spreadsheet Dokumen yang tersimpan atau default
 */
export const getSpreadsheetDocUrl = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHEET_DOC);
    return saved && saved.trim().startsWith('http') ? saved.trim() : DEFAULT_SPREADSHEET_DOC_URL;
  } catch {
    return DEFAULT_SPREADSHEET_DOC_URL;
  }
};

/**
 * Menyimpan URL Google Spreadsheet Dokumen baru
 */
export const setSpreadsheetDocUrl = (url) => {
  try {
    if (url && typeof url === 'string' && url.trim().startsWith('http')) {
      localStorage.setItem(STORAGE_KEY_SHEET_DOC, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_SHEET_DOC);
    }
    return true;
  } catch (err) {
    console.error('Gagal menyimpan URL Dokumen Spreadsheet:', err);
    return false;
  }
};

/**
 * Mengambil URL Webhook Google Apps Script yang tersimpan
 */
export const getSpreadsheetWebhookUrl = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEBHOOK);
    return saved ? saved.trim() : DEFAULT_WEBHOOK_URL;
  } catch {
    return DEFAULT_WEBHOOK_URL;
  }
};

/**
 * Menyimpan URL Webhook Google Apps Script baru
 */
export const setSpreadsheetWebhookUrl = (url) => {
  try {
    if (url && typeof url === 'string') {
      localStorage.setItem(STORAGE_KEY_WEBHOOK, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_WEBHOOK);
    }
    return true;
  } catch (err) {
    console.error('Gagal menyimpan URL Webhook:', err);
    return false;
  }
};

/**
 * Mengambil semua data nilai yang tersimpan di Local Storage.
 * Murni mengembalikan data riil siswa dan otomatis membersihkan data contoh dummy jika pernah tersimpan.
 */
export const getAllStoredScores = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    const sampleNames = [
      'ahmad fauzi',
      'budi santoso',
      'siti rahmawati',
      'rizky pratama',
      'dewi lestari',
      'fajar nugroho',
      'siswa praktikan',
      'siti aisyah',
      'raka maulana',
      'dika pratama'
    ];
    
    // Otomatis memfilter dan membersihkan data sample_* atau nama dummy jika ada tersisa di storage browser
    const cleaned = parsed.filter(item => {
      if (!item) return false;
      const id = String(item.id || '').toLowerCase();
      const nama = String(item.namaSiswa || '').trim().toLowerCase();
      if (id.startsWith('sample_')) return false;
      if (sampleNames.includes(nama)) return false;
      return true;
    });

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Gagal membaca data nilai dari localStorage:', err);
    return [];
  }
};

/**
 * Mengambil data nilai siswa aktif
 */
export const seedSampleScores = () => {
  return getAllStoredScores();
};

/**
 * Menyimpan satu record nilai ke Local Storage
 */
export const saveScoreLocally = (record) => {
  try {
    const current = getAllStoredScores();
    const updated = [record, ...current];
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal menyimpan nilai secara lokal:', err);
    return [];
  }
};

/**
 * Memperbarui status sinkronisasi suatu record berdasarkan ID
 */
export const updateRecordSyncStatus = (recordId, isSynced) => {
  try {
    const current = getAllStoredScores();
    const updated = current.map(item => {
      if (item.id === recordId) {
        return { ...item, synced: isSynced };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal memperbarui status sinkronisasi:', err);
    return [];
  }
};

/**
 * Menghapus seluruh data nilai lokal (Fitur Admin Guru)
 */
export const clearAllStoredScores = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_SCORES);
    return true;
  } catch {
    return false;
  }
};

/**
 * Mengirim payload nilai ke Google Apps Script Web App
 */
export const sendToGoogleSheet = async (payload) => {
  const webhookUrl = getSpreadsheetWebhookUrl();
  if (!webhookUrl) {
    return { success: false, reason: 'URL Spreadsheet belum dikonfigurasi oleh guru' };
  }

  try {
    // Mode 'no-cors' digunakan untuk menghindari kendala CORS redirect Google Apps Script
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (error) {
    console.warn('Gagal mengirim ke Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mendeteksi ID Lab dan Sub-Kuis yang spesifik sesuai struktur Sidebar
 */
export const detectLabAndSubQuiz = (item) => {
  const m = String(item?.modul || '').toLowerCase();
  const j = String(item?.judulKuis || '').toLowerCase();

  // 1. Identifikasi Lab Utama (sesuai ID Sidebar)
  let labId = 'machine';
  let labLabel = 'Machine Lab';
  let labIcon = '⚙️';

  if (m.includes('safety') || m.includes('k3') || m.includes('5r') || m.includes('apar') || j.includes('apd') || j.includes('k3') || j.includes('5r') || j.includes('apar') || j.includes('jsa')) {
    labId = 'safety';
    labLabel = 'Safety Lab';
    labIcon = '🛡️';
  } else if (m.includes('cutting') || m.includes('potong') || j.includes('potong') || j.includes('pahat')) {
    labId = 'cutting-tools';
    labLabel = 'Alat Pemotong';
    labIcon = '🔪';
  } else if (m.includes('heat') || m.includes('perlakuan panas') || m.includes('metalurgi') || j.includes('hardening') || j.includes('quenching') || j.includes('annealing')) {
    labId = 'heat-treatment';
    labLabel = 'Heat Treatment';
    labIcon = '🌡️';
  } else if (m.includes('mekanika') || m.includes('mechanic') || j.includes('torsi') || j.includes('tuas') || j.includes('momen gaya')) {
    labId = 'mechanics';
    labLabel = 'Mekanika Teknik';
    labIcon = '🔧';
  } else if (m.includes('weld') || m.includes('las') || j.includes('smaw') || j.includes('pengelasan')) {
    labId = 'welding';
    labLabel = 'Welding Lab';
    labIcon = '⚡';
  } else if (m.includes('ukur') || m.includes('measur') || m.includes('metrologi') || j.includes('jangka sorong') || j.includes('mikrometer') || j.includes('kaliper')) {
    labId = 'measuring';
    labLabel = 'Alat Ukur Presisi';
    labIcon = '📏';
  } else if (m.includes('design') || m.includes('gambar') || m.includes('cad') || j.includes('proyeksi') || j.includes('cad')) {
    labId = 'design';
    labLabel = 'Design Lab';
    labIcon = '📐';
  } else if (m.includes('bengkel') || m.includes('virtual') || j.includes('bengkel 3d')) {
    labId = 'virtual-bengkel';
    labLabel = 'Virtual Bengkel 3D';
    labIcon = '🏭';
  } else if (m.includes('evaluasi') || j.includes('evaluasi komprehensif')) {
    labId = 'evaluasi';
    labLabel = 'Evaluasi';
    labIcon = '📝';
  } else {
    labId = 'machine';
    labLabel = 'Machine Lab';
    labIcon = '⚙️';
  }

  // 2. Identifikasi Sub-Kuis / Sub-Aktivitas Spesifik
  let subId = 'other';
  let subLabel = 'Kuis / Praktik';

  if (j.includes('diagnostik')) {
    subId = 'diagnostic';
    subLabel = 'Tes Diagnostik (10 Soal)';
  } else if (labId === 'safety') {
    if (j.includes('inspeksi apd') || j.includes('apd') || m.includes('apd')) {
      subId = 'apd';
      subLabel = 'Kuis Inspeksi APD';
    } else if (j.includes('apar') || j.includes('pass') || j.includes('kebakaran')) {
      subId = 'apar';
      subLabel = 'Simulasi APAR & Tanggap Darurat';
    } else if (j.includes('5r') || j.includes('budaya')) {
      subId = '5r';
      subLabel = 'Budaya Kerja 5R & Etika DUDI';
    } else if (j.includes('perkakas') || j.includes('ragum') || j.includes('bor')) {
      subId = 'perkakas';
      subLabel = 'SOP Perkakas Tangan & Ragum';
    } else if (j.includes('jsa') || j.includes('job safety')) {
      subId = 'jsa';
      subLabel = 'Penyusunan JSA (Job Safety Analysis)';
    } else if (j.includes('qc') || j.includes('benda uji')) {
      subId = 'qc';
      subLabel = 'Audit Mutu Benda Kerja DUDI';
    } else {
      subId = 'safety_general';
      subLabel = 'Kuis Praktik K3';
    }
  } else if (labId === 'machine') {
    if (j.includes('pre-test') || j.includes('pretest')) {
      subId = 'pretest';
      subLabel = 'Pre-Test Teori Permesinan';
    } else if (j.includes('cnc') || m.includes('cnc')) {
      subId = 'cnc';
      subLabel = 'Kuis Teori & Kode CNC';
    } else if (j.includes('bubut') || m.includes('bubut')) {
      subId = 'lathe';
      subLabel = 'Praktik Mesin Bubut';
    } else {
      subId = 'machine_general';
      subLabel = 'Praktik Permesinan';
    }
  } else if (labId === 'cutting-tools') {
    subId = 'cutting_quiz';
    subLabel = 'Kuis Alat Potong & RPM';
  } else if (labId === 'heat-treatment') {
    subId = 'metallurgy';
    subLabel = 'Kuis Evaluasi Metalurgi';
  } else if (labId === 'mechanics') {
    subId = 'torque';
    subLabel = 'Kuis Momen Gaya & Torsi';
  } else if (labId === 'welding') {
    subId = 'smaw';
    subLabel = 'Kuis Asesmen Las SMAW';
  } else if (labId === 'measuring') {
    subId = 'caliper_micrometer';
    subLabel = 'Uji Pembacaan Kaliper & Mikrometer';
  } else if (labId === 'design') {
    subId = 'cad_drawing';
    subLabel = 'Kuis Gambar Teknik & CAD';
  } else if (labId === 'evaluasi') {
    subId = 'evaluasi_final';
    subLabel = 'Evaluasi Akhir Komprehensif';
  }

  return {
    labId,
    labLabel,
    labIcon,
    subId,
    subLabel
  };
};

/**
 * FUNGSI UTAMA: Merekam hasil evaluasi siswa
 * Secara otomatis menyimpan ke Local Storage DAN mengirim ke Google Spreadsheet
 */
export const recordQuizResult = async ({
  student = null,
  modul = 'Modul Permesinan',
  subModul = '',
  jenisKuis = '',
  judulKuis = 'Kuis Evaluasi',
  skor = 0,
  jawabanBenar = 0,
  totalSoal = 0,
  detailJawaban = null
}) => {
  // Ambil data siswa dari parameter atau dari session localStorage
  let activeStudent = student;
  if (!activeStudent || !activeStudent.name) {
    try {
      const savedStudent = localStorage.getItem('bimo_student_session');
      if (savedStudent) {
        activeStudent = JSON.parse(savedStudent);
      }
    } catch {}
  }

  const namaSiswa = activeStudent?.name || 'Siswa Praktikan';
  const nomorAbsen = activeStudent?.studentNumber || '-';
  const kelas = activeStudent?.className || 'X TPM';
  const sekolah = activeStudent?.school || 'SMK / Poltek';

  const now = new Date();
  const timeFormatted = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  const numericScore = Math.round(Number(skor) || 0);
  const status = numericScore >= 75 ? 'LULUS' : 'REMEDIAL';

  const detected = detectLabAndSubQuiz({ modul, judulKuis });
  const finalSubModul = subModul || detected.subLabel;
  const finalJenisKuis = jenisKuis || detected.subLabel;

  const record = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    waktu: timeFormatted,
    namaSiswa,
    nomorAbsen,
    kelas,
    sekolah,
    modul: detected.labLabel,
    subModul: finalSubModul,
    jenisKuis: finalJenisKuis,
    judulKuis,
    skor: numericScore,
    jawabanBenar: Number(jawabanBenar) || 0,
    totalSoal: Number(totalSoal) || 0,
    status,
    detailJawaban: typeof detailJawaban === 'object' ? JSON.stringify(detailJawaban) : (detailJawaban || '-'),
    synced: false
  };

  // 1. Simpan ke local storage
  saveScoreLocally(record);

  // 2. Kirim ke Google Spreadsheet di background
  let sheetResult = { success: false };
  const webhookUrl = getSpreadsheetWebhookUrl();
  if (webhookUrl) {
    sheetResult = await sendToGoogleSheet(record);
    if (sheetResult.success) {
      updateRecordSyncStatus(record.id, true);
    }
  }

  // 3. Dispatch event agar UI / notifikasi toast bisa merespons
  try {
    window.dispatchEvent(new CustomEvent('bimo:quiz_submitted', {
      detail: { record, sheetResult }
    }));
  } catch {}

  return { record, sheetResult };
};

/**
 * Mencoba sinkronisasi ulang semua nilai yang belum terkirim ke Google Sheets
 */
export const syncPendingScores = async () => {
  const allScores = getAllStoredScores();
  const pending = allScores.filter(s => !s.synced);
  if (pending.length === 0) return { total: 0, synced: 0 };

  let successCount = 0;
  for (const record of pending) {
    const res = await sendToGoogleSheet(record);
    if (res.success) {
      updateRecordSyncStatus(record.id, true);
      successCount++;
    }
  }

  return { total: pending.length, synced: successCount };
};

/**
 * Mengunduh seluruh rekap nilai sebagai file CSV (Excel compatible)
 */
export const exportScoresToCSV = (scores = null) => {
  const rawData = scores || getAllStoredScores();
  if (!rawData || rawData.length === 0) {
    alert('Belum ada data nilai yang tercatat untuk diekspor.');
    return;
  }

  // Urutkan data berdasarkan Nama Kuis / Asesmen terlebih dahulu, lalu nama siswa
  const data = [...rawData].sort((a, b) => {
    const qComp = (a.judulKuis || '').localeCompare(b.judulKuis || '');
    if (qComp !== 0) return qComp;
    return (a.namaSiswa || '').localeCompare(b.namaSiswa || '');
  });

  const headers = [
    'Nama Kuis / Asesmen',
    'Waktu / Tanggal',
    'Nama Siswa',
    'No. Absen',
    'Kelas',
    'Sekolah / Instansi',
    'Modul Lab (Sidebar)',
    'Sub-Kuis / Kategori',
    'Nilai (0-100)',
    'Jawaban Benar',
    'Total Soal',
    'Status KKM',
    'Tersinkron Spreadsheet',
    'Rincian Jawaban'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map(item => {
    const det = detectLabAndSubQuiz(item);
    return [
      escapeCSV(item.judulKuis),
      escapeCSV(item.waktu),
      escapeCSV(item.namaSiswa),
      escapeCSV(item.nomorAbsen),
      escapeCSV(item.kelas),
      escapeCSV(item.sekolah),
      escapeCSV(item.modul || det.labLabel),
      escapeCSV(item.subModul || item.jenisKuis || det.subLabel),
      escapeCSV(item.skor),
      escapeCSV(item.jawabanBenar),
      escapeCSV(item.totalSoal),
      escapeCSV(item.status),
      escapeCSV(item.synced ? 'SUDAH' : 'BELUM'),
      escapeCSV(item.detailJawaban)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rekap_Nilai_PerKuis_BIMO_Lab_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Menyalin data tabel ke Clipboard dalam format TSV (Tab Separated Values)
 * Dikelompokkan rapi per Nama Kuis / Asesmen
 */
export const copyScoresToClipboard = async (scores = null) => {
  const rawData = scores || getAllStoredScores();
  if (!rawData || rawData.length === 0) {
    return { success: false, message: 'Tidak ada data nilai untuk disalin.' };
  }

  const data = [...rawData].sort((a, b) => {
    const qComp = (a.judulKuis || '').localeCompare(b.judulKuis || '');
    if (qComp !== 0) return qComp;
    return (a.namaSiswa || '').localeCompare(b.namaSiswa || '');
  });

  const headers = [
    'Nama Kuis / Asesmen',
    'Waktu / Tanggal',
    'Nama Siswa',
    'No. Absen',
    'Kelas',
    'Sekolah',
    'Modul Lab',
    'Sub-Kuis / Kategori',
    'Nilai (0-100)',
    'Jawaban Benar',
    'Total Soal',
    'Status KKM',
    'Rincian Jawaban'
  ];

  const rows = data.map(item => {
    const det = detectLabAndSubQuiz(item);
    return [
      item.judulKuis || '',
      item.waktu || '',
      item.namaSiswa || '',
      item.nomorAbsen || '',
      item.kelas || '',
      item.sekolah || '',
      item.modul || det.labLabel,
      item.subModul || item.jenisKuis || det.subLabel,
      item.skor ?? '',
      item.jawabanBenar ?? '',
      item.totalSoal ?? '',
      item.status || '',
      (item.detailJawaban || '').replace(/\r?\n|\r/g, ' ')
    ].join('\t');
  });

  const tsvText = [headers.join('\t'), ...rows].join('\n');

  try {
    await navigator.clipboard.writeText(tsvText);
    return { success: true, message: 'Tabel berhasil disalin (dikelompokkan per kuis)!' };
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return { success: false, message: 'Gagal menyalin otomatis. Silakan gunakan tombol unduh CSV.' };
  }
};

/**
 * Mengunduh file spreadsheet dengan ekstensi .xls terformat rapi
 * Dikelompokkan dan diklasifikasikan secara tegas menurut Nama Kuis / Asesmen
 */
export const exportScoresToExcelHTML = (scores = null) => {
  const data = scores || getAllStoredScores();
  if (!data || data.length === 0) {
    alert('Belum ada data nilai yang tercatat untuk diekspor.');
    return;
  }

  // 1. Kelompokkan data menurut Nama Kuis / Asesmen
  const quizGroups = {};
  data.forEach(item => {
    const quizName = item.judulKuis || 'Kuis Asesmen Terintegrasi';
    if (!quizGroups[quizName]) {
      quizGroups[quizName] = [];
    }
    quizGroups[quizName].push(item);
  });

  const sortedQuizNames = Object.keys(quizGroups).sort();

  // 2. Bangun tabel per kelompok kuis lengkap dengan Header Kuis & Subtotal Nilai
  const sectionsHtml = sortedQuizNames.map((quizName) => {
    const items = [...quizGroups[quizName]].sort((a, b) => (a.namaSiswa || '').localeCompare(b.namaSiswa || ''));
    const avgScore = Math.round(items.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / items.length);
    const passedCount = items.filter(i => i.status === 'LULUS' || Number(i.skor) >= 75).length;
    const passPct = Math.round((passedCount / items.length) * 100);

    const rowsHtml = items.map((item, idx) => {
      const det = detectLabAndSubQuiz(item);
      const isPassed = item.status === 'LULUS' || Number(item.skor) >= 75;
      return `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; white-space: nowrap;">${item.waktu || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10.5pt; font-weight: bold; color: #0f172a;">${item.namaSiswa || ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; text-align: center;">${item.nomorAbsen || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; text-align: center;">${item.kelas || 'X TPM 1'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; color: #047857; font-weight: 600;">${item.modul || det.labLabel}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; font-weight: 700; color: #1e293b;">${quizName}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 11pt; text-align: center; font-weight: bold; color: ${isPassed ? '#16a34a' : '#dc2626'};">${item.skor ?? ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; text-align: center;">${item.jawabanBenar ?? ''} / ${item.totalSoal ?? ''}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; text-align: center; font-weight: bold; background-color: ${isPassed ? '#dcfce7' : '#fee2e2'}; color: ${isPassed ? '#166534' : '#991b1b'};">${isPassed ? 'LULUS' : 'REMEDIAL'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 9.5pt; color: #475569;">${(item.detailJawaban || '').replace(/"/g, '&quot;')}</td>
        </tr>
      `;
    }).join('');

    return `
      <!-- BANNER KLASIFIKASI KUIS -->
      <tr style="background-color: #064e3b; color: #ffffff;">
        <td colspan="11" style="padding: 10px 14px; font-size: 11pt; border: 2px solid #047857;">
          <strong>📋 NAMA KUIS / ASESMEN:</strong> <span style="color: #6ee7b7; font-size: 11.5pt; font-weight: 800;">${quizName}</span>
          <span style="font-weight: normal; margin-left: 20px; font-size: 10pt; color: #e2e8f0;">
            | Total Siswa: <strong>${items.length}</strong> | Rata-rata Skor: <strong>${avgScore}/100</strong> | Kelulusan: <strong>${passPct}% (${passedCount}/${items.length})</strong>
          </span>
        </td>
      </tr>
      ${rowsHtml}
      <!-- SUBTOTAL SUMMARY KUIS -->
      <tr style="background-color: #ecfdf5; font-weight: bold; border-bottom: 2px solid #10b981;">
        <td colspan="7" style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; color: #065f46; font-size: 10pt;">
          Subtotal Rata-rata [${quizName}]:
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 11pt; color: #065f46;">
          ${avgScore}
        </td>
        <td colspan="3" style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10pt; color: #065f46;">
          Tingkat Kelulusan: ${passPct}% (${passedCount} dari ${items.length} siswa)
        </td>
      </tr>
      <tr><td colspan="11" style="height: 14px; background-color: #f1f5f9; border: none;"></td></tr>
    `;
  }).join('');

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Rekap Nilai Siswa</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #064e3b; margin-bottom: 4px;">LEMBAR REKAPITULASI NILAI SISWA (DIKLASIFIKASIKAN PER KUIS)</h2>
      <p style="font-size: 10pt; color: #475569; margin-top: 0;">
        Instansi: SMKN 2 Depok | Guru Pengampu: Bimoro Kusumo, S.Pd. | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')} | Total Kuis: ${sortedQuizNames.length} Kuis
      </p>
      <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: center;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 40px;">No</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[A] Waktu</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[B] Nama Siswa</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[C] Absen</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[D] Kelas</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[E] Modul Lab</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[F] Nama Kuis / Asesmen</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[G] Nilai (0-100)</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[H] Benar / Total</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[I] Status KKM</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[J] Rincian Jawaban</th>
          </tr>
        </thead>
        <tbody>
          ${sectionsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rekap_Nilai_PerKuis_BIMO_Lab_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
