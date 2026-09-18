import React, { useState, useEffect } from 'react';
import {
  getAllStoredScores,
  getSpreadsheetWebhookUrl,
  setSpreadsheetWebhookUrl,
  exportScoresToCSV,
  clearAllStoredScores,
  syncPendingScores,
  sendToGoogleSheet,
  recordQuizResult
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
        "Status",
        "Rincian Jawaban Siswa"
      ];
      sheet.appendRow(headers);

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#f8fafc");
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
  
  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [testStatus, setTestStatus] = useState('');
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  const loadData = () => {
    setScores(getAllStoredScores());
    setWebhookUrl(getSpreadsheetWebhookUrl());
  };

  useEffect(() => {
    loadData();

    // Re-load when quiz is submitted
    const handleUpdate = () => loadData();
    window.addEventListener('bimo:quiz_submitted', handleUpdate);
    return () => window.removeEventListener('bimo:quiz_submitted', handleUpdate);
  }, []);

  // Filtered scores
  const filteredScores = scores.filter(item => {
    const matchSearch =
      (item.namaSiswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.nomorAbsen || '').includes(searchQuery) ||
      (item.kelas || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.judulKuis || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchModule = selectedModule === 'all' || item.modul === selectedModule;
    const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchSearch && matchModule && matchStatus;
  });

  // Calculate Metrics
  const totalSubmissions = scores.length;
  const uniqueStudents = new Set(scores.map(s => `${s.namaSiswa}_${s.nomorAbsen}`)).size;
  const averageScore = totalSubmissions > 0
    ? Math.round(scores.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / totalSubmissions)
    : 0;
  const passedCount = scores.filter(s => s.status === 'LULUS').length;
  const passingRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const pendingSyncCount = scores.filter(s => !s.synced).length;

  const modulesList = ['all', ...Array.from(new Set(scores.map(s => s.modul).filter(Boolean)))];

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
      kelas: 'X TPM Test',
      sekolah: 'SMK Bimo Labs',
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
    if (window.confirm('PERINGATAN GURU:\nApakah Anda yakin ingin menghapus seluruh riwayat nilai lokal di perangkat ini?\n\n(Data yang sudah masuk ke Google Spreadsheet Anda akan tetap aman).')) {
      clearAllStoredScores();
      loadData();
      sound.playSuccess();
    }
  };

  const copyAppsScript = () => {
    sound.playClick();
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER HERO BANNER */}
      <div
        className="dashboard-card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '5px 12px', borderRadius: '20px', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 800, marginBottom: '12px' }}>
              <span>👨‍🏫</span>
              <span>PANEL MONITORING GURU & ASESMEN SISWA</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Chakra Petch', sans-serif" }}>
              REKAP NILAI & INTEGRASI SPREADSHEET
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px', maxWidth: '700px', lineHeight: 1.5, margin: 0 }}>
              Pantau seluruh hasil evaluasi kuis teori, pre-test praktikum mesin bubut, CNC, metrologi, dan mekanika teknik siswa. Data otomatis terkirim langsung ke Google Spreadsheet Anda.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* BUTTON KONFIGURASI SPREADSHEET */}
            <button
              onClick={() => { sound.playClick(); setIsConfigModalOpen(true); }}
              style={{
                background: webhookUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: `1.5px solid ${webhookUrl ? '#10b981' : '#f59e0b'}`,
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{webhookUrl ? '🟢 Spreadsheet Terhubung' : '⚙️ Hubungkan Spreadsheet'}</span>
            </button>

            {/* BUTTON PANDUAN & KODE */}
            <button
              onClick={() => { sound.playClick(); setIsGuideModalOpen(true); }}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
              }}
            >
              <span>📋 Kode Apps Script & Panduan</span>
            </button>
          </div>
        </div>

        {/* STATUS WEBHOOK BAR */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Target Google Sheets:</span>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px', color: webhookUrl ? '#34d399' : '#f87171', fontSize: '0.78rem' }}>
              {webhookUrl ? (webhookUrl.slice(0, 48) + '...') : 'Belum Dikonfigurasi (Data disimpan di lokal)'}
            </code>
          </div>

          {pendingSyncCount > 0 && (
            <button
              onClick={handleSyncPending}
              style={{
                background: '#d97706',
                border: 'none',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🔄 Sinkronkan {pendingSyncCount} Data Tertunda
            </button>
          )}
        </div>
      </div>

      {/* KPI STATISTIK CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* CARD 1: TOTAL UJIAN SELESAI */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
            📝
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Asesmen Selesai</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalSubmissions}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dari seluruh modul praktikum</div>
          </div>
        </div>

        {/* CARD 2: SISWA TERDATA */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Siswa Berpartisipasi</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', lineHeight: 1.2 }}>{uniqueStudents}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Jumlah siswa unik tercatat</div>
          </div>
        </div>

        {/* CARD 3: RATA-RATA NILAI */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
            ⭐
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rata-Rata Nilai</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: averageScore >= 75 ? '#16a34a' : '#d97706', lineHeight: 1.2 }}>
              {averageScore} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>KKM Standar: 75</div>
          </div>
        </div>

        {/* CARD 4: TINGKAT KELULUSAN */}
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tingkat Kelulusan</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: passingRate >= 70 ? '#10b981' : '#ef4444', lineHeight: 1.2 }}>
              {passingRate}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{passedCount} dari {totalSubmissions} Lulus</div>
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div className="dashboard-card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* LEFT: SEARCH & FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
          {/* SEARCH INPUT */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Cari siswa, nomor absen, kuis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
                outline: 'none',
                background: 'var(--bg-game)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          {/* FILTER MODUL */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              background: 'var(--bg-game)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <option value="all">Semua Modul Praktik</option>
            {modulesList.filter(m => m !== 'all').map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* FILTER STATUS */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              background: 'var(--bg-game)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <option value="all">Semua Status</option>
            <option value="LULUS">LULUS (≥ 75)</option>
            <option value="REMEDIAL">REMEDIAL (&lt; 75)</option>
          </select>
        </div>

        {/* RIGHT: EXPORT & MANAGEMENT BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { sound.playClick(); exportScoresToCSV(filteredScores); }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>📥 Export Excel / CSV</span>
          </button>

          <button
            onClick={handleClearData}
            style={{
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Hapus data riwayat lokal"
          >
            <span>🗑️ Reset</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="dashboard-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Waktu / Tanggal</th>
                <th style={{ padding: '14px 12px', fontWeight: 800, textAlign: 'center' }}>No. Absen</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Nama Siswa</th>
                <th style={{ padding: '14px 14px', fontWeight: 800 }}>Kelas</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>Modul & Kuis</th>
                <th style={{ padding: '14px 14px', fontWeight: 800, textAlign: 'center' }}>Nilai</th>
                <th style={{ padding: '14px 14px', fontWeight: 800, textAlign: 'center' }}>Benar / Total</th>
                <th style={{ padding: '14px 14px', fontWeight: 800, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 14px', fontWeight: 800, textAlign: 'center' }}>Sheets Sync</th>
                <th style={{ padding: '14px 14px', fontWeight: 800, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Belum Ada Data Nilai yang Tercatat</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', marginTop: '4px' }}>
                      Ketika siswa mengerjakan kuis di modul mana pun (CNC, Bubut, Metrologi, dll), nilainya otomatis tercatat di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredScores.map((row, idx) => {
                  const isPassed = row.status === 'LULUS';
                  return (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'
                      }}
                    >
                      <td style={{ padding: '12px 18px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {row.waktu || row.timestamp?.slice(0, 10)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                          {row.nomorAbsen || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {row.namaSiswa}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>
                        {row.kelas || '-'}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.judulKuis}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.modul}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 900,
                            color: isPassed ? '#16a34a' : '#dc2626'
                          }}
                        >
                          {row.skor}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        {row.jawabanBenar} / {row.totalSoal}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isPassed ? '#dcfce7' : '#fee2e2',
                            color: isPassed ? '#166534' : '#991b1b',
                            display: 'inline-block'
                          }}
                        >
                          {isPassed ? '✓ LULUS' : '✗ REMEDIAL'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: row.synced ? '#16a34a' : '#ea580c',
                            background: row.synced ? '#f0fdf4' : '#fff7ed',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${row.synced ? '#bbf7d0' : '#fed7aa'}`
                          }}
                        >
                          {row.synced ? '✅ Terkirim' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedDetailRecord(row)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-light)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: '#0284c7',
                            fontWeight: 700
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL JAWABAN */}
      {selectedDetailRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '16px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Rincian Hasil Asesmen Siswa</h3>
              <button onClick={() => setSelectedDetailRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div><strong>Nama:</strong> {selectedDetailRecord.namaSiswa}</div>
              <div><strong>No. Absen:</strong> {selectedDetailRecord.nomorAbsen}</div>
              <div><strong>Kelas:</strong> {selectedDetailRecord.kelas}</div>
              <div><strong>Nilai:</strong> <span style={{ fontWeight: 900, color: selectedDetailRecord.status === 'LULUS' ? '#16a34a' : '#dc2626' }}>{selectedDetailRecord.skor} / 100</span></div>
              <div><strong>Modul:</strong> {selectedDetailRecord.modul}</div>
              <div><strong>Kuis:</strong> {selectedDetailRecord.judulKuis}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Waktu:</strong> {selectedDetailRecord.waktu}</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Rekaman Rincian Jawaban:</label>
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '200px' }}>
                {selectedDetailRecord.detailJawaban || 'Tidak ada detail teks tambahan.'}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedDetailRecord(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIGURASI WEBHOOK SPREADSHEET */}
      {isConfigModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> Konfigurasi Webhook Google Spreadsheet
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Tempelkan (Paste) <strong>URL Aplikasi Web Google Apps Script</strong> dari Spreadsheet Anda di bawah ini agar nilai siswa otomatis terkirim.
            </p>

            <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
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
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid var(--border-light)', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
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
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Kode Google Apps Script & Cara Pasang (1 Menit)
              </h3>
              <button onClick={() => setIsGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* RINGKASAN LANGKAH */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Langkah Pemasangan di Google Spreadsheet:</div>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Buka <strong>https://sheets.new</strong> di tab baru untuk membuat spreadsheet kosong.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> ➔ pilih <strong>Apps Script</strong>.</li>
                <li>Hapus kode lama, lalu klik tombol <strong>"Salin Kode Apps Script"</strong> di bawah dan tempelkan.</li>
                <li>Klik <strong>Simpan</strong> (ikon disket), lalu klik tombol biru <strong>Terapkan (Deploy)</strong> ➔ <strong>Penerapan baru</strong>.</li>
                <li>Pilih jenis <strong>Aplikasi web</strong>, ubah <em>Yang memiliki akses</em> menjadi: <strong>Siapa saja (Anyone)</strong>.</li>
                <li>Salin URL Web App yang berakhiran <code>/exec</code> lalu tempelkan di tombol <em>"⚙️ Hubungkan Spreadsheet"</em>.</li>
              </ol>
            </div>

            {/* KODE BOX WITH 1-CLICK COPY */}
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
                  background: '#f59e0b',
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
