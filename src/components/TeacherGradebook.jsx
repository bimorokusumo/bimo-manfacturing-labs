import React, { useState, useEffect } from 'react';
import {
  getAllStoredScores,
  getSpreadsheetWebhookUrl,
  setSpreadsheetWebhookUrl,
  exportScoresToCSV,
  clearAllStoredScores,
  syncPendingScores,
  sendToGoogleSheet,
  copyScoresToClipboard,
  exportScoresToExcelHTML
} from '../services/sheetService';
import { sound } from '../utils/audio';

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      var headers = [
        "Waktu & Tanggal",
        "Nama Lengkap Siswa",
        "No. Absen",
        "Kelas / Jurusan",
        "Sekolah / Instansi",
        "Modul Laboratorium",
        "Nama Kuis / Asesmen",
        "Nilai (0 - 100)",
        "Jawaban Benar",
        "Total Soal",
        "Status KKM",
        "Rincian Jawaban Siswa"
      ];
      sheet.appendRow(headers);

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#064e3b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);

      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 220);
      sheet.setColumnWidth(3, 90);
      sheet.setColumnWidth(4, 130);
      sheet.setColumnWidth(5, 180);
      sheet.setColumnWidth(6, 170);
      sheet.setColumnWidth(7, 240);
      sheet.setColumnWidth(8, 110);
      sheet.setColumnWidth(9, 110);
      sheet.setColumnWidth(10, 100);
      sheet.setColumnWidth(11, 110);
      sheet.setColumnWidth(12, 280);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var nowStr = data.waktu || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var namaSiswa = data.namaSiswa || "Siswa Praktikan";
    var nomorAbsen = data.nomorAbsen !== undefined ? String(data.nomorAbsen) : "-";
    var kelas = data.kelas || "-";
    var sekolah = data.sekolah || "-";
    var modul = data.modul || "-";
    var judulKuis = data.judulKuis || "-";
    var skor = Number(data.skor !== undefined ? data.skor : 0);
    var jawabanBenar = data.jawabanBenar !== undefined ? data.jawabanBenar : "-";
    var totalSoal = data.totalSoal !== undefined ? data.totalSoal : "-";
    var status = data.status || (skor >= 75 ? "LULUS" : "REMEDIAL");
    var detailJawaban = typeof data.detailJawaban === 'object' ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

    sheet.appendRow([
      nowStr,
      namaSiswa,
      nomorAbsen,
      kelas,
      sekolah,
      modul,
      judulKuis,
      skor,
      jawabanBenar,
      totalSoal,
      status,
      detailJawaban
    ]);

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 8).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 9).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 10).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 11).setHorizontalAlignment("center");

    var scoreCell = sheet.getRange(lastRow, 8);
    var statusCell = sheet.getRange(lastRow, 11);
    scoreCell.setFontWeight("bold");
    statusCell.setFontWeight("bold");

    if (skor >= 75) {
      statusCell.setBackground("#dcfce7");
      statusCell.setFontColor("#166534");
      scoreCell.setFontColor("#16a34a");
    } else {
      statusCell.setBackground("#fee2e2");
      statusCell.setFontColor("#991b1b");
      scoreCell.setFontColor("#dc2626");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data nilai " + namaSiswa + " berhasil dicatat ke spreadsheet.",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script BIMO Manufacturing Labs aktif & siap menerima data nilai siswa."
  })).setMimeType(ContentService.MimeType.JSON);
}`;

const TeacherGradebook = () => {
  const [scores, setScores] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [activeCell, setActiveCell] = useState('H2');
  
  // Modals & Accordions
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isWebhookAccordionOpen, setIsWebhookAccordionOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [testStatus, setTestStatus] = useState('');
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = () => {
    try {
      const raw = localStorage.getItem('bimo_quiz_scores');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
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
          const cleaned = parsed.filter(item => {
            if (!item) return false;
            const id = String(item.id || '').toLowerCase();
            const nama = String(item.namaSiswa || '').trim().toLowerCase();
            return !id.startsWith('sample_') && !sampleNames.includes(nama);
          });
          localStorage.setItem('bimo_quiz_scores', JSON.stringify(cleaned));
        }
      }
    } catch {}

    const data = getAllStoredScores();
    setScores(data);
    setWebhookUrl(getSpreadsheetWebhookUrl());
  };

  useEffect(() => {
    loadData();

    // Re-load when quiz is submitted
    const handleUpdate = () => loadData();
    window.addEventListener('bimo:quiz_submitted', handleUpdate);
    return () => window.removeEventListener('bimo:quiz_submitted', handleUpdate);
  }, []);

  // Filtered scores based on search, module, and tab
  const filteredScores = scores.filter(item => {
    const matchSearch =
      (item.namaSiswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.nomorAbsen || '').includes(searchQuery) ||
      (item.kelas || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sekolah || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.judulKuis || '').toLowerCase().includes(searchQuery.toLowerCase());

    const effectiveModule = activeTab !== 'all' ? activeTab : selectedModule;
    const matchModule = effectiveModule === 'all' ||
      item.modul === effectiveModule ||
      (item.modul && item.modul.toLowerCase().includes(effectiveModule.toLowerCase())) ||
      (item.judulKuis && item.judulKuis.toLowerCase().includes(effectiveModule.toLowerCase())) ||
      (effectiveModule === 'Safety Lab' && (String(item.modul || '') + String(item.judulKuis || '')).toLowerCase().includes('safety'));
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchSearch && matchModule && matchStatus;
  });

  // Calculate Metrics
  const totalSubmissions = filteredScores.length;
  const uniqueStudents = new Set(filteredScores.map(s => `${s.namaSiswa}_${s.nomorAbsen}`)).size;
  const averageScore = totalSubmissions > 0
    ? Math.round(filteredScores.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / totalSubmissions)
    : 0;
  const passedCount = filteredScores.filter(s => s.status === 'LULUS').length;
  const passingRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const totalBenar = filteredScores.reduce((acc, curr) => acc + (Number(curr.jawabanBenar) || 0), 0);
  const totalSoal = filteredScores.reduce((acc, curr) => acc + (Number(curr.totalSoal) || 0), 0);
  const pendingSyncCount = scores.filter(s => !s.synced).length;

  const ALL_LAB_TABS = [
    { id: 'all', label: 'Semua Modul', icon: '📋' },
    { id: 'Machine Lab', label: 'Machine Lab', icon: '⚙️' },
    { id: 'Alat Pemotong', label: 'Alat Potong', icon: '🔪' },
    { id: 'Heat Treatment', label: 'Heat Treatment', icon: '🌡️' },
    { id: 'Mekanika Teknik', label: 'Mekanika', icon: '🔧' },
    { id: 'Welding Lab', label: 'Welding Lab', icon: '⚡' },
    { id: 'Alat Ukur Presisi', label: 'Alat Ukur', icon: '📏' },
    { id: 'Design Lab', label: 'Design Lab', icon: '📐' },
    { id: 'Safety Lab', label: 'Safety K3', icon: '🛡️' },
    { id: 'Virtual Bengkel 3D', label: 'Bengkel 3D', icon: '🏭' }
  ];

  const handleCopyClipboard = async () => {
    sound.playClick();
    const res = await copyScoresToClipboard(filteredScores);
    if (res.success) {
      sound.playSuccess();
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    sound.playClick();
    setSpreadsheetWebhookUrl(webhookUrl);
    sound.playSuccess();
    setTestStatus('URL Berhasil disimpan!');
    setTimeout(() => {
      setTestStatus('');
      setIsConfigModalOpen(false);
    }, 1200);
  };

  const handleSendTestData = async () => {
    if (!webhookUrl.trim()) {
      alert('Silakan masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }

    setTestStatus('Mengirim data uji coba...');
    sound.playClick();

    const testRecord = {
      waktu: new Date().toLocaleString('id-ID'),
      namaSiswa: 'Siswa Percobaan (Test)',
      nomorAbsen: '99',
      kelas: 'X TPM 1',
      sekolah: 'SMKN 2 Depok',
      modul: 'Uji Koneksi Sistem',
      judulKuis: 'Verifikasi Webhook Spreadsheet',
      skor: 100,
      jawabanBenar: 10,
      totalSoal: 10,
      status: 'LULUS',
      detailJawaban: 'Tes koneksi webhook berhasil terhubung dari website BIMO Labs!'
    };

    const res = await sendToGoogleSheet(testRecord);
    if (res.success) {
      sound.playSuccess();
      setTestStatus('✅ Berhasil terkirim! Silakan periksa Google Spreadsheet Anda.');
    } else {
      sound.playError();
      setTestStatus(`⚠️ Gagal mengirim: ${res.error || res.reason || 'Periksa kembali URL Webhook Anda'}`);
    }
  };

  const handleSyncPending = async () => {
    sound.playClick();
    const res = await syncPendingScores();
    loadData();
    if (res.synced > 0) {
      sound.playSuccess();
      alert(`Berhasil menyinkronkan ${res.synced} dari ${res.total} data ke Google Spreadsheet!`);
    } else {
      alert('Tidak ada data tertunda yang berhasil disinkronkan. Pastikan URL Spreadsheet valid.');
    }
  };

  const handleClearData = () => {
    sound.playClick();
    if (window.confirm('PERINGATAN GURU:\nApakah Anda yakin ingin menghapus seluruh data nilai di perangkat ini?')) {
      clearAllStoredScores();
      setScores([]);
      sound.playSuccess();
      showToast('🗑️ Data lokal berhasil dibersihkan.');
    }
  };

  const copyAppsScript = () => {
    sound.playClick();
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          background: '#064e3b',
          color: '#ecfdf5',
          border: '1.5px solid #10b981',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>📗</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SPREADSHEET APPLICATION HEADER & TOOLBAR */}
      <div
        className="dashboard-card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(6, 78, 59, 0.25)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '4px 12px', borderRadius: '20px', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 800, marginBottom: '10px' }}>
              <span>📗</span>
              <span>LEMBAR KERJA SPREADSHEET TERINTEGRASI</span>
              <span style={{ background: '#10b981', color: '#064e3b', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>OTOMATIS AKTIF</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.5px' }}>
              REKAPITULASI NILAI SISWA (SMKN 2 DEPOK)
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '6px', maxWidth: '750px', lineHeight: 1.5, margin: 0 }}>
              Lembar spreadsheet siap pakai untuk memantau hasil pengerjaan kuis & tes diagnostik siswa (Machine Lab, Bubut, CNC, Heat Treatment, Mekanika, Las, dll). Format tabel tersusun rapi sesuai standar kurikulum dan dapat diunduh langsung.
            </p>
          </div>

          {/* TOP QUICK ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* UNDUH EXCEL */}
            <button
              onClick={() => { sound.playClick(); exportScoresToExcelHTML(filteredScores); }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 15px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
              title="Unduh file Excel (.xls) dengan tabel terformat rapi"
            >
              <span>📥</span>
              <span>Unduh Excel (.xls)</span>
            </button>

            {/* UNDUH CSV */}
            <button
              onClick={() => { sound.playClick(); exportScoresToCSV(filteredScores); }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Unduh format standar CSV (Kompatibel Google Sheets & Excel)"
            >
              <span>📄</span>
              <span>Unduh CSV</span>
            </button>

            {/* SALIN CLIPBOARD */}
            <button
              onClick={handleCopyClipboard}
              style={{
                background: 'rgba(245, 158, 11, 0.18)',
                border: '1px solid #f59e0b',
                color: '#fef3c7',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Salin seluruh data tabel agar bisa langsung di-Paste (Ctrl+V) ke Google Sheets atau Excel"
            >
              <span>📋</span>
              <span>Salin Tabel (Paste ke Sheets)</span>
            </button>

            {/* CETAK / PDF */}
            <button
              onClick={() => { sound.playClick(); window.print(); }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Cetak atau simpan sebagai dokumen PDF"
            >
              <span>🖨️</span>
              <span>Cetak / PDF</span>
            </button>

            {/* BUKA GOOGLE SHEETS BARU */}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(2, 132, 199, 0.25)',
                border: '1px solid #0284c7',
                color: '#e0f2fe',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Buka lembar kerja Google Sheets baru di tab terpisah"
            >
              <span>↗️</span>
              <span>Buka sheets.new</span>
            </a>
          </div>
        </div>

        {/* STATUS & INFO SUBBAR */}
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 700 }}>
              <span>🟢</span>
              <span>Status: Spreadsheet Aktif & Terformat Otomatis</span>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Guru Pengampu: <strong>Bimoro Kusumo, S.Pd.</strong></span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Kelas: <strong>X TPM 1 (Teknik Permesinan)</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleClearData}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Bersihkan data nilai di browser ini"
            >
              🗑️ Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* SPREADSHEET FORMULA BAR (fx) */}
      <div
        className="dashboard-card"
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '10px',
          border: '1px solid var(--border-light, #e2e8f0)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{
          padding: '4px 10px',
          borderRadius: '6px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#0f172a'
        }}>
          {activeCell}
        </div>

        <div style={{
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: '1.05rem',
          color: '#64748b'
        }}>
          fx
        </div>

        <div style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '0.84rem',
          color: '#0f172a',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '6px 12px',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <strong style={{ color: '#059669' }}>=AVERAGE(H2:H{filteredScores.length + 1})</strong>
            <span style={{ color: '#64748b', marginLeft: '10px' }}>➔ Rata-rata Skor: <strong>{averageScore} / 100</strong></span>
          </span>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Format: Kemendikbudristek SMK Teknik Permesinan
          </span>
        </div>
      </div>

      {/* KPI METRICS BAR STYLED AS SPREADSHEET FORMULAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* KPI 1: TOTAL SUBMISSIONS */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTA(B2:B)</span>
            <span style={{ fontSize: '1.2rem' }}>📝</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {totalSubmissions} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Baris Data</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Total asesmen & kuis siswa terdata</div>
        </div>

        {/* KPI 2: UNIQUE STUDENTS */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTUNIQUE(B2:B)</span>
            <span style={{ fontSize: '1.2rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            {uniqueStudents} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Siswa Aktif</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>SMKN 2 Depok Jurusan TPM</div>
        </div>

        {/* KPI 3: AVERAGE SCORE */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =AVERAGE(H2:H)</span>
            <span style={{ fontSize: '1.2rem' }}>⭐</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: averageScore >= 75 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
            {averageScore} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Batas KKM Standar: 75</div>
        </div>

        {/* KPI 4: PASSING RATE */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTIF(J:J, "LULUS")</span>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: passingRate >= 75 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {passingRate}% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>({passedCount}/{totalSubmissions})</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Siswa mencapai KKM kompetensi</div>
        </div>
      </div>

      {/* SPREADSHEET SHEET TABS (PILIHAN LEMBAR MODUL PRAKTIK) */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        borderBottom: '2px solid var(--border-light, #e2e8f0)'
      }}>
        {ALL_LAB_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'all' 
            ? scores.length 
            : scores.filter(s => s.modul === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px 8px 0 0',
                border: isActive ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                borderBottom: isActive ? '2px solid #10b981' : '1px solid #cbd5e1',
                background: isActive ? '#064e3b' : 'var(--bg-card, #ffffff)',
                color: isActive ? '#ffffff' : 'var(--text-main, #0f172a)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? '#10b981' : '#e2e8f0',
                color: isActive ? '#064e3b' : '#475569',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="dashboard-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          {/* SEARCH INPUT */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama siswa, no. absen, kelas, kuis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #cbd5e1)',
                fontSize: '0.84rem',
                outline: 'none',
                background: 'var(--bg-game, #f8fafc)',
                color: 'var(--text-main, #0f172a)'
              }}
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #cbd5e1)',
              fontSize: '0.82rem',
              background: 'var(--bg-game, #f8fafc)',
              color: 'var(--text-main, #0f172a)',
              cursor: 'pointer'
            }}
          >
            <option value="all">Semua Status (Lulus & Remedial)</option>
            <option value="LULUS">✓ LULUS (Skor ≥ 75)</option>
            <option value="REMEDIAL">✗ REMEDIAL (Skor &lt; 75)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Menampilkan <strong>{filteredScores.length}</strong> dari <strong>{scores.length}</strong> entri nilai
        </div>
      </div>

      {/* THE SPREADSHEET WORKTABLE */}
      <div
        className="dashboard-card"
        style={{
          overflow: 'hidden',
          padding: 0,
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ overflowX: 'auto', maxHeight: '650px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.83rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* COLUMN COORDINATES HEADER (A, B, C, D, E, F, G, H, I, J, K) */}
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              {/* ROW COORDINATES: A, B, C... */}
              <tr style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ width: '40px', padding: '6px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>#</th>
                <th style={{ padding: '6px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>A</th>
                <th style={{ padding: '6px 14px', borderRight: '1px solid #cbd5e1' }}>B</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>C</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>D</th>
                <th style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1' }}>E</th>
                <th style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1' }}>F</th>
                <th style={{ padding: '6px 14px', borderRight: '1px solid #cbd5e1' }}>G</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>H</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>I</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>J</th>
                <th style={{ padding: '6px 10px', textAlign: 'center' }}>K</th>
              </tr>

              {/* COLUMN LABELS: Waktu, Nama, Absen, dll */}
              <tr style={{ background: '#064e3b', color: '#f0fdf4', borderBottom: '2px solid #047857' }}>
                <th style={{ padding: '12px 6px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, width: '40px' }}>
                  No
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Waktu & Tanggal
                </th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Nama Siswa
                </th>
                <th style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Absen
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Kelas
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Sekolah
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Modul Praktik
                </th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Kuis / Diagnostik
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Skor (0-100)
                </th>
                <th style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Benar / Total
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Status KKM
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Aksi & Rincian
                </th>
              </tr>
            </thead>

            {/* SPREADSHEET ROWS */}
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      Belum Ada Data Rekapan Nilai
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Nilai siswa akan otomatis tercatat secara real-time di sini saat siswa menyelesaikan kuis atau tes diagnostik.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredScores.map((row, idx) => {
                  const isPassed = row.status === 'LULUS';
                  const rowNum = idx + 2; // Row 1 is header
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={row.id || idx}
                      onClick={() => setActiveCell(`H${rowNum}`)}
                      style={{
                        background: isEven ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isEven ? '#ffffff' : '#f8fafc'}
                    >
                      {/* ROW NUMBER (SPREADSHEET COORDINATE) */}
                      <td style={{
                        padding: '10px 6px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRight: '1px solid #cbd5e1',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}>
                        {rowNum}
                      </td>

                      {/* [A] WAKTU */}
                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', borderRight: '1px solid #e2e8f0' }}>
                        {row.waktu || row.timestamp?.slice(0, 10)}
                      </td>

                      {/* [B] NAMA SISWA */}
                      <td style={{ padding: '10px 16px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {row.namaSiswa}
                      </td>

                      {/* [C] NO. ABSEN */}
                      <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {row.nomorAbsen || '-'}
                        </span>
                      </td>

                      {/* [D] KELAS */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {row.kelas || '-'}
                      </td>

                      {/* [E] SEKOLAH */}
                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.8rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {row.sekolah || 'SMKN 2 Depok'}
                      </td>

                      {/* [F] MODUL LAB */}
                      <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: '#065f46' }}>{row.modul}</span>
                      </td>

                      {/* [G] KUIS / DIAGNOSTIK */}
                      <td style={{ padding: '10px 16px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.judulKuis}</div>
                      </td>

                      {/* [H] SKOR (0-100) */}
                      <td style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: isPassed ? '#166534' : '#991b1b',
                        background: isPassed ? 'rgba(220, 252, 231, 0.4)' : 'rgba(254, 226, 226, 0.4)',
                        borderRight: '1px solid #e2e8f0'
                      }}>
                        {row.skor}
                      </td>

                      {/* [I] BENAR / TOTAL */}
                      <td style={{ padding: '10px 10px', textAlign: 'center', color: '#475569', fontWeight: 700, borderRight: '1px solid #e2e8f0' }}>
                        {row.jawabanBenar} / {row.totalSoal}
                      </td>

                      {/* [J] STATUS KKM */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isPassed ? '#dcfce7' : '#fee2e2',
                            color: isPassed ? '#166534' : '#991b1b',
                            border: `1px solid ${isPassed ? '#bbf7d0' : '#fecaca'}`,
                            display: 'inline-block'
                          }}
                        >
                          {isPassed ? '✓ LULUS' : '✗ REMEDIAL'}
                        </span>
                      </td>

                      {/* [K] DETAIL & AKSI */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => { sound.playClick(); setSelectedDetailRecord(row); }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            color: '#0284c7',
                            fontWeight: 800
                          }}
                        >
                          🔍 Rincian
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* SPREADSHEET FORMULA SUMMARY FOOTER (ROW Σ) */}
            {filteredScores.length > 0 && (
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#f8fafc', borderTop: '2px solid #064e3b' }}>
                <tr style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                  <td style={{ padding: '12px 6px', textAlign: 'center', background: '#e2e8f0', borderRight: '1px solid #cbd5e1', color: '#064e3b' }}>
                    Σ
                  </td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>
                    =SUMMARY()
                  </td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #cbd5e1' }}>
                    Total: <strong style={{ color: '#064e3b' }}>{filteredScores.length} Siswa</strong>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1' }}>SMKN 2 Depok</td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>
                    =AVERAGE(H:H)
                  </td>
                  <td style={{
                    padding: '12px 12px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    color: averageScore >= 75 ? '#166534' : '#991b1b',
                    background: '#ecfdf5',
                    borderRight: '1px solid #cbd5e1'
                  }}>
                    {averageScore}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                    {totalBenar} / {totalSoal}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                    <span style={{ color: '#166534', fontWeight: 900 }}>
                      {passedCount} Lulus ({passingRate}%)
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => { sound.playClick(); exportScoresToExcelHTML(filteredScores); }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Unduh .xls
                    </button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* SPREADSHEET FOOTER BAR / SHEET NAVIGATOR */}
      <div
        className="dashboard-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#064e3b', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
            Sheet1
          </span>
          <span style={{ fontWeight: 700, color: '#334155' }}>
            Rekapitulasi Nilai Siswa SMK - Kurikulum Merdeka & Industri Permesinan
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#64748b' }}>
          <span>💡 <em>Tips: Klik <strong>"Unduh Excel (.xls)"</strong> untuk langsung membuka laporan ini di Microsoft Excel.</em></span>
        </div>
      </div>

      {/* ADVANCED OPTIONAL ACCORDION: GOOGLE APPS SCRIPT WEBHOOK */}
      <div
        className="dashboard-card"
        style={{
          padding: '18px 24px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          borderRadius: '12px'
        }}
      >
        <div
          onClick={() => setIsWebhookAccordionOpen(!isWebhookAccordionOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚙️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main, #0f172a)' }}>
                Integrasi Cloud Otomatis ke Google Drive (Opsional)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Spreadsheet di atas sudah siap digunakan langsung. Buka bagian ini HANYA jika Anda ingin hasil kuis otomatis dikirim ke Google Sheets di akun Google Anda.
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 800 }}>
            {isWebhookAccordionOpen ? '▲ Sembunyikan' : '▼ Lihat Pengaturan'}
          </div>
        </div>

        {isWebhookAccordionOpen && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => { sound.playClick(); setIsGuideModalOpen(true); }}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📋 Panduan & Salin Kode Apps Script
              </button>

              <button
                onClick={() => { sound.playClick(); setIsConfigModalOpen(true); }}
                style={{
                  background: webhookUrl ? '#10b981' : '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {webhookUrl ? '🟢 Ganti URL Webhook' : '⚙️ Tempel URL Webhook'}
              </button>

              {pendingSyncCount > 0 && (
                <button
                  onClick={handleSyncPending}
                  style={{
                    background: '#d97706',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Sinkronkan {pendingSyncCount} Nilai Tertunda
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Target Webhook saat ini: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: webhookUrl ? '#059669' : '#dc2626' }}>
                {webhookUrl ? webhookUrl : '(Belum dipasang - Data tetap aman tersimpan di spreadsheet lab ini)'}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL JAWABAN SISWA */}
      {selectedDetailRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '16px', padding: '26px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🔍</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Rincian Hasil Asesmen Siswa
                </h3>
              </div>
              <button onClick={() => setSelectedDetailRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div><strong>Nama Siswa:</strong> {selectedDetailRecord.namaSiswa}</div>
              <div><strong>No. Absen:</strong> {selectedDetailRecord.nomorAbsen}</div>
              <div><strong>Kelas / Jurusan:</strong> {selectedDetailRecord.kelas}</div>
              <div><strong>Sekolah:</strong> {selectedDetailRecord.sekolah || 'SMKN 2 Depok'}</div>
              <div><strong>Modul Lab:</strong> {selectedDetailRecord.modul}</div>
              <div><strong>Nama Kuis:</strong> {selectedDetailRecord.judulKuis}</div>
              <div>
                <strong>Skor Hasil:</strong>{' '}
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: selectedDetailRecord.status === 'LULUS' ? '#16a34a' : '#dc2626' }}>
                  {selectedDetailRecord.skor} / 100
                </span>
              </div>
              <div>
                <strong>Status KKM:</strong>{' '}
                <span style={{ fontWeight: 800, color: selectedDetailRecord.status === 'LULUS' ? '#16a34a' : '#dc2626' }}>
                  {selectedDetailRecord.status}
                </span>
              </div>
              <div style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Waktu Selesai:</strong> {selectedDetailRecord.waktu}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px' }}>
                Rekaman Jawaban Soal:
              </label>
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '220px', lineHeight: 1.5 }}>
                {selectedDetailRecord.detailJawaban || 'Tidak ada catatan jawaban tambahan.'}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedDetailRecord(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIGURASI WEBHOOK GOOGLE SPREADSHEET */}
      {isConfigModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <span>⚙️</span> Konfigurasi Webhook Google Spreadsheet
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Tempelkan <strong>URL Aplikasi Web Google Apps Script</strong> dari Spreadsheet Anda di bawah ini agar nilai siswa otomatis terkirim.
            </p>

            <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  URL Web App Google Apps Script:
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {testStatus && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                  {testStatus}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleSendTestData}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  🧪 Uji Kirim Baris Tes
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN & KODE GOOGLE APPS SCRIPT */}
      {isGuideModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '820px', background: '#fff', borderRadius: '18px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <span>📋</span> Kode Google Apps Script & Cara Pasang (Opsional)
              </h3>
              <button onClick={() => setIsGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Langkah Pemasangan di Google Spreadsheet Pribadi:</div>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Buka <strong>https://sheets.new</strong> di tab baru untuk membuat spreadsheet kosong.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> ➔ pilih <strong>Apps Script</strong>.</li>
                <li>Hapus kode lama, lalu klik tombol <strong>"Salin Kode Apps Script"</strong> di bawah dan tempelkan.</li>
                <li>Klik <strong>Simpan</strong> (ikon disket), lalu klik tombol biru <strong>Terapkan (Deploy)</strong> ➔ <strong>Penerapan baru</strong>.</li>
                <li>Pilih jenis <strong>Aplikasi web</strong>, ubah <em>Yang memiliki akses</em> menjadi: <strong>Siapa saja (Anyone)</strong>.</li>
                <li>Salin URL Web App yang berakhiran <code>/exec</code> lalu tempelkan di menu pengaturan webhook.</li>
              </ol>
            </div>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: '#cbd5e1', padding: '10px 16px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700 }}>Code.gs (Google Apps Script)</span>
                <button
                  onClick={copyAppsScript}
                  style={{
                    background: copyCodeSuccess ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copyCodeSuccess ? '✓ Kode Berhasil Disalin!' : '📋 Salin Kode Apps Script'}
                </button>
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#93c5fd',
                  padding: '16px',
                  borderBottomLeftRadius: '10px',
                  borderBottomRightRadius: '10px',
                  fontSize: '0.76rem',
                  overflowX: 'auto',
                  maxHeight: '280px',
                  margin: 0,
                  fontFamily: 'monospace'
                }}
              >
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsGuideModalOpen(false);
                  setIsConfigModalOpen(true);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Lanjut Masukkan URL Webhook ➔
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherGradebook;
