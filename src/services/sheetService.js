// =============================================================================
// BIMO MANUFACTURING LABS - GOOGLE SHEETS & GRADEBOOK SERVICE
// Mengintegrasikan pencatatan nilai siswa ke Google Spreadsheet & Local Storage
// =============================================================================

const STORAGE_KEY_SCORES = 'bimo_quiz_scores';
const STORAGE_KEY_WEBHOOK = 'bimo_sheets_webhook_url';

// Default / fallback Webhook URL (Bisa diganti oleh guru melalui Panel Monitoring Nilai)
const DEFAULT_WEBHOOK_URL = '';

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
 * Mengambil semua data nilai yang tersimpan di Local Storage
 */
export const getAllStoredScores = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCORES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Gagal membaca data nilai dari localStorage:', err);
    return [];
  }
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
        'Content-Type': 'application/json'
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
 * FUNGSI UTAMA: Merekam hasil evaluasi siswa
 * Secara otomatis menyimpan ke Local Storage DAN mengirim ke Google Spreadsheet
 */
export const recordQuizResult = async ({
  student = null,
  modul = 'Modul Permesinan',
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

  const record = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    waktu: timeFormatted,
    namaSiswa,
    nomorAbsen,
    kelas,
    sekolah,
    modul,
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
  const data = scores || getAllStoredScores();
  if (!data || data.length === 0) {
    alert('Belum ada data nilai yang tercatat untuk diekspor.');
    return;
  }

  const headers = [
    'Waktu / Tanggal',
    'Nama Siswa',
    'No. Absen',
    'Kelas',
    'Sekolah / Instansi',
    'Modul Lab',
    'Nama Kuis',
    'Nilai (0-100)',
    'Jawaban Benar',
    'Total Soal',
    'Status',
    'Tersinkron Spreadsheet',
    'Rincian Jawaban'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map(item => [
    escapeCSV(item.waktu),
    escapeCSV(item.namaSiswa),
    escapeCSV(item.nomorAbsen),
    escapeCSV(item.kelas),
    escapeCSV(item.sekolah),
    escapeCSV(item.modul),
    escapeCSV(item.judulKuis),
    escapeCSV(item.skor),
    escapeCSV(item.jawabanBenar),
    escapeCSV(item.totalSoal),
    escapeCSV(item.status),
    escapeCSV(item.synced ? 'SUDAH' : 'BELUM'),
    escapeCSV(item.detailJawaban)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rekap_Nilai_Siswa_BIMO_Lab_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
