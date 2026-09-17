import React, { useState, useEffect } from 'react';

const ModulesView = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'books', 'sem1', 'sem2'
  const [selectedModule, setSelectedModule] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);

  // 🌟 BUKU DIGITAL INTERAKTIF 3D (50 HALAMAN LENGKAP - KURIKULUM DEEP LEARNING)
  const digitalBooks = [
    {
      id: 'buku-tflm',
      title: "Teknik Fabrikasi Logam & Manufaktur (TFLM)",
      subtitle: "Fase E (Kelas X) • Kurikulum Deep Learning",
      category: "Buku Digital 3D",
      badge: "50 HALAMAN LENGKAP",
      color: "#0284c7",
      cover: "/books/buku_tflm/assets/images/general/cover_book.jpg",
      link: "/books/buku_tflm/index.html",
      isFlipbook: true,
      desc: "Buku ajar digital interaktif 50 halaman berfitur 3D Flip Book realistis, Web Audio sound effect, dan lab virtual SMAW. Disusun sesuai dokumen CP & ATP TFLM SMK Negeri 2 Depok Sleman.",
      topics: [
        "1.1 Kecakapan Kerja & Etika Industri",
        "1.2 K3LH & Budaya Kerja 5R Kaizen",
        "1.3 Penggunaan Perkakas Bengkel & Jangka Sorong",
        "1.4 Pengelasan SMAW Dasar & Elektroda AWS",
        "1.5 Wawasan Dunia Kerja & Technopreneurship"
      ],
      chapters: [
        {
          title: "Bab 1: Kecakapan Kerja",
          content: "Bab 1. Kecakapan Kerja Dasar Bengkel Fabrikasi. Mencakup etika profesional, hierarki organisasi industri manufaktur, pembacaan gambar kerja teknik, work order, dan layouting pelat."
        },
        {
          title: "Bab 2: K3LH & Budaya 5R",
          content: "Bab 2. Landasan Hukum K3LH dan Budaya 5R. Penerapan Undang-Undang Nomor 1 Tahun 1970, hierarki pengendalian bahaya, APD juru las lengkap, penanganan asap las, keselamatan tabung gas, dan budaya industri 5R."
        },
        {
          title: "Bab 3: Perkakas Bengkel & Jangka Sorong",
          content: "Bab 3. Penggunaan Perkakas Bengkel Fabrikasi. Meliputi ragum bangku, kikir baja, gergaji tangan, mesin gerinda tangan, mesin bor duduk, serta instrumen ukur linier jangka sorong ketelitian 0,05 mm dan mikrometer."
        },
        {
          title: "Bab 4: Pengelasan SMAW Dasar",
          content: "Bab 4. Pengelasan Busur Manual SMAW. Prinsip fisika busur listrik, mesin las inverter, polaritas DCEN dan DCEP, klasifikasi elektroda berselaput AWS A5.1, oven elektroda, serta sambungan sudut 1F dan tumpul 1G."
        },
        {
          title: "Bab 5: Wawasan Karir & Kewirausahaan",
          content: "Bab 5. Wawasan Industri & Technopreneurship. Lanskap industri fabrikasi modern, otomasi las robotik, jenjang karir sertifikasi welder BNSP, dan kewirausahaan bengkel manufaktur."
        }
      ]
    },
    {
      id: 'buku-tp',
      title: "Dasar-Dasar Teknik Pemesinan (TP)",
      subtitle: "Fase E (Kelas X) • Kurikulum Deep Learning",
      category: "Buku Digital 3D",
      badge: "50 HALAMAN LENGKAP",
      color: "#f59e0b",
      cover: "/books/buku_tp/assets/images/general/cover_book.jpg",
      link: "/books/buku_tp/index.html",
      isFlipbook: true,
      desc: "Buku ajar digital interaktif 50 halaman berfitur simulator jangka sorong 0,05 mm, kalkulator parameter RPM spindel bubut, dekoder bearing ISO, proyeksi ortogonal, dan sertifikat resmi.",
      topics: [
        "1.1 Kecakapan Kerja, K3LH & Budaya 5R Pemesinan",
        "1.2 Pengetahuan Bahan Teknik (Material Science)",
        "1.3 Metrologi, Alat Ukur & Mesin Bubut Standar",
        "1.4 Gambar Teknik Mesin Standar ISO",
        "1.5 Dasar Sistem Mekanik, Bearing & Roda Gigi",
        "1.6 Wawasan Industri 4.0 & Technopreneurship"
      ],
      chapters: [
        {
          title: "Bab 1: K3LH Pemesinan",
          content: "Bab 1. Kecakapan Kerja dan K3LH Pemesinan. Etika industri, regulasi K3LH UU Nomor 1 Tahun 1970, APD operator mesin perkakas dengan larangan sarung tangan pada poros berputar, pengendalian tatal beram, APAR PASS, dan budaya 5R."
        },
        {
          title: "Bab 2: Bahan Teknik",
          content: "Bab 2. Pengetahuan Bahan Teknik. Klasifikasi logam fero baja karbon dan non-fero aluminium/tembaga, sifat fisik densitas dan titik lebur, sifat kimia korosi, sifat listrik konduktor, serta sifat mekanik uji tarik dan perlakuan panas quenching."
        },
        {
          title: "Bab 3: Proses Produksi & Bubut",
          content: "Bab 3. Teknik Dasar Proses Produksi. Pemotongan cutting Gerling vs non-cutting, metrologi mistar baja, jangka sorong 0,05 mm, mikrometer 0,01 mm, kerja bangku ragum-kikir, mesin bor, dan pengoperasian mesin bubut konvensional."
        },
        {
          title: "Bab 4: Gambar Teknik ISO",
          content: "Bab 4. Gambar Teknik Mesin Standar ISO. Bahasa universal gambar, CAD 3D, format kertas ISO 216, etiket ISO 7200, garis gambar ISO 128, dimensi ukuran, proyeksi piktorial isometri, proyeksi ortogonal Eropa vs Amerika, dan toleransi H7/g6."
        },
        {
          title: "Bab 5: Sistem Mekanik & Transmisi",
          content: "Bab 5. Dasar Sistem Mekanik. Sambungan tetap paku keling/las dan sambungan lepas baut-pasak, tumpuan bantalan luncur bushing dan gelinding ball bearing, dekoder kode bearing ISO, transmisi roda gigi spur/helical, puli sabuk V-belt, dan rantai rol."
        },
        {
          title: "Bab 6: Industri 4.0 & Wirausaha",
          content: "Bab 6. Wawasan Industri Manufaktur & Industri 4.0. Rantai pasok manufaktur global, evolusi mesin manual ke CNC multi-axis 5-axis, smart manufacturing IoT, 3D printing logam SLM, standar kompetensi SKKNI BNSP, dan technopreneurship bengkel presisi."
        }
      ]
    }
  ];

  const modulesSem1 = [
    { 
      title: "Pengetahuan Bahan", 
      category: "Modul Ajar", 
      color: "#3b82f6", 
      link: "https://drive.google.com/file/d/1pnGC9S1pahpjpsZJCJ_IuDVpJNcHCfJ9/preview",
      chapters: [
        {
          title: "Bab 1: Jenis Bahan",
          content: "Bab 1. Jenis-jenis Bahan Teknik. Bahan teknik secara umum diklasifikasikan menjadi dua kelompok besar, yaitu bahan logam dan bahan non-logam. Bahan logam dibagi lagi menjadi logam ferro yang mengandung unsur besi, seperti baja dan besi cor, serta logam non-ferro yang tidak mengandung besi, seperti aluminium, tembaga, dan kuningan. Sedangkan bahan non-logam meliputi polimer atau plastik, keramik, dan material komposit."
        },
        {
          title: "Bab 2: Sifat Mekanik",
          content: "Bab 2. Sifat Mekanik Bahan. Sifat mekanik menunjukkan kemampuan suatu bahan dalam menerima beban atau gaya tanpa mengalami kerusakan. Beberapa sifat mekanik yang penting dalam teknik mesin antara lain kekerasan yaitu ketahanan terhadap goresan, keuletan yaitu kemampuan bahan untuk diregangkan tanpa patah, serta kekuatan tarik yaitu batas maksimal gaya tegangan yang bisa ditahan oleh material."
        }
      ]
    },
    { 
      title: "K3LH", 
      category: "Modul Ajar", 
      color: "#10b981", 
      link: "https://drive.google.com/file/d/1iE0zBUCvueyqHPLfMWUZj7e6AuX-IuOD/preview",
      chapters: [
        {
          title: "Bab 1: Pengantar K3",
          content: "Bab 1. Pengantar K3 di Bengkel. Keselamatan dan Kesehatan Kerja adalah prioritas utama sebelum memulai aktivitas permesinan. Setiap operator wajib memahami prosedur standar keselamatan dan selalu menggunakan Alat Pelindung Diri seperti kacamata safety, sepatu pelindung, dan sarung tangan saat diperlukan, untuk mencegah terjadinya kecelakaan fatal."
        },
        {
          title: "Bab 2: Prosedur Darurat",
          content: "Bab 2. Prosedur Keadaan Darurat. Dalam situasi darurat seperti kebakaran atau kecelakaan kerja, pekerja harus tetap tenang dan mengikuti jalur evakuasi yang telah ditentukan. Sangat penting untuk mengetahui letak alat pemadam api ringan atau APAR dan kotak Pertolongan Pertama Pada Kecelakaan di area bengkel."
        }
      ]
    },
  ];

  const modulesSem2 = [
    { 
      title: "Dasar Sistem Mekanik", 
      category: "Modul Ajar", 
      color: "#8b5cf6", 
      link: "https://drive.google.com/file/d/1KwFeKl1GWs5io3sbDhRuWx6tkRvz0Cgv/preview",
      chapters: [
        {
          title: "Bab 1: Gaya & Torsi",
          content: "Bab 1. Gaya dan Torsi. Dalam ilmu mekanika, gaya adalah dorongan atau tarikan yang dapat menyebabkan benda bermassa mengubah kecepatannya. Sedangkan torsi atau momen gaya adalah ukuran keefektifan sebuah gaya dalam menghasilkan putaran pada suatu poros. Memahami gaya dan torsi sangat esensial dalam perancangan elemen mesin."
        },
        {
          title: "Bab 2: Transmisi Tenaga",
          content: "Bab 2. Transmisi Tenaga. Sistem transmisi tenaga berfungsi untuk memindahkan daya dan putaran dari sumber penggerak ke mesin yang digerakkan. Beberapa komponen transmisi yang umum digunakan di industri meliputi sistem roda gigi untuk tenaga besar, sabuk atau belt untuk jarak poros menengah, serta sistem rantai yang menjamin tidak adanya slip."
        }
      ]
    },
    { 
      title: "Teknik Dasar Produksi Bidang Manufaktur", 
      category: "Modul Ajar", 
      color: "#f59e0b", 
      link: "https://drive.google.com/file/d/12iOEr5-8D2qSnWZCMnGl0-NcFK3-eEY2/preview",
      chapters: [
        {
          title: "Bab 1: Pengecoran",
          content: "Bab 1. Proses Pengecoran dan Pembentukan Logam. Pengecoran adalah proses manufaktur di mana logam cair dituangkan ke dalam cetakan yang memiliki rongga sesuai bentuk yang diinginkan, kemudian dibiarkan membeku. Sedangkan pembentukan atau forming adalah proses mengubah bentuk logam padat menggunakan gaya tekan yang tinggi, seperti pada proses tempa."
        },
        {
          title: "Bab 2: Pemesinan",
          content: "Bab 2. Proses Pemesinan Dasar. Proses pemesinan adalah metode pemotongan material secara presisi menggunakan mesin perkakas. Proses utama meliputi mesin bubut untuk membuat benda silindris, mesin frais atau milling untuk permukaan datar dan profil kompleks, serta mesin bor untuk membuat lubang. Setiap proses memerlukan perhitungan kecepatan potong yang spesifik."
        }
      ]
    },
  ];

  const toggleAudio = (text, chapterIdx) => {
    if (!window.speechSynthesis) return;
    
    if (isPlaying && activeChapter === chapterIdx) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveChapter(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setActiveChapter(null);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveChapter(null);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setActiveChapter(chapterIdx);
    }
  };

  const openModule = (mod) => {
    setSelectedModule(mod);
  };

  const closeModule = () => {
    setSelectedModule(null);
    setActiveChapter(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 12px', borderRadius: '20px', color: 'var(--game-primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <span>🏛️ SMK NEGERI 2 DEPOK SLEMAN</span> • <span>KURIKULUM DEEP LEARNING</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📚 Perpustakaan & Modul Ajar Digital</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            Pusat literatur pembelajaran vokasi resmi: Buku Ajar Digital 3D Interaktif (50 Halaman Lengkap) & Modul Ajar Kurikulum Deep Learning untuk Program Keahlian Teknik Mesin & Fabrikasi Logam.
          </p>
        </div>
      </div>

      {/* 🌟 FEATURED SECTION: BUKU DIGITAL INTERAKTIF 3D */}
      {(activeTab === 'all' || activeTab === 'books') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🌟</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Koleksi Unggulan: Buku Digital 3D (Kurikulum Deep Learning)
            </h3>
            <span style={{ background: 'linear-gradient(135deg, #0284c7, #10b981)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
              50 HALAMAN LENGKAP
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            {digitalBooks.map((book) => (
              <div 
                key={book.id}
                className="dashboard-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: `2px solid ${book.color}40`,
                  background: 'linear-gradient(145deg, var(--bg-card), rgba(15, 23, 42, 0.95))',
                  display: 'flex',
                  gap: '20px',
                  boxShadow: `0 10px 30px ${book.color}15`,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Cover Accent */}
                <div style={{ width: '130px', minWidth: '130px', height: '185px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', border: `1px solid ${book.color}50`, position: 'relative' }}>
                  <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '6px 4px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
                    3D FLIP BOOK
                  </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ background: `${book.color}20`, color: book.color, border: `1px solid ${book.color}40`, padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                        {book.badge}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {book.subtitle}
                      </span>
                    </div>

                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.3 }}>
                      {book.title}
                    </h4>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.45, margin: 0, marginBottom: '10px' }}>
                      {book.desc}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openModule(book)}
                      style={{
                        flex: 1,
                        minWidth: '160px',
                        padding: '10px 16px',
                        background: `linear-gradient(135deg, ${book.color}, ${book.color}dd)`,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: `0 4px 14px ${book.color}40`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>📖 Baca di Sini (3D)</span>
                    </button>

                    <button
                      onClick={() => window.open(book.link, '_blank')}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Buka Buku di Tab Baru / Fullscreen"
                    >
                      <span>↗️ Layar Penuh</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: '⭐ Semua Koleksi', count: digitalBooks.length + modulesSem1.length + modulesSem2.length },
          { id: 'books', label: '📖 Buku Digital 3D (TFLM & TP)', count: digitalBooks.length },
          { id: 'sem1', label: 'Modul Semester 1', count: modulesSem1.length + 2 },
          { id: 'sem2', label: 'Modul Semester 2', count: modulesSem2.length + 2 }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px',
              background: activeTab === tab.id ? 'var(--game-primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border-light)',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 4px 10px rgba(245, 158, 11, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: '0.72rem', background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '10px' }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* STANDARD MODULES SECTION */}
      {activeTab !== 'books' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {activeTab === 'sem1' ? 'Modul Pembelajaran Semester 1' : activeTab === 'sem2' ? 'Modul Pembelajaran Semester 2' : 'Daftar Modul Ajar Terstruktur'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Show digital books in semester tabs as well */}
            {(activeTab === 'sem1' || activeTab === 'sem2' || activeTab === 'all') && digitalBooks.map((book) => (
              <div 
                key={`grid-${book.id}`}
                className="dashboard-card" 
                onClick={() => openModule(book)}
                style={{ 
                  padding: '24px', 
                  borderTop: `4px solid ${book.color}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📖</div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{book.title}</h4>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ background: `${book.color}18`, color: book.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {book.badge}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>
                  {book.desc.slice(0, 95)}...
                </p>
              </div>
            ))}

            {/* Standard PDF modules */}
            {(activeTab === 'all' || activeTab === 'sem1') && modulesSem1.map((mod, i) => (
              <div 
                key={`sem1-${i}`} 
                className="dashboard-card" 
                onClick={() => openModule(mod)}
                style={{ 
                  padding: '24px', 
                  borderTop: `4px solid ${mod.color}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📘</div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{mod.title}</h4>
                <span style={{ background: `${mod.color}15`, color: mod.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {mod.category} • Semester 1
                </span>
              </div>
            ))}

            {(activeTab === 'all' || activeTab === 'sem2') && modulesSem2.map((mod, i) => (
              <div 
                key={`sem2-${i}`} 
                className="dashboard-card" 
                onClick={() => openModule(mod)}
                style={{ 
                  padding: '24px', 
                  borderTop: `4px solid ${mod.color}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📗</div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{mod.title}</h4>
                <span style={{ background: `${mod.color}15`, color: mod.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {mod.category} • Semester 2
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POPUP / MODAL VIEWER (IFRAME FLIPBOOK / PDF) */}
      {selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.82)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(6px)',
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            background: 'var(--bg-game)',
            width: '96%',
            maxWidth: '1400px',
            height: '94%',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            border: '1px solid var(--border-light)'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '14px 20px', 
              background: 'var(--bg-sidebar)', 
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.4rem' }}>{selectedModule.isFlipbook ? '📖' : '📘'}</span>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {selectedModule.title}
                    </h3>
                    {selectedModule.subtitle && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedModule.subtitle}</div>
                    )}
                  </div>
                  {selectedModule.isFlipbook && (
                    <span style={{ fontSize: '0.72rem', background: 'linear-gradient(135deg, #0284c7, #10b981)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                      3D FLIP BOOK INTERAKTIF (50 HAL)
                    </span>
                  )}
                  {isPlaying && (
                    <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      🔊 Sedang Membaca...
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => window.open(selectedModule.link, '_blank')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--game-primary)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                    title="Buka di tab browser baru untuk layar penuh"
                  >
                    <span>↗️ Buka Fullscreen</span>
                  </button>

                  <button 
                    onClick={closeModule}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    title="Tutup Modal"
                  >
                    ✖
                  </button>
                </div>
              </div>

              {/* Audio Controls for Chapters */}
              {selectedModule.chapters && selectedModule.chapters.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
                    🔊 Audio Ringkasan Bab:
                  </span>
                  {selectedModule.chapters.map((chapter, idx) => {
                    const isActive = isPlaying && activeChapter === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleAudio(chapter.content, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                          color: isActive ? '#ef4444' : 'var(--text-main)',
                          border: `1px solid ${isActive ? '#ef4444' : 'var(--border-light)'}`,
                          borderRadius: '16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '0.78rem'
                        }}
                      >
                        <span>{isActive ? '⏹' : '▶️'}</span>
                        {chapter.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Modal Body / Iframe */}
            <div style={{ flex: 1, background: '#09121d', position: 'relative' }}>
              <iframe 
                src={selectedModule.link} 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
                title={selectedModule.title}
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModulesView;
