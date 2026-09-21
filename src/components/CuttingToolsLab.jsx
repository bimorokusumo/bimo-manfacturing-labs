import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';
import { recordQuizResult } from '../services/sheetService';
import LabDiagnosticBanner from './LabDiagnosticBanner';

// =============================================================================
// DATABASE 9 ALAT PEMOTONG (FOTO REALISTIS, ANATOMI, SPESIFIKASI & SOP NYATA)
// =============================================================================
const CUTTING_TOOLS_DATA = [
  {
    id: 'gerinda-tangan',
    nama: 'Gerinda Tangan (Angle Grinder)',
    namaEng: 'Electric Angle Grinder 4" / 100mm',
    kategori: 'Perkakas Tangan Bertenaga',
    kategoriKey: 'portable',
    badge: '220V AC • Portable Power Tool',
    deskripsiSingkat: 'Perkakas tangan bertenaga listrik berputar kecepatan tinggi untuk memotong pelat baja, pipa, meratakan kampuh las, dan menghaluskan permukaan logam.',
    deskripsiLengkap: 'Mesin gerinda tangan (angle grinder) adalah salah satu perkakas tangan bertenaga paling vital di bengkel pemesinan dan fabrikasi. Alat ini menggunakan motor listrik universal berkecepatan tinggi (10.000 - 12.000 RPM) yang mentransmisikan daya melalui bevel gear sudut 90 derajat menuju spindel batu gerinda. Dengan mengganti jenis piringan (batu potong tipis 1.2mm, batu gerinda asah 6mm, flap disc amplas, atau sikat kawat baja), gerinda tangan dapat digunakan untuk memotong profil baja, membuang terak las (slag), chamfering tepi tajam, hingga finishing permukaan.',
    prinsipKerja: 'Pemotongan terjadi melalui proses abrasi berkecepatan tinggi (friksi butiran abrasif Aluminium Oksida atau Silikon Karbida yang diikat resin) pada kecepatan keliling mencapai 80 m/s. Butiran abrasif mikroskopis mengikis logam menjadi partikel debu halus dan percikan bunga api pijar.',
    images: [
      {
        url: '/assets/images/cutting_tools/gerinda_tangan.jpg',
        title: 'Tampak Utama di Meja Kerja Bengkel',
        desc: 'Unit gerinda tangan 4 inci dengan batu potong terpasang, pelindung keselamatan (wheel guard), kabel grounding, dan benda kerja profil baja.'
      }
    ],
    spesifikasi: [
      { label: 'Daya Input Motor', value: '670 - 850 Watt' },
      { label: 'Kecepatan Tanpa Beban', value: '11.000 - 12.000 RPM' },
      { label: 'Diameter Batu Gerinda', value: '100 mm (4 inci)' },
      { label: 'Diameter Lubang Spindel', value: '16 mm (Ulir M10 x 1.5)' },
      { label: 'Ketebalan Batu Potong', value: '1.0 - 1.2 mm (Cutting Disc)' },
      { label: 'Ketebalan Batu Asah', value: '6.0 mm (Grinding Wheel)' },
      { label: 'Kecepatan Keliling Maks.', value: '80 m/s (4800 m/min)' },
      { label: 'Berat Bersih Alat', value: '± 1.8 kg' }
    ],
    komponen: [
      { no: '01', nama: 'Spindle Lock Button', desc: 'Tombol pengunci poros spindel untuk mempermudah pelepasan dan pengencangan batu gerinda menggunakan kunci pas pin khusus (pin spanner).', pinPos: { x: 34, y: 42 }, lokasiFisik: 'Tombol hitam di atas rumah roda gigi logam (gearbox) kepala gerinda' },
      { no: '02', nama: 'Wheel Safety Guard (Pelindung Roda)', desc: 'Tudung baja kokoh penutup setengah lingkaran batu gerinda untuk mengarahkan percikan api pijar menjauhi operator dan menahan serpihan jika batu pecah.', pinPos: { x: 35, y: 70 }, lokasiFisik: 'Tudung baja hitam setengah lingkaran penutup batu potong di bawah kepala gerinda' },
      { no: '03', nama: 'Auxiliary Handle (Gagang Samping)', desc: 'Gagang samping ergonomis yang dapat dipasang di sisi kiri atau kanan bodi untuk stabilitas kontrol dua tangan selama pemotongan berat.', pinPos: { x: 30, y: 55 }, lokasiFisik: 'Gagang hitam silindris yang terpasang menonjol di samping kiri rumah roda gigi' },
      { no: '04', nama: 'Switch On/Off & Safety Lock', desc: 'Saklar geser dengan pengunci kontinu. Memungkinkan alat beroperasi stabil dan dapat dimatikan seketika saat darurat.', pinPos: { x: 43, y: 51 }, lokasiFisik: 'Saklar geser hitam di bodi samping oranye dekat sambungan kepala' },
      { no: '05', nama: 'Flens Penjepit (Inner & Outer Flange)', desc: 'Dua ring baja presisi yang menjepit batu gerinda pada spindel ulir dengan torsi pengencangan seimbang agar tidak slip atau oleng.', pinPos: { x: 21, y: 63 }, lokasiFisik: 'Cincin mur penjepit di titik pusat piringan batu potong' },
      { no: '06', nama: 'Lubang Ventilasi Pendingin Motor', desc: 'Kisi-kisi saluran udara tempat kipas internal meniupkan udara dingin melewati armature stator untuk mencegah motor overheat.', pinPos: { x: 61, y: 53 }, lokasiFisik: 'Kisi-kisi celah udara bergaris pada bodi oranye sebelum gagang pegangan' }
    ],
    bendaKerja: ['Pipa hollow baja ringan / tebal', 'Pelat strip & siku (Angle Bar ST37)', 'Besi beton ulir / polos', 'Kampuh sambungan las (bead joint)', 'Baja stainless (menggunakan INOX disc)'],
    sopKerja: [
      'Lakukan "Ring Test" pada batu gerinda baru: ketuk pelan dengan tangkai obeng kayu; bunyi denting jernih menandakan batu utuh tanpa retak internal.',
      'Pasang wheel guard pada sudut yang mengarahkan percikan bunga api ke bawah atau menjauhi badan dan bahan mudah terbakar.',
      'Kencangkan batu gerinda menggunakan kunci pin asli, jangan memukul flens dengan palu atau pahat.',
      'Jepit benda kerja dengan kokoh pada ragum meja. Jangan pernah menginjak atau memegang benda kerja dengan tangan saat digerinda!',
      'Nyalakan mesin dan biarkan berputar stabil 1 menit sebelum menyentuh benda kerja untuk mendeteksi getaran abnormal.',
      'Untuk memotong: jaga sudut tegak lurus 90° terhadap bidang potong. Jangan menekan terlalu kuat ke samping (batu tipis rawan pecah karena gaya puntir/torsional).'
    ],
    k3Penting: [
      'Wajib kacamata pelindung (Safety Goggles ANSI Z87.1) dan Face Shield transparan.',
      'DILARANG melepas pelindung roda (wheel guard) dalam kondisi apapun saat operasional!',
      'Gunakan sarung tangan kulit las dan celemek kulit (leather apron) penahan bunga api.',
      'Pastikan area kerja radius 5 meter bebas dari tiner, solar, gemuk, kain majun, atau gas mudah meledak.',
      'Tunggu putaran spindel berhenti total sebelum meletakkan gerinda di atas meja kerja.'
    ]
  },
  {
    id: 'gerinda-potong',
    nama: 'Gerinda Potong (Chop Saw / Cut-Off Saw)',
    namaEng: 'Abrasive Cut-Off Machine 14" / 355mm',
    kategori: 'Perkakas Tangan Bertenaga',
    kategoriKey: 'portable',
    badge: '220V AC • Heavy Duty Cut-Off',
    deskripsiSingkat: 'Mesin potong stasioner dengan batu potong abrasif 14 inci bertenaga besar untuk pemotongan cepat profil baja, pipa tebal, UNP, siku, dan besi pejal.',
    deskripsiLengkap: 'Mesin gerinda potong (Chop Saw / Cut-Off Saw) adalah mesin potong stasioner meja yang menggunakan piringan potong abrasif berdiameter besar 355 mm (14 inci). Digerakkan oleh motor listrik bertenaga 2000 - 2400 Watt dengan sistem engsel pivot turun (chop action). Mesin ini dilengkapi ragum jepit miter terintegrasi yang dapat disetel sudut potongnya dari 0° hingga 45°. Chop saw adalah tulang punggung di bengkel fabrikasi logam untuk memotong stok panjang profil baja struktural menjadi ukuran siap rakit sebelum proses pengelasan.',
    prinsipKerja: 'Operator menurunkan tuas kepala motor berputar ke arah benda kerja yang dijepit di ragum landasan. Batu abrasif berkecepatan 3800 RPM menggesek material baja dengan tekanan vertikal stabil, menghasilkan potongan lurus yang bersih dengan bantuan gravitasi dan gaya tekan manual.',
    images: [
      {
        url: '/assets/images/cutting_tools/gerinda_potong.jpg',
        title: 'Tampak Nyata Mesin Potong Chop Saw 14 Inci',
        desc: 'Mesin gerinda potong industri dengan batu 355mm, pelindung berengsel, tuas tekan D-Handle, dan ragum miter pengunci cepat.'
      }
    ],
    spesifikasi: [
      { label: 'Daya Listrik Motor', value: '2.000 - 2.400 Watt' },
      { label: 'Kecepatan Putar Spindel', value: '3.800 - 4.000 RPM' },
      { label: 'Diameter Batu Potong', value: '355 mm (14 inci)' },
      { label: 'Diameter Lubang Arbor', value: '25.4 mm (1 inci)' },
      { label: 'Kapasitas Potong Pipa Bulat', value: 'Ø 127 mm (pada 90°)' },
      { label: 'Kapasitas Potong Baja Siku', value: '110 x 110 mm' },
      { label: 'Sudut Ragum Miter', value: '0° s.d. 45° (Kiri & Kanan)' },
      { label: 'Berat Keseluruhan Unit', value: '± 16 - 18 kg' }
    ],
    komponen: [
      { no: '01', nama: 'D-Handle dengan Trigger & Safety Switch', desc: 'Gagang pegangan ergonomis bentuk huruf D dengan saklar tombol pemicu dan tombol pengunci pengaman ganda untuk mencegah mesin menyala tidak sengaja.', pinPos: { x: 56, y: 23 }, lokasiFisik: 'Gagang atas bentuk D yang dipegang tangan operator untuk menekan mesin turun' },
      { no: '02', nama: 'Retractable Spark Wheel Guard', desc: 'Pelindung batu baja kokoh dengan bagian bawah berengsel yang otomatis membuka saat pisau turun menyentuh benda kerja dan menutup kembali saat kepala diangkat.', pinPos: { x: 63, y: 37 }, lokasiFisik: 'Kap pelindung lengkung oranye besar di sekeliling piringan potong 14 inci' },
      { no: '03', nama: 'Quick-Release Vise (Ragum Cepat)', desc: 'Ragum penjepit benda kerja dengan tuas ulir acme dan pengunci mur geser cepat (quick release nut) untuk mencekam profil pipa atau siku dengan sangat kokoh.', pinPos: { x: 68, y: 70 }, lokasiFisik: 'Ragum dengan ulir acme dan engkol putar di meja landasan bawah' },
      { no: '04', nama: 'Miter Gauge Angle Scale', desc: 'Skala busur derajat sudut potong (0° hingga 45°) pada rahang belakang ragum untuk pemotongan siku miter presisi.', pinPos: { x: 52, y: 63 }, lokasiFisik: 'Pelat skala busur derajat di rahang belakang ragum bawah' },
      { no: '05', nama: 'Spark Deflector Plate', desc: 'Pelat deflektor di belakang roda untuk membelokkan lontaran partikel bunga api ke bawah lantai bengkel dan mencegah kerusakan kabel motor.', pinPos: { x: 35, y: 57 }, lokasiFisik: 'Pelat penahan percikan api di belakang bawah piringan potong' },
      { no: '06', nama: 'Heavy Duty Pressed Steel Base', desc: 'Meja landasan baja tebal berbobot berat dengan lubang baut pondasi meja untuk meminimalisir getaran resonansi saat memotong.', pinPos: { x: 46, y: 82 }, lokasiFisik: 'Meja landasan tapak pelat baja hitam tebal di bagian paling bawah mesin' }
    ],
    bendaKerja: ['Pipa baja seamless SCH 40', 'Profil kanal UNP & CNP', 'Baja siku sudut (Angle Iron L 50x50)', 'Pipa kotak hollow 40x40 / 50x100', 'Besi poros as pejal ST37 / S45C'],
    sopKerja: [
      'Periksa kondisi fisik piringan abrasif 14": pastikan tidak sumbing, gompal, atau kadaluarsa (lihat tahun kedaluwarsa pada ring tengah).',
      'Atur sudut ragum sesuai gambar kerja (90° lurus atau sudut miter 45°).',
      'Posisikan benda kerja panjang dengan penopang rol (roller stand) agar benda kerja tidak melorot atau menjepit batu potong saat putus.',
      'Kencangkan engkol ragum sekuat mungkin; pastikan profil pipa tidak goyang atau tergelincir.',
      'Tarik trigger saklar hingga putaran motor mencapai kecepatan maksimum (sekitar 3 detik) sebelum menurunkan batu potong.',
      'Tekan tuas potong dengan ritme konstan: jangan memaksakan tenaga terlalu liar yang membuat RPM drop drastis dan membakar motor.',
      'Setelah potongan putus, angkat tuas ke atas dan lepas saklar pemicu hingga batu berhenti berputar total.'
    ],
    k3Penting: [
      'Wajib menggunakan pelindung pendengaran (Ear Muff / Ear Plug) karena kebisingan potong mencapai > 95 dB.',
      'Gunakan pelindung mata dan face shield penuh untuk menahan hempasan bunga api berkecepatan tinggi.',
      'Dilarang berdiri tepat segaris dengan putaran batu (berdirilah agak condong di samping kiri gagang).',
      'Benda kerja yang baru dipotong sangat panas (> 300°C); selalu gunakan sarung tangan kulit atau tang jepit untuk mengambil benda hasil potong.'
    ]
  },
  {
    id: 'bor-bangku',
    nama: 'Mesin Bor Bangku (Bench Drill Press)',
    namaEng: 'Stationary Bench Drill Press Machine',
    kategori: 'Mesin Pembuat Lubang & Chamfering',
    kategoriKey: 'drilling',
    badge: 'Mesin Bengkel Stasioner • Multi-Speed Pulley',
    deskripsiSingkat: 'Mesin bor tegak stasioner yang dipasang di atas meja kerja bengkel untuk melubangi logam dengan kepresisian tinggi, sumbu spindel tegak lurus sempurna, dan kedalaman terkontrol.',
    deskripsiLengkap: 'Mesin bor bangku (Bench Drill Press) adalah mesin perkakas standar yang wajib ada di setiap bengkel pemesinan SMK dan industri manufaktur. Berbeda dari bor tangan portabel yang mengandalkan kestabilan tangan operator, bor bangku memiliki tiang kolom baja pejal dan kepala spindel kaku yang menjamin lubang hasil pengeboran tegak lurus tepat 90 derajat terhadap permukaan meja kerja. Mesin ini memiliki sistem transmisi puli bertingkat (step pulley) berpita V-belt di bagian atas kepala untuk mengatur putaran spindel (RPM) sesuai diameter mata bor dan jenis material logam.',
    prinsipKerja: 'Motor listrik memutar sabuk V-belt pada rasio puli bertingkat tertentu untuk menghasilkan putaran spindel N (RPM). Spindel menggerakkan chuck yang mencekam mata bor pilin (twist drill bit). Operator memutar tuas roda bintang 3 cabang (star feed lever) untuk mengumpankan mata bor secara vertikal masuk ke benda kerja yang dicekam kuat pada ragum mesin.',
    images: [
      {
        url: '/assets/images/cutting_tools/bor_bangku.jpg',
        title: 'Tampak Asli Mesin Bor Bangku Bengkel SMK',
        desc: 'Mesin bor bangku presisi lengkap dengan ragum bor meja (drill vise), mata bor pilin HSS terpasang di chuck, penutup puli atas, dan tatal gram pengeboran.'
      }
    ],
    spesifikasi: [
      { label: 'Daya Motor Penggerak', value: '375 - 750 Watt (1/2 s.d. 1 HP)' },
      { label: 'Kapasitas Cekam Chuck', value: '1.5 - 13 mm / 16 mm (JT33 / B16)' },
      { label: 'Tingkat Kecepatan Puli', value: '5 s.d. 16 Tingkat (250 - 3000 RPM)' },
      { label: 'Langkah Spindel Maks.', value: '60 - 85 mm (Spindle Stroke)' },
      { label: 'Jarak Spindel ke Tiang', value: '130 - 180 mm (Swing distance)' },
      { label: 'Ukuran Meja Kerja', value: '200 x 200 mm (Beralur T-Slot)' },
      { label: 'Kemiringan Meja Kerja', value: '0° s.d. 45° (Tilt Left/Right)' },
      { label: 'Koneksi Tirus Spindel', value: 'Morse Taper MT2 / MT3' }
    ],
    komponen: [
      { no: '01', nama: 'Pulley & Belt Transmission Box', desc: 'Rumah penutup transmisi di bagian atas dengan tabel diagram kecepatan RPM. Berisi 2 atau 3 susun puli bertingkat aluminium dan sabuk V-belt karet.', pinPos: { x: 44, y: 6 }, lokasiFisik: 'Kotak penutup atas tempat susunan puli bertingkat dan sabuk V-belt pemindah putaran' },
      { no: '02', nama: 'Depth Gauge Stop Collar (Pengatur Kedalaman)', desc: 'Skala milimeter dan mur pengunci pembatas langkah turun spindel untuk membuat lubang buntu (blind holes) dengan kedalaman presisi seragam.', pinPos: { x: 55, y: 22 }, lokasiFisik: 'Mistar skala milimeter vertikal dengan baut pembatas di depan kepala mesin' },
      { no: '03', nama: 'Three-Spoke Feed Handle (Tuas Bintang)', desc: 'Tiga tuas kemudi bergagang bundar untuk menggerakkan poros rack and pinion spindel turun masuk ke benda kerja dengan kontrol kepekaan tangan operator.', pinPos: { x: 67, y: 24 }, lokasiFisik: 'Tuas kemudi roda bintang berkepala bulat hitam yang dipegang tangan operator' },
      { no: '04', nama: 'Keyed Drill Chuck (Cekam Bor)', desc: 'Kepala cekam 3 rahang (three-jaw chuck) berbahan baja paduan yang dikencangkan menggunakan kunci chuck (chuck key) untuk mencengkeram tangkai silindris mata bor.', pinPos: { x: 53, y: 50 }, lokasiFisik: 'Kepala cekam silindris hitam di ujung poros spindel penancap mata bor' },
      { no: '05', nama: 'Adjustable Work Table (Meja Kerja)', desc: 'Meja besi cor dengan alur baut T untuk mengikat ragum mesin. Ketinggian meja dapat dinaik-turunkan melalui tuas engkol rack-pinion dan dikunci baut klem tiang.', pinPos: { x: 52, y: 76 }, lokasiFisik: 'Meja besi beralur T tempat ragum menjepit benda kerja balok baja' },
      { no: '06', nama: 'Solid Steel Column & Heavy Base', desc: 'Kolom tabung baja bulat tebal yang menopang seluruh struktur kepala mesin dan meja kerja di atas landasan tapak besi cor berbobot stabil.', pinPos: { x: 39, y: 62 }, lokasiFisik: 'Tiang silinder tabung baja vertikal kokoh penyangga seluruh mesin' }
    ],
    bendaKerja: ['Pelat baja konstruksi tebal 2 - 30 mm', 'Blok mesin aluminium & besi cor (Cast Iron)', 'Poros silindris (menggunakan V-Block)', 'Benda kerja persiapan lubang tap ulir dalam', 'Profil hollow & siku rangka mekanik'],
    sopKerja: [
      'Gunakan penitik pusat (center punch) dan palu untuk membuat titik awam pemandu ujung mata bor agar tidak bergeser meleset saat mulai berputar.',
      'Hitung putaran spindle yang benar dengan rumus: N = (1000 x Cs) / (π x d). Pindahkan posisi V-belt pada susunan puli sesuai angka RPM yang didapat.',
      'Wajib jepit benda kerja pada ragum bor mesin (drill press vise) dan ikat ragum pada alur meja beralur T menggunakan baut klem!',
      'Lepaskan KUNCI CHUCK (chuck key) dari kepala cekam segera setelah mengencangkan mata bor. Jangan pernah tinggalkan kunci menempel!',
      'Gunakan cairan pendingin (coolant / dromus oil) saat mengebor baja untuk menjaga ketajaman mata bor dan melumasi keluarnya tatal/chip.',
      'Untuk diameter besar (> 10mm), lakukan pengeboran bertahap (pilot hole) dimulai dari mata bor diameter 4-5mm terlebih dahulu.'
    ],
    k3Penting: [
      'DILARANG KERAS MENGGUNAKAN SARUNG TANGAN KAIN saat mengoperasikan mesin bor! Kain sarung tangan dapat tersangkut dan tergulung oleh spindel putar, menyebabkan fraktur jari atau amputasi.',
      'Rambut panjang wajib diikat rapi dan dimasukkan ke dalam topi kerja; lepaskan jam tangan, kalung, dan baju lengan panjang yang kedodoran.',
      'Wajib kacamata pengaman untuk melindungi mata dari tatal gram spiral yang terlempar.',
      'DILARANG membersihkan tatal gram menggunakan tangan telanjang saat mata bor berputar; gunakan kuas pembersih setelah mesin mati.'
    ]
  },
  {
    id: 'bor-tangan',
    nama: 'Mesin Bor Tangan (Hand Drill / Cordless Drill)',
    namaEng: 'Electric Corded & Cordless Power Drill',
    kategori: 'Perkakas Tangan Bertenaga',
    kategoriKey: 'portable',
    badge: 'Baterai Li-Ion / 220V • Portable High Flexibility',
    deskripsiSingkat: 'Perkakas tangan bertenaga portabel (kabel atau nirkabel baterai) untuk membuat lubang pada lokasi yang fleksibel, sempit, dan tidak dapat dijangkau oleh mesin bor stasioner.',
    deskripsiLengkap: 'Mesin bor tangan (Portable Hand Drill / Cordless Drill Driver) adalah perkakas paling serbaguna di lapangan bengkel dan instalasi industri. Tersedia dalam varian berkabel colok 220V untuk pekerjaan berat kontinu, maupun bertenaga baterai lithium-ion 18V-20V tanpa kabel (cordless). Mesin modern dilengkapi chuck tanpa kunci (keyless chuck), pengatur torsi mekanik (clutch ring), dua percepatan mekanis (low gear torsi besar untuk mata bor besar/sekrup, high gear untuk mata bor kecil kecepatan tinggi), serta pemicu putaran variabel (variable speed trigger) dan pembalik arah putar (reverse forward switch).',
    prinsipKerja: 'Motor DC tanpa sikat (Brushless Motor) atau motor AC universal menggerakkan planetary gear set untuk melipatgandakan torsi. Putaran disalurkan ke keyless chuck yang mencengkeram mata bor. Kecepatan putaran diatur secara presisi oleh kedalaman tarikan jari telunjuk operator pada saklar pemicu elektronik PWM.',
    images: [
      {
        url: '/assets/images/cutting_tools/bor_tangan.jpg',
        title: 'Tampak Asli Mesin Bor Tangan Portabel',
        desc: 'Mesin bor tangan nirkabel (cordless drill) dengan keyless chuck baja, selektor torsi bertingkat, bodi ergonomis berlapis karet, dan baterai Li-Ion.'
      },
      {
        url: '/assets/images/cutting_tools/bor_tangan_alt.jpg',
        title: 'Unit Cordless Drill dengan Bit Holder',
        desc: 'Tampilan sudut kerja mesin bor tangan baterai siap pakai lengkap dengan mata obeng dan mata bor HSS.'
      }
    ],
    spesifikasi: [
      { label: 'Tegangan Baterai / Listrik', value: '18V - 20V Max Li-Ion / 220V AC 550W' },
      { label: 'Kapasitas Chuck', value: '0.8 - 10 mm / 13 mm (Keyless Ratchet)' },
      { label: 'Torsi Maksimum', value: '50 - 75 Nm' },
      { label: 'Kecepatan Gigi 1 (Low)', value: '0 - 450 RPM (Torsi Tinggi)' },
      { label: 'Kecepatan Gigi 2 (High)', value: '0 - 1.800 RPM (Pengeboran Cepat)' },
      { label: 'Kapasitas Bor pada Baja', value: 'Maks. Ø 13 mm' },
      { label: 'Kapasitas Bor pada Kayu', value: 'Maks. Ø 38 mm' },
      { label: 'Penyetelan Torsi (Clutch)', value: '15 s.d. 24 Tingkat + Drill Mode' }
    ],
    komponen: [
      { no: '01', nama: 'Keyless Ratcheting Chuck', desc: 'Kepala cekam putar tangan tanpa kunci. Cukup putar selongsong luar dengan tangan untuk mengunci mata bor dengan mekanisme klik pengunci rapat.', pinPos: { x: 38, y: 37 }, lokasiFisik: 'Moncong silindris paling depan penjepit mata bor putar tangan tanpa kunci' },
      { no: '02', nama: 'Torque Adjustment Collar', desc: 'Cincin putar pengatur slip torsi (1 s.d. 20) untuk mencegah kepala baut aus/rusak saat penyekrupan, serta ikon bor (Drill Mode) untuk daya torsi penuh tanpa slip saat mengebor logam.', pinPos: { x: 46, y: 38 }, lokasiFisik: 'Cincin putar kerah berangka pengatur batas torsi tepat di belakang cekam' },
      { no: '03', nama: 'Dual-Speed Mechanical Gearbox Switch', desc: 'Tuas geser atas untuk memilih gigi 1 (putaran lambat tenaga besar) atau gigi 2 (putaran cepat untuk mata bor kecil).', pinPos: { x: 54, y: 33 }, lokasiFisik: 'Tombol geser selektor gigi kecepatan mekanik di bagian punggung atas mesin' },
      { no: '04', nama: 'Variable Speed Trigger & Reverse Switch', desc: 'Pelatuk saklar yang mengatur kecepatan sesuai kedalaman tekanan jari, dipadukan tombol geser jempol untuk arah putar kanan (forward) atau kiri (reverse).', pinPos: { x: 47, y: 51 }, lokasiFisik: 'Pelatuk jari telunjuk saklar On/Off kecepatan dan tombol pembalik arah putar' },
      { no: '05', nama: 'Integrated LED Worklight', desc: 'Lampu LED putih terang di atas dudukan baterai yang otomatis menyala menerangi titik pengeboran pada sudut sempit atau remang.', pinPos: { x: 47, y: 73 }, lokasiFisik: 'Lampu LED kecil di atas dudukan baterai yang menembak cahaya ke arah mata bor' },
      { no: '06', nama: 'Ergonomic Rubber Soft-Grip Handle', desc: 'Pegangan berbentuk gagang pistol dengan lapisan karet bertekstur peredam getaran dan anti selip saat tangan berkeringat.', pinPos: { x: 50, y: 64 }, lokasiFisik: 'Gagang pistol pegangan tangan utama dilapisi karet lembut hitam anti-selip' }
    ],
    bendaKerja: ['Rangka bodi mobil / sasis karoseri', 'Pemasangan pelat penutup panel listrik', 'Pengeboran profil baja di tempat proyek (on-site)', 'Pengeboran lubang tembus paku keling (blind rivet)', 'Pemasangan baut baut self-drilling screw (roofing)'],
    sopKerja: [
      'Gunakan penitik pusat untuk memberi umpan takik agar ujung mata bor tidak tergelincir menggores benda kerja.',
      'Posisikan bor benar-benar tegak lurus (90°) terhadap permukaan material: jika posisi miring, mata bor diameter kecil (< 4mm) akan patah seketika.',
      'Gunakan kecepatan rendah di awal pengeboran hingga bibir potong mata bor mulai menggigit material logam, lalu tingkatkan kecepatan secara teratur.',
      'Terapkan tekanan dorong tubuh yang stabil searah sumbu bor: jangan mengungkit atau mengayunkan mesin ke samping.',
      'Saat mata bor hampir menembus sisi bawah pelat logam (titik kritis breakthrough), kurangi tekanan dorong untuk mencegah mata bor terjepit dan terpuntir (snagging).',
      'Jika mata bor terjepit, pindahkan selektor ke arah putar balik (reverse) dan tekan pelatuk pelan untuk membebaskan mata bor.'
    ],
    k3Penting: [
      'Waspadai bahaya kickback: jika mata bor tiba-tiba macet pada lubang, bodi bor tangan akan terpelanting balik melawan pergelangan tangan.',
      'Wajib kacamata keselamatan untuk menahan lontaran tatal panas.',
      'Jangan pernah memegang benda kerja pelat tipis dengan tangan terbuka; pelat tipis yang tersangkut mata bor dapat berputar kencang seperti bilah pisau helikopter (helikopetering). Selalu jepit dengan tang buaya (locking pliers) atau klem C.'
    ]
  },
  {
    id: 'guillotine',
    nama: 'Mesin Guillotine (Guillotine Shearing Machine)',
    namaEng: 'Hydraulic Sheet Metal Guillotine Power Shear',
    kategori: 'Mesin Pemotong Plat & Fabrikasi',
    kategoriKey: 'shearing',
    badge: 'Mesin Industri Berat • Hydraulic Shearing 30-100 Ton',
    deskripsiSingkat: 'Mesin industri pemotong pelat lembaran logam berkapasitas besar dengan pisau panjang horizontal yang memotong pelat baja secara rapi, lurus, dan presisi tanpa menghasilkan tatal.',
    deskripsiLengkap: 'Mesin potong pelat Guillotine (Guillotine Shearing Machine) adalah mesin fabrikasi lembaran logam utama di industri karoseri, ducting HVAC, panel kabinet, dan pembuatan lambung kapal. Mesin ini memanfaatkan mekanisme geser murni (shearing action) antara dua bilah pisau panjang baja perkakas tahan aus: pisau bawah terpasang tetap pada meja landasan, sedangkan pisau atas bergerak turun dengan sudut kemiringan kecil (rake angle 1° - 2.5°). Mesin bertenaga hidrolik mampu memotong pelat baja tebal 1mm hingga 16mm dengan panjang pemotongan mencapai 2.5 hingga 4 meter dalam sekali ayunan potong.',
    prinsipKerja: 'Pelat diletakkan di atas meja dan didorong hingga menyentuh pembatas belakang (backgauge). Operator menginjak pedal kaki (foot pedal). Silinder hidrolik pencekam (hold-down cylinders) otomatis turun terlebih dahulu menjepit pelat sekuat tenaga agar tidak terangkat, kemudian bilah pisau atas turun menyapu pelat melampaui batas elastis dan plastis material hingga terjadi patahan geser (shear fracture) lurus sempurna.',
    images: [
      {
        url: '/assets/images/cutting_tools/mesin_guillotine.jpg',
        title: 'Tampak Asli Mesin Guillotine Shear Hidrolik Industri',
        desc: 'Mesin potong pelat hidrolik kapasitas industri dengan silinder pencekam pelat (hold-downs), meja berpelor bola, kontrol CNC, dan kisi pelindung keselamatan jari.'
      }
    ],
    spesifikasi: [
      { label: 'Kekuatan Gaya Potong', value: '40 s.d. 120 Tonase Hidrolik' },
      { label: 'Panjang Pemotongan Maks.', value: '2.500 - 3.200 mm (2.5 - 3.2 Meter)' },
      { label: 'Tebal Pelat Baja Karbon (ST37)', value: 'Maks. 6.0 - 12.0 mm' },
      { label: 'Tebal Pelat Stainless Steel', value: 'Maks. 3.0 - 6.0 mm' },
      { label: 'Sudut Rake Pisau (Rake Angle)', value: '1° s.d. 2.5° (Dapat disetel hidrolik)' },
      { label: 'Jarak Gerak Backgauge', value: '20 - 750 mm (Akurasi ± 0.1 mm)' },
      { label: 'Jumlah Langkah Potong', value: '12 - 20 Kali Potong per Menit' },
      { label: 'Daya Motor Pompa Hidrolik', value: '7.5 - 15 kW (3 Phasa 380V)' }
    ],
    komponen: [
      { no: '01', nama: 'Hydraulic Hold-Down Clamps (Silinder Pencekam)', desc: 'Barisan silinder hidrolik berjejer di depan pisau yang otomatis menekan dan menjepit pelat logam ke meja tepat sebelum pisau potong menyentuh pelat, guna mencegah pelat melenting terangkat.', pinPos: { x: 65, y: 15 }, lokasiFisik: 'Barisan silinder hidrolik bulat di bagian atas depan yang menekan pelat ke meja' },
      { no: '02', nama: 'Upper & Lower Shearing Blades', desc: 'Bilah pisau baja paduan perkakas khusus (Cr12MoV / High Carbon High Chrome) bermata potong tajam pada 4 sisinya yang dapat dibalik posisinya saat satu sisi mulai tumpul.', pinPos: { x: 53, y: 36 }, lokasiFisik: 'Bilah pisau baja perkakas horizontal panjang di celah pemotongan tengah' },
      { no: '03', nama: 'Motorized CNC Backgauge (Mistar Pembatas)', desc: 'Mistar penahan pembatas ukuran di belakang pisau yang digerakkan motor servo dan sekrup bola (ball screw) dengan akurasi digital milimeter untuk menentukan lebar potongan.', pinPos: { x: 48, y: 25 }, lokasiFisik: 'Mistar pembatas ukuran otomatis di bagian belakang bilah pemotong' },
      { no: '04', nama: 'Transfer Ball Worktable & Front Support Arms', desc: 'Meja tumpuan berpelor bola baja putar bebas untuk memudahkan operator menggeser pelat baja berukuran 1.2 x 2.4 meter tanpa menggores permukaan dan tanpa beban berat.', pinPos: { x: 72, y: 65 }, lokasiFisik: 'Meja landasan pelat depan dengan bantalan pelor penumpu beban pelat' },
      { no: '05', nama: 'Mechanical Finger Guard (Kisi Pengaman Jari)', desc: 'Jeruji pelindung fisik di sepanjang bagian depan pisau yang hanya memiliki celah sempit untuk lewat pelat, mencegah jari atau tangan operator masuk ke zona potong.', pinPos: { x: 35, y: 32 }, lokasiFisik: 'Jeruji kisi pengaman horizontal pembatas jari di depan pisau' },
      { no: '06', nama: 'Emergency Foot Switch Pedal', desc: 'Pedal kaki berpelindung kap atas yang ditekan operator untuk memicu siklus potong dan dilengkapi saklar rem darurat (emergency stop) jika dilepas.', pinPos: { x: 40, y: 88 }, lokasiFisik: 'Pedal kaki saklar darurat di lantai depan operator' }
    ],
    bendaKerja: ['Lembaran pelat baja SPCC / SPHC / ST37 (tebal 1 - 8 mm)', 'Pelat bordes (chequered plate) untuk lantai bak bordes', 'Pelat aluminium sheet dekoratif dan ducting', 'Lembaran pelat baja tahan karat (Stainless Steel 304/316)', 'Pelat strip lebar untuk komponen braket mesin'],
    sopKerja: [
      'Setel celah pisau (Blade Clearance): celah antara pisau atas dan bawah wajib disetel sekitar 7% - 10% dari ketebalan pelat. Celah terlalu rapat membuat pisau tabrakan; celah terlalu renggang menghasilkan burr (duri tajam) besar.',
      'Atur ukuran potongan pada panel kontrol digital backgauge sesuai dimensi gambar kerja.',
      'Dorong pelat masuk melewati celah pelindung jari hingga tepi belakang pelat menabrak rata mistar backgauge di kedua sisinya.',
      'Pastikan tangan dan tubuh operator berada di luar batas garis batas kuning aman meja.',
      'Injak pedal kaki untuk mengaktifkan pemotongan; amati silinder pencekam menjepit pelat sebelum pisau turun.',
      'Ambil hasil potongan yang jatuh ke bak penampung belakang mesin menggunakan sarung tangan kulit pelindung.'
    ],
    k3Penting: [
      'BAHAYA AMPUTASI FATAL: DILARANG KERAS memasukkan jari atau tangan ke celah di bawah kisi pelindung pisau guillotine!',
      'Gunakan sarung tangan kulit tebal khusus fabrikasi saat mengangkat pelat; tepi pelat hasil pemotongan sangat tajam seperti silet (burr hazard).',
      'Hanya SATU OPERATOR yang berhak mengendalikan pedal kaki. Jika bekerja berpasangan mengangkat pelat besar, pastikan rekan kerja sudah memberi aba-aba aman sebelum pedal diinjak.',
      'Pastikan sensor tirai optik (safety light curtain) belakang aktif untuk menghentikan mesin jika ada orang melintas di area drop belakang.'
    ]
  },
  {
    id: 'alligator',
    nama: 'Aligator Shear (Crocodile Shear / Gunting Buaya)',
    namaEng: 'Hydraulic Alligator Shear Scrap Metal Cutter',
    kategori: 'Mesin Pemotong Plat & Fabrikasi',
    kategoriKey: 'shearing',
    badge: 'Mesin Industri Berat • Heavy Scrap & Bar Cutting',
    deskripsiSingkat: 'Mesin potong hidrolik berkekuatan rahang raksasa berbentuk moncong buaya untuk memotong besi beton bertulang, pipa tebal, profil rel, dan besi tua rongsok.',
    deskripsiLengkap: 'Mesin Alligator Shear (dikenal juga sebagai Crocodile Shear atau Gunting Buaya Hidrolik) adalah mesin pemotong material logam berat yang dinamai berdasarkan bentuk mekanisme rahang potongnya yang menyerupai moncong buaya yang membuka dan menutup. Mesin ini dirancang untuk tugas berat (heavy-duty demolition and recycling) seperti memotong besi beton batangan (rebar) dalam jumlah banyak sekaligus, balok kanal UNP, pipa gas tebal, as baja padat, kabel baja tebal, hingga sasis kendaraan besi tua sebelum masuk ke tungku peleburan baja.',
    prinsipKerja: 'Sebuah silinder hidrolik berdiameter besar (bore 160 - 250 mm) dengan tekanan pompa oli hingga 25 MPa mendorong lengan rahang atas yang berengsel poros pivot. Lengan atas yang membawa bilah pisau baja perkakas turun mengatup ke arah landasan rahang bawah statis dengan gaya tekan puluhan hingga ratusan ton, meremukkan dan menggunting logam seketika.',
    images: [
      {
        url: '/assets/images/cutting_tools/alligator_shear.jpg',
        title: 'Tampak Asli Mesin Alligator Shear Hidrolik',
        desc: 'Mesin pemotong gunting buaya hidrolik dengan rahang baja terbuka, bilah pisau perkakas tebal, silinder hidrolik tekan, dan tuas kontrol.'
      },
      {
        url: '/assets/images/cutting_tools/alligator_shear_alt.jpg',
        title: 'Detail Rahang dan Silinder Penjepit',
        desc: 'Tampak dekat mekanisme engsel pisau geser dan pelindung penahan benturan material saat proses pemotongan besi padat.'
      }
    ],
    spesifikasi: [
      { label: 'Gaya Geser Maksimum', value: '63 s.d. 250 Ton Gaya (630 - 2500 kN)' },
      { label: 'Panjang Bilah Pisau', value: '600 - 1.200 mm' },
      { label: 'Bukaan Maksimum Rahang', value: '250 - 450 mm (Jaw Opening)' },
      { label: 'Kapasitas Potong Besi As Pejal', value: 'Maks. Ø 50 - 85 mm' },
      { label: 'Kapasitas Potong Besi Beton', value: 'Maks. 5 - 8 Batang D25 bersamaan' },
      { label: 'Kapasitas Potong Pelat Baja', value: 'Tebal 20 - 35 mm' },
      { label: 'Tekanan Sistem Hidrolik', value: '16 - 25 MPa' },
      { label: 'Kecepatan Siklus Potong', value: '8 s.d. 18 Siklus per Menit' }
    ],
    komponen: [
      { no: '01', nama: 'Moving Upper Shear Jaw (Rahang Bergerak Atas)', desc: 'Lengan baja cor monoblok yang berayun naik-turun pada pin poros engsel utama berkekuatan tinggi, membawa pisau pemotong atas.', pinPos: { x: 29, y: 31 }, lokasiFisik: 'Lengan moncong buaya kuning berayun naik-turun pembawa pisau atas' },
      { no: '02', nama: 'Stationary Anvil Lower Jaw (Rahang Landasan Bawah)', desc: 'Dudukan landasan tetap berkekakuan tinggi yang dibaut mati pada sasis mesin untuk menahan beban gaya potong vertikal.', pinPos: { x: 26, y: 52 }, lokasiFisik: 'Rahang landasan baja tetap di bawah pisau penahan gaya geser' },
      { no: '03', nama: 'Heavy-Duty Hydraulic Push Cylinder', desc: 'Silinder hidrolik bertekanan tinggi yang terhubung antara rangka belakang mesin dengan bagian ekor rahang atas.', pinPos: { x: 50, y: 20 }, lokasiFisik: 'Silinder hidrolik besar di bagian belakang atas pendorong lengan rahang' },
      { no: '04', nama: 'Hardened Tool Steel Shear Blades', desc: 'Segmen bilah pisau baja paduan tahan bentur (Grade H13 atau S7) yang dibaut dengan toleransi tinggi dan dapat dibolak-balik keempat sudut potongnya.', pinPos: { x: 32, y: 44 }, lokasiFisik: 'Bilah pisau potong baja tebal di sisi potong pertemuan kedua rahang' },
      { no: '05', nama: 'Safety Hold-Down Clamp Bar', desc: 'Batang penahan material mekanis atau hidrolik di depan rahang untuk mencegah material terlempar melonjak ke atas saat pisau mulai menggigit.', pinPos: { x: 40, y: 42 }, lokasiFisik: 'Pelat penahan logam pencegah lontaran lonjakan material saat digunting' },
      { no: '06', nama: 'Operator Safety Foot Control / Lever', desc: 'Tuas manual atau pedal hidrolik dengan katup proporsional untuk mengendalikan gerak satu siklus atau pemotongan otomatis berulang.', pinPos: { x: 68, y: 92 }, lokasiFisik: 'Pedal kaki oranye di lantai yang diinjak operator untuk mengaktifkan pemotongan' }
    ],
    bendaKerja: ['Besi beton ulir konstruksi (Deformed Rebar) diameter besar', 'Rongsok profil baja struktural (H-Beam, IWF, UNP, Siku tebal)', 'Pipa baja dinding tebal dan tabung gas bekas', 'Poros gandar as baja mesin bekas', 'Bundel kabel baja (wire rope) dan kawat sling tebal'],
    sopKerja: [
      'Periksa level oli hidrolik pada sight glass tangki mesin dan pastikan tidak ada kebocoran selang bertekanan tinggi.',
      'Nyalakan motor pompa hidrolik; tunggu hingga jarum manometer tekanan mencapai tekanan kerja normal (16 - 20 MPa).',
      'Posisikan material logam sedalam mungkin ke arah pangkal engsel rahang (semakin dekat ke poros engsel, gaya momen potong semakin maksimal).',
      'Pastikan penahan material (hold-down clamp) terpasang rapat di atas benda kerja untuk menahan gaya lonjak potongan logam.',
      'Injak pedal kendali untuk melakukan siklus potong; jauhkan tangan minimal 60 cm dari area pertemuan pisau.',
      'Biarkan potongan jatuh bebas ke kotak kontainer penampung di bawah mesin.'
    ],
    k3Penting: [
      'BAHAYA CRUSHING & AMPUTASI EKSTREM: Dilarang keras menaruh anggota tubuh di antara kedua rahang; gaya geser mesin ini mampu memotong baja padat puluhan milimeter seketika.',
      'BAHAYA PROYEKTIL: Material baja keras atau getas (seperti baja pegas atau as hidrolik krom) dapat patah meletup dan melontarkan serpihan proyektil tajam berkecepatan tinggi; operator WAJIB berdiri di balik dinding pelindung polikarbonat / kawat ram jaring dan mengenakan pelindung mata lengkap.',
      'Gunakan helm proyek (safety helmet) dan sepatu safety bersol baja (steel toe boots) untuk mengantisipasi jatuhnya potongan besi berat.'
    ]
  },
  {
    id: 'gergaji-mesin',
    nama: 'Gergaji Besi Mesin (Horizontal Bandsaw / Power Hacksaw)',
    namaEng: 'Horizontal Metal Cutting Bandsaw & Power Hacksaw',
    kategori: 'Mesin Pemotong Plat & Fabrikasi',
    kategoriKey: 'sawing',
    badge: 'Mesin Bengkel Stasioner • Continuous Coolant Cut',
    deskripsiSingkat: 'Mesin pemotong stok batang logam (poros pejal, pipa tebal, profil baja) menggunakan pita gergaji berputar kontinu atau bilah gergaji bolak-balik dengan pendinginan fluida otomatis.',
    deskripsiLengkap: 'Mesin gergaji besi (Horizontal Bandsaw dan Power Hacksaw) adalah mesin perkakas pemotong primer yang bertugas memotong bahan mentah (raw stock bar) menjadi potongan pendek sebelum dibubut atau difrais. Horizontal bandsaw menggunakan bilah pita baja fleksibel bimetal tanpa ujung (loop tertutup) yang berputar melingkari dua roda puli besar secara kontinu ke satu arah. Karena pita terus bergerak menyayat logam tanpa ada langkah mundur kosong, proses pemotongan sangat efisien, bidang potong halus rata, celah sayatan (kerf loss) tipis sehingga menghemat material berharga, dan dilengkapi katup hidrolik penurun otomatis (hydraulic downfeed) serta sirkulasi pompa pendingin (coolant).',
    prinsipKerja: 'Motor listrik memutar drive wheel yang menggerakkan pita gergaji bimetal berputar melintasi roller guide bearing berkarbid. Rangka busur gergaji (bow) turun secara presisi dan perlahan menembus benda kerja yang dijepit di ragum mesin, diatur oleh silinder pengatur hidrolik needle-valve. Cairan pendingin disemprotkan tepat di titik mata gergaji menyayat benda kerja.',
    images: [
      {
        url: '/assets/images/cutting_tools/gergaji_mesin.jpg',
        title: 'Tampak Asli Mesin Gergaji Pita Horizontal (Bandsaw)',
        desc: 'Horizontal Metal Bandsaw industri memotong pipa dan batang baja tebal dengan sistem sirkulasi coolant, ragum miter putar, dan silinder hidrolik penurun.'
      },
      {
        url: '/assets/images/cutting_tools/gergaji_mesin_alt.jpg',
        title: 'Mesin Gergaji Besi Power Hacksaw Alternatif',
        desc: 'Mesin gergaji besi torak bolak-balik (power hacksaw) tugas berat di bengkel mesin tradisional dengan mekanisme engkol eksentrik.'
      }
    ],
    spesifikasi: [
      { label: 'Daya Motor Utama', value: '1.1 - 2.2 kW (1.5 - 3.0 HP)' },
      { label: 'Ukuran Pita Gergaji (Bandsaw)', value: 'Panjang 2.750 mm x Lebar 27 mm x Tebal 0.9 mm' },
      { label: 'Kerapatan Gigi Bilah (TPI)', value: '4/6, 6/10, atau 10/14 TPI (Teeth Per Inch)' },
      { label: 'Kecepatan Pita Gergaji', value: '4 Tingkat: 25, 40, 60, 80 m/min' },
      { label: 'Kapasitas Potong Bulat 90°', value: 'Maks. Ø 220 - 300 mm' },
      { label: 'Kapasitas Potong Kotak 90°', value: 'Maks. 220 x 260 mm' },
      { label: 'Sudut Putar Ragum Miter', value: '0° s.d. 60° (Swivel Bow Head)' },
      { label: 'Sistem Pengumpanan Turun', value: 'Silinder Hidrolik Regulasi Presisi (Needle Valve)' }
    ],
    komponen: [
      { no: '01', nama: 'Saw Bow Frame (Busur Rangka Gergaji)', desc: 'Rangka besi cor kokoh berengsel yang menampung dua roda pita gergaji, motor penggerak, pemandu bearing, dan saluran pipa pendingin.', pinPos: { x: 48, y: 45 }, lokasiFisik: 'Rangka besi cor besar abu-abu berlabel CAUTION penampung roda pita gergaji' },
      { no: '02', nama: 'Bi-Metal Bandsaw Blade (Pita Gergaji Bimetal)', desc: 'Pita baja paduan khusus dengan ujung gigi berbahan baja kecepatan tinggi M42 (HSS Cobalt 8%) yang tahan panas gesek dan sangat tajam.', pinPos: { x: 62, y: 49 }, lokasiFisik: 'Pita gergaji tipis melintang yang sedang menyayat benda kerja silinder putih' },
      { no: '03', nama: 'Carbide Guide Rollers & Bearings', desc: 'Bantalan rol presisi dan sisipan tungsten karbid yang memuntir pita 90 derajat vertikal agar bilah tegak lurus sempurna saat menyayat benda kerja.', pinPos: { x: 56, y: 46 }, lokasiFisik: 'Blok pemandu oranye ber-bearing penahan kelurusan pita gergaji di zona potong' },
      { no: '04', nama: 'Hydraulic Downfeed Cylinder & Dial', desc: 'Silinder hidrolik pengatur kecepatan turun busur. Dilengkapi kran jarum untuk mengatur laju pemakanan lambat untuk baja keras atau cepat untuk aluminium.', pinPos: { x: 56, y: 25 }, lokasiFisik: 'Panel konsol kontrol dan silinder hidrolik pengatur kecepatan turun rangka' },
      { no: '05', nama: 'Quick-Clamping Machine Vise', desc: 'Ragum besi cor dengan tuas pengunci cepat dan penahan panjang potongan (length stop rod) untuk pemotongan massal berulang berukuran sama.', pinPos: { x: 58, y: 55 }, lokasiFisik: 'Ragum besi cor penahan dan penjepit material batang logam pejal' },
      { no: '06', nama: 'Coolant Pump & Recirculation Tank', desc: 'Pompa listrik submersible dan nosel kran fleksibel yang menyemprotkan emulsi dromus pendingin secara kontinu dan menyaring tatal kembali ke tangki.', pinPos: { x: 48, y: 73 }, lokasiFisik: 'Bak tampungan tatal gram logam dan sirkulasi cairan pendingin di bawah rangka' }
    ],
    bendaKerja: ['Batang poros as baja pejal (Steel Round Bar S45C / VCL)', 'Pipa baja berdinding tebal dan silinder hidrolik', 'Baja profil H-Beam dan I-Beam struktural', 'Balok aluminium pejal (Duralumin 6061 / 7075)', 'Baja perkakas (Tool Steel SKD11 / AISI D2)'],
    sopKerja: [
      'Pilih bilah gergaji dengan TPI (Teeth Per Inch) yang tepat: terapkan "Aturan 3 Gigi Minimal", yaitu minimal 3 gigi gergaji harus selalu kontak dengan ketebalan benda kerja saat menyayat.',
      'Setel ketegangan pita gergaji (blade tension) menggunakan meteran torsi roda tangan pengencang agar pita tidak meliuk melengkung saat memotong.',
      'Jepit batang logam kuat-kuat pada ragum; pasang penopang rol (roller stand) di ujung batang panjang agar seimbang.',
      'Buka kran pompa pendingin (coolant) dan arahkan semprotan tepat pada area kontak bilah gergaji dan logam.',
      'Nyalakan mesin dan putar katup hidrolik downfeed secara perlahan untuk memulai pemakanan material.',
      'Mesin akan otomatis mati (auto shut-off) begitu potongan putus berkat saklar batas (limit switch) yang tersentuh di bagian bawah meja.'
    ],
    k3Penting: [
      'DILARANG menyentuh pita gergaji atau mencoba mengambil benda kerja saat pita masih bergerak!',
      'Pastikan pintu penutup roda puli gergaji tertutup rapat dan terkunci baut sebelum menyalakan motor mesin.',
      'Gunakan sarung tangan saat menangani pita gergaji pengganti yang tajam dan pegang dengan hati-hati saat melipat/membuka lipatan coil pita.',
      'Bersihkan tatal gram pada sikat pembersih roda (wire chip brush) secara rutin untuk mencegah pita tergelincir dari puli.'
    ]
  },
  {
    id: 'reamer',
    nama: 'Reamer Presisi (Hand & Machine Reamer)',
    namaEng: 'Precision Hand & Machine Chucking Reamers',
    kategori: 'Perkakas Potong Presisi Ulir & Lubang',
    kategoriKey: 'finishing',
    badge: 'Perkakas Potong Finishing • Akurasi Toleransi H7 (0.01 mm)',
    deskripsiSingkat: 'Perkakas potong presisi bertingkat alur banyak untuk memperbesar dan menghaluskan dinding lubang hasil pengeboran dengan akurasi dimensi geometris tinggi dan nilai kekasaran permukaan mikro (Ra rendah).',
    deskripsiLengkap: 'Reamer (peluas lubang presisi) adalah alat potong rotari finishing berbilah tajam jamak (multi-flute cutter). Mata bor biasa hanya mampu menghasilkan lubang dengan toleransi kasar (IT11 - IT12) dan permukaan beralur spiral kasar. Untuk memasang pena pasak (dowel pin), bearing presisi, atau bushing peluru poros yang memerlukan toleransi ketat kelas ISO H7 (deviasi dimensi hanya berkisar +0.015 mm) dan permukaan cermin halus (kekasaran Ra < 0.8 µm), reamer wajib digunakan. Reamer dibagi menjadi Reamer Tangan (Hand Reamer dengan chamfer runcing panjang dan tangkai kotak) serta Reamer Mesin (Chucking Reamer dengan tangkai silindris atau tirus Morse).',
    prinsipKerja: 'Reamer tidak digunakan untuk membuat lubang baru dari awal, melainkan hanya menyayat lapisan logam sangat tipis (allowance pengeboran 0.1 mm - 0.3 mm) pada lubang yang sudah dibor sebelumnya. Bilah-bilah pisau lurus atau heliks memotong dinding silinder lubang secara melingkar seimbang, menghasilkan bentuk silinder sempurna tanpa ovalitas (kebulatan tinggi).',
    images: [
      {
        url: '/assets/images/cutting_tools/reamer_presisi.jpg',
        title: 'Tampak Asli Reamer Tangan Setelan (Adjustable Hand Reamer)',
        desc: 'Reamer tangan presisi dengan bilah pisau baja perkakas yang dapat disetel diameternya melalui mur ulir kerucut ganda.'
      },
      {
        url: '/assets/images/cutting_tools/reamer_mesin.jpg',
        title: 'Reamer Mesin Alur Heliks (Spiral Chucking Reamer)',
        desc: 'Reamer mesin berkecepatan tinggi dengan alur tatal spiral kiri untuk pembuangan tatal ke depan pada lubang tembus.'
      }
    ],
    spesifikasi: [
      { label: 'Material Mata Potong', value: 'HSS-Co (M35 Cobalt) / Solid Carbide Tungsten' },
      { label: 'Toleransi Standar Lubang', value: 'ISO H7 (Contoh: Ø10H7 = +0.015 / -0.000 mm)' },
      { label: 'Kekasaran Permukaan (Ra)', value: 'Ra 0.4 s.d. 0.8 µm (Permukaan Halus Presisi)' },
      { label: 'Allowance Ukuran Lubang Awal', value: 'Tinggalkan 0.15 - 0.25 mm dari diameter akhir' },
      { label: 'Konfigurasi Alur (Flute)', value: 'Lurus (Straight Flute) & Spiral Heliks Kiri' },
      { label: 'Tangkai Pegangan Tangan', value: 'Square Shank (Segi Empat untuk Tap Wrench)' },
      { label: 'Tangkai Pegangan Mesin', value: 'Morse Taper MT1-MT4 atau Straight Shank' },
      { label: 'Sudut Chamfer Masuk', value: 'Tangan: Tirus halus 1° s.d. 2° | Mesin: 45°' }
    ],
    komponen: [
      { no: '01', nama: 'Starting Chamfer / Lead Taper (Ujung Pengarah)', desc: 'Bagian ujung depan yang tirus perlahan berfungsi sebagai pemandu masuk tepat ke sumbu lubang dan melakukan pemotongan tebal tatal pertama kali.', pinPos: { x: 8, y: 50 }, lokasiFisik: 'Ujung paling depan yang tirus pemandu masuk tepat ke sumbu lubang bor' },
      { no: '02', nama: 'Flutes (Alur Pembuang Tatal)', desc: 'Alur-alur memanjang dengan jumlah bilah genap tidak simetris (irregular spacing) yang dirancang khusus untuk meredam getaran obrol (anti-chatter).', pinPos: { x: 27, y: 43 }, lokasiFisik: 'Alur bilah memanjang pembuang tatal di bagian tengah bilah potong' },
      { no: '03', nama: 'Cutting Lands & Margin (Bidang Ukur Diametral)', desc: 'Punggung tepi silinder berukuran presisi mikro yang mengikis lubang dan menstabilkan pergerakan reamer agar tidak oleng.', pinPos: { x: 36, y: 58 }, lokasiFisik: 'Tepi silinder presisi mikro pemotong dan penghalus dinding lubang kelas H7' },
      { no: '04', nama: 'Reamer Body (Badan Silinder Reamer)', desc: 'Batang pejal yang sedikit mengecil ke arah belakang (back taper sekitar 0.01 mm per 100mm) untuk mencegah gesekan panas berlebih di belakang mata potong.', pinPos: { x: 58, y: 50 }, lokasiFisik: 'Badan poros silinder baja di belakang alur mata potong' },
      { no: '05', nama: 'Square Driving Shank (Tangkai Penggerak)', desc: 'Ujung belakang berbentuk bujur sangkar (square head) yang dijepit pada tangkai pemutar tap (tap wrench) untuk pemutaran manual tangan.', pinPos: { x: 93, y: 50 }, lokasiFisik: 'Ujung pangkal belakang berbentuk bujur sangkar untuk dijepit tangkai tap wrench' },
      { no: '06', nama: 'Adjusting Nuts (Pada Reamer Setelan)', desc: 'Sepasang mur ulir di kedua ujung bilah yang dikencangkan/dikendorkan untuk menggeser bilah pada celah miring guna memperbesar atau memperkecil diameter reamer.', pinPos: { x: 14, y: 50 }, lokasiFisik: 'Sepasang mur ulir pengatur di ujung bilah untuk menyetel diameter reamer' }
    ],
    bendaKerja: ['Lubang dudukan pin pena pasak (Dowel Pin)', 'Lubang bushing kuningan pada rumah bantalan mesin', 'Lubang engsel presisi perkakas cetakan jig & fixture', 'Lubang piston connecting rod motor bakar', 'Lubang hidrolik valve block presisi tinggi'],
    sopKerja: [
      'Siapkan lubang awal dengan mata bor: DIAMETER MATA BOR WAJIB LEBIH KECIL dari ukuran reamer. Contoh: Untuk reamer Ø 10 mm, bor dengan mata bor Ø 9.8 mm (sisakan 0.2 mm). Jangan mereamer lubang yang terlalu tebal karena reamer bukan alat pembuang tatal massal!',
      'Gunakan selalu pelumas berkualitas tinggi (cutting oil / oli mesin SAE 30) pada reamer dan dinding lubang.',
      'Pasang reamer tegak lurus sempurna pada sumbu lubang menggunakan bantuan tap guide atau center spindel mesin bubut/bor.',
      'Putar reamer searah jarum jam (kanan) secara perlahan dan berikan tekanan dorong ringan yang konstan.',
      'ATURAN EMAS REAMER: JANGAN PERNAH MEMUTAR BALIK REAMER (berlawanan arah jarum jam / ke kiri), baik saat menyayat maupun saat mencabut reamer keluar dari lubang! Memutar balik akan membuat tatal terjepit di bawah bilah potong, merusak dinding lubang yang sudah halus, dan langsung mematahkan mata reamer.',
      'Bersihkan tatal halus dari alur reamer menggunakan kuas halus bersih sebelum menyimpannya kembali di kotak kayu pelindung.'
    ],
    k3Penting: [
      'Bilah mata potong reamer sangat tajam; hindari memegang badan bilah tanpa sarung tangan atau kain pelapis.',
      'Jangan pernah memukul reamer dengan palu baja atau menjatuhkannya ke lantai; material HSS/karbid reamer sangat getas dan akan gompal seketika.',
      'Selalu bersihkan gram mikroskopis dengan kuas, jangan pernah ditiup dengan mulut karena serpihan tajam dapat mengenai mata.'
    ]
  },
  {
    id: 'tap-dies',
    nama: 'Tap dan Dies (Metrik Threading Tool Set)',
    namaEng: 'Internal & External Metric Thread Cutting Set',
    kategori: 'Perkakas Potong Presisi Ulir & Lubang',
    kategoriKey: 'finishing',
    badge: 'Perkakas Manual Presisi • Standar Ulir Metrik ISO',
    deskripsiSingkat: 'Set perkakas pemotong ulir presisi manual: Tap untuk membuat ulir dalam (mur/lubang berulir) dan Dies (Sney) untuk membuat ulir luar pada batang poros (baut/stud bar).',
    deskripsiLengkap: 'Set perkakas Tap dan Dies (Sney) adalah perlengkapan pokok di bengkel pemesinan untuk pembuatan dan perbaikan ulir baut standar Metrik ISO maupun Whitworth/UNC. Tap digunakan untuk membuat ulir dalam pada lubang tembus atau lubang buntu yang telah dibor sebelumnya. Satu set tap tangan metrik umumnya terdiri dari 3 nomor bertingkat: Tap No. 1 (Taper Tap ujung tirus panjang), Tap No. 2 (Plug/Intermediate Tap), dan Tap No. 3 (Bottoming Tap ujung rata untuk lubang buntu). Sebaliknya, Dies (Sney) berbentuk piringan cincin baja pejal yang dipasang pada rumah tangkai die stock untuk memotong ulir luar pada permukaan batang silindris.',
    prinsipKerja: 'Tap dan Dies menyayat alur ulir heliks bersudut 60° (standar Metrik ISO) dengan kedalaman profil ulir sesuai kisar pitch (P). Operator memutar tangkai secara manual dengan teknik siklus: putar maju 1/2 hingga 3/4 putaran untuk menyayat tatal, lalu putar balik 1/4 putaran ke belakang untuk memutus tatal gram (chip breaking).',
    images: [
      {
        url: '/assets/images/cutting_tools/tap_dan_dies.jpg',
        title: 'Tampak Asli Mata Tap & Gagang Pemutar T-Wrench',
        desc: 'Mata tap baja HSS beralur lurus terpasang pada tangkai pemutar tap (T-Handle Tap Wrench) siap membuat ulir dalam pada balok logam.'
      },
      {
        url: '/assets/images/cutting_tools/dies_presisi.jpg',
        title: 'Mata Sney Bulat Presisi (Round Threading Die)',
        desc: 'Piringan die sney baja perkakas berlubang pembuang tatal dan baut penyetel belah (split die) untuk pemotongan ulir baut luar.'
      }
    ],
    spesifikasi: [
      { label: 'Standar Profil Ulir', value: 'ISO Metric Thread 60° (Contoh: M6x1.0, M8x1.25, M10x1.5)' },
      { label: 'Material Perkakas', value: 'HSS (High-Speed Steel M2) / Alloy Tool Steel' },
      { label: 'Set Tap Tangan Lengkap', value: '3 Tingkat: No.1 (Taper), No.2 (Plug), No.3 (Bottoming)' },
      { label: 'Bentuk Die (Sney)', value: 'Round Split Die (Dapat disetel celah kelonggaran ulir)' },
      { label: 'Rumus Diameter Lubang Bor Tap', value: 'D_bor = D_nominal - Pitch (M10 x 1.5 -> Bor Ø 8.5 mm)' },
      { label: 'Rumus Diameter Poros Ulir Baut', value: 'D_poros = D_nominal - (0.1 x Pitch) (Contoh: M10 -> Poros Ø 9.85 mm)' },
      { label: 'Gagang Pemutar Tap (Tap Wrench)', value: 'Adjustable Bar Tap Wrench & T-Handle Wrench' },
      { label: 'Gagang Pemutar Sney (Die Stock)', value: 'Die Stock Cast Steel dengan 3 atau 5 Baut Pengunci' }
    ],
    komponen: [
      { no: '01', nama: 'Tap No. 1 (Taper Tap - Alur Cincin 1 Garis)', desc: 'Tap pemula dengan tirus panjang di ujungnya (8 hingga 10 gigi tirus chamfer). Digunakan pertama kali karena mudah masuk tegak lurus dan pemotongannya bertahap ringan.', pinPos: { x: 10, y: 88 }, lokasiFisik: 'Ujung gigi tirus mata tap pembuat alur ulir dalam standar metrik ISO' },
      { no: '02', nama: 'Tap No. 2 (Plug / Intermediate Tap - Alur Cincin 2 Garis)', desc: 'Tap perantara dengan 4 hingga 5 gigi tirus chamfer untuk melanjutkan pemakanan memperdalam profil ulir setelah Tap No. 1.', pinPos: { x: 20, y: 80 }, lokasiFisik: 'Alur lurus pembuang tatal gram dan mata sayat ulir bersudut 60 derajat' },
      { no: '03', nama: 'Tap No. 3 (Bottoming Tap - Tanpa Garis Cincin)', desc: 'Tap penyelesai dengan ujung tirus sangat pendek (hanya 1-2 gigi potong) khusus untuk membuat profil ulir penuh hingga menyentuh dasar lubang buntu (blind hole).', pinPos: { x: 31, y: 70 }, lokasiFisik: 'Tangkai berkepala bujur sangkar yang dicekam rahang rumah cekam' },
      { no: '04', nama: 'Straight Flutes & Cutting Edges', desc: '3 atau 4 alur cekung memanjang tempat tatal terkelupas dan jalan masuk bagi oli pelumas pendingin mencapai mata potong.', pinPos: { x: 74, y: 35 }, lokasiFisik: 'Batang silindris baja krom T-Handle pemutar manual dengan dua tangan' },
      { no: '05', nama: 'Round Split Die (Mata Sney Bulat Belah)', desc: 'Cincin pemotong ulir luar dengan 3-4 lubang pelepasan tatal dan sebuah celah belah di sisi luar yang dapat disetel baut ekspansi untuk mengatur kerapatan suaian ulir (tight/loose fit).', pinPos: { x: 48, y: 58 }, lokasiFisik: 'Selongsong hitam bermotif jaring silang (knurling) pengencang rahang tap' },
      { no: '06', nama: 'Adjustable Tap Wrench & Die Stock Handles', desc: 'Batang pemutar dua lengan panjang yang memberikan momen gaya torsi seimbang dari kedua tangan operator agar perkakas tidak patah terpuntir miring.', pinPos: { x: 70, y: 44 }, lokasiFisik: 'Rumah silinder hitam pemegang poros T dan saklar arah putar ratchet' }
    ],
    bendaKerja: ['Lubang baut pengikat pada blok silinder mesin', 'Braket dudukan sensor dan motor listrik', 'Batang poros berulir stud bolt (baut tanam)', 'Perbaikan ulir baut yang aus atau rusak (thread chasing/repair)', 'Pembuatan mur dan baut custom di bengkel bubut'],
    sopKerja: [
      'HITUNG DIAMETER BOR SEBELUM NGETAP: Gunakan rumus wajib D = Nominal - Kisar (P). Contoh: ulir M8x1.25 wajib dibor dengan mata bor Ø 6.8 mm (8 - 1.25 = 6.75 dibulatkan ke 6.8 mm). Jika lubang bor terlalu kecil, tap akan macet dan patah di dalam lubang!',
      'Untuk sney ulir luar: chamfer ujung batang as sebesar 45 derajat agar sney mudah masuk sejajar.',
      'Gunakan pelumas wajib: Oli mesin, tap oil, atau gemuk saat memotong baja; gunakan spiritus/alkohol saat ngetap aluminium.',
      'Pastikan posisi tap atau sney benar-benar TEGAK LURUS 90 derajat terhadap bidang kerja. Periksa dengan siku-siku (try square) pada awal 2 putaran pertama.',
      'TERAPKAN RITME POTONG: Putar searah jarum jam 180° - 270°, lalu putar balik ke kiri 90° hingga terasa bunyi "klik" renyah tanda tatal gram putus. Tatal yang tidak diputus akan menyumbat alur flute dan mematahkan tap!',
      'Lakukan pengetapan secara berurutan: mulai dari Tap No. 1, lanjutkan Tap No. 2, dan akhiri dengan Tap No. 3 jika diperlukan lubang buntu.'
    ],
    k3Penting: [
      'BAHAYA TAP PATAH: Tap dibuat dari baja HSS berkekerasan tinggi yang sangat getas. Jangan pernah memaksakan putaran jika terasa berat/macet; putar balik dan semprot oli pembersih!',
      'Gunakan kacamata pelindung untuk mencegah tatal gram terlempar saat memutar balik.',
      'Gunakan kain majun untuk menyeka batang tap yang berlumur oli dan tatal tajam; jangan menyeka dengan telapak tangan.',
      'Pegang kedua gagang pemutar (tap wrench) secara seimbang dengan dorongan kedua tangan simetris untuk mencegah momen bengkok (bending force) yang menjadi penyebab nomor satu tap patah.'
    ]
  }
];

// =============================================================================
// DATABASE KUIS ASESMEN KOMPREHENSIF 10 SOAL PEMBELAJARAN
// =============================================================================
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Berapa kecepatan keliling maksimum standar yang diizinkan untuk batu gerinda tangan 4 inci (100 mm) berbahan resinoid?',
    options: ['30 m/s', '50 m/s', '80 m/s', '120 m/s'],
    correct: 2,
    explanation: 'Standar keselamatan internasional (EN 12413 / OSHA) menetapkan batas kecepatan keliling aman untuk batu gerinda potong dan asah resinoid berkecepatan tinggi adalah 80 m/s (sekitar 11.000 - 12.000 RPM untuk diameter 100mm).'
  },
  {
    id: 2,
    question: 'Mengapa operator mesin bor bangku DILARANG KERAS menggunakan sarung tangan kain?',
    options: [
      'Karena sarung tangan membuat tangan operator cepat berkeringat',
      'Karena serat kain sarung tangan dapat tersangkut dan terbelit oleh spindel atau mata bor putar, menyebabkan fraktur/amputasi jari',
      'Karena sarung tangan membuat mata bor cepat tumpul',
      'Karena getaran mesin bor dapat merusak lapisan karet sarung tangan'
    ],
    correct: 1,
    explanation: 'Aturan K3 internasional pada semua mesin perkakas berputar (bor, bubut, frais) melarang penggunaan sarung tangan kain karena jika tersangkut sedikit saja pada spindel atau mata bor yang berputar ribuan RPM, tangan akan terseret masuk seketika.'
  },
  {
    id: 3,
    question: 'Berapakah diameter mata bor yang tepat untuk melubangi pelat baja sebelum dibuat ulir dalam menggunakan Tap M10 x 1.5?',
    options: ['10.0 mm', '9.0 mm', '8.5 mm', '7.0 mm'],
    correct: 2,
    explanation: 'Rumus baku pengetapan ulir metrik adalah D_bor = D_nominal - Pitch. Maka untuk M10 x 1.5: D_bor = 10 - 1.5 = 8.5 mm. Jika menggunakan bor 10mm ulir tidak akan terbentuk, sedangkan jika terlalu kecil tap akan patah di dalam.'
  },
  {
    id: 4,
    question: 'Pada mesin potong pelat Guillotine Shear, apakah fungsi utama dari deretan silinder "Hydraulic Hold-Down Clamps"?',
    options: [
      'Untuk mendinginkan bilah pisau dengan oli',
      'Untuk menekan dan menjepit pelat secara kokoh sesaat sebelum pisau turun memotong agar pelat tidak terangkat/bergeser',
      'Untuk mengukur panjang pelat secara digital',
      'Untuk mendorong hasil potongan pelat keluar ke belakang'
    ],
    correct: 1,
    explanation: 'Silinder pencekam (hold-downs) pada mesin guillotine turun menjepit pelat dengan gaya tekan puluhan ton tepat sebelum pisau potong menyentuh logam, mencegah efek ungkitan gaya geser yang bisa mementalkan pelat.'
  },
  {
    id: 5,
    question: 'Mengapa reamer presisi (Hand / Machine Reamer) TIDAK BOLEH diputar ke arah sebaliknya (berlawanan jarum jam / ke kiri)?',
    options: [
      'Karena putaran kiri akan membuat motor mesin terbakar',
      'Karena tatal gram akan terjepit di bawah bilah potong, menggores permukaan cermin lubang, dan mematahkan bilah reamer seketika',
      'Karena reamer akan terlepas dari tangkai pemutarnya',
      'Karena sudut heliks reamer akan berubah menjadi lurus'
    ],
    correct: 1,
    explanation: 'Bilah reamer dirancang hanya memiliki relief sudut potong satu arah. Memutar balik reamer akan menekan tatal halus masuk ke bawah bidang ukur (margin), mengakibatkan baret parah pada dinding lubang dan gigi potong reamer langsung retak/gompal.'
  },
  {
    id: 6,
    question: 'Alat pemotong manakah yang dirancang khusus untuk memotong besi beton bertulang (rebar), balok UNP tebal, dan besi tua rongsokan dengan rahang hidrolik mirip moncong buaya?',
    options: ['Gerinda Tangan', 'Aligator Shear (Crocodile Shear)', 'Reamer Mesin', 'Mesin Bor Bangku'],
    correct: 1,
    explanation: 'Alligator Shear (Crocodile Shear) memiliki lengan rahang atas bergerak hidrolik dengan gaya tekan 60 hingga 250 ton untuk meremukkan dan menggunting besi beton, profil struktural, dan scrap metal.'
  },
  {
    id: 7,
    question: 'Berapakah batas jumlah minimal gigi pita gergaji (Bandsaw) yang harus selalu kontak dengan ketebalan benda kerja saat memotong ("Aturan Emas Pemilihan TPI")?',
    options: ['Minimal 1 gigi', 'Minimal 3 gigi', 'Minimal 10 gigi', 'Minimal 24 gigi'],
    correct: 1,
    explanation: 'Aturan umum pemotongan gergaji mesin (bandsaw / hacksaw) menyatakan minimal 3 gigi gergaji harus selalu kontak dengan benda kerja secara simultan. Jika kurang dari 3 gigi, gigi gergaji akan menyangkut pada tepi material dan rontok (tooth stripping).'
  },
  {
    id: 8,
    question: 'Pada proses pembuatan ulir dalam manual, manakah urutan mata tap yang benar dari awal hingga akhir?',
    options: [
      'Tap No. 3 (Bottoming) -> Tap No. 2 (Plug) -> Tap No. 1 (Taper)',
      'Tap No. 1 (Taper) -> Tap No. 2 (Plug) -> Tap No. 3 (Bottoming)',
      'Tap No. 2 (Plug) -> Tap No. 1 (Taper) -> Tap No. 3 (Bottoming)',
      'Langsung menggunakan Tap No. 3 tanpa tap lainnya'
    ],
    correct: 1,
    explanation: 'Urutan baku pengetapan tangan adalah Tap No. 1 (Taper tap berujung tirus panjang untuk pemandu awal) -> Tap No. 2 (Plug tap untuk memperdalam profil ulir) -> Tap No. 3 (Bottoming tap berujung rata untuk lubang buntu).'
  },
  {
    id: 9,
    question: 'Apakah fungsi fitur "Clutch Ring / Torque Adjustment Collar" pada mesin bor tangan portabel (Cordless Drill)?',
    options: [
      'Mengatur kecepatan putaran spindel secara mekanis',
      'Mengatur batas torsi putar agar kepala sekrup tidak aus dan mesin slip otomatis saat beban tertentu tercapai',
      'Mengubah fungsi bor menjadi mesin gerinda',
      'Mengunci mata bor tanpa kunci chuck'
    ],
    correct: 1,
    explanation: 'Cincin pengatur torsi (clutch collar 1 - 20) membatasi gaya puntir dengan mekanisme slip ball-detent, sehingga motor bor akan slip dan tidak merusak kepala sekrup saat baut sudah kencang sempurna.'
  },
  {
    id: 10,
    question: 'Berapa besaran kelonggaran (allowance) diameter lubang yang disisakan dari proses pengeboran untuk proses reaming ukuran Ø 10 mm H7?',
    options: ['Disisakan 1.5 - 2.0 mm', 'Disisakan 0.15 - 0.25 mm', 'Disisakan 5.0 mm', 'Tidak perlu disisakan (diameter bor sama dengan diameter reamer)'],
    correct: 1,
    explanation: 'Reamer adalah alat finishing presisi tinggi, bukan pembuat lubang utama. Untuk diameter sekitar 10mm, allowance yang disisakan dari proses pengeboran awal adalah 0.15 mm hingga 0.25 mm (contoh dibor dengan mata bor Ø 9.8 mm).'
  }
];

const CuttingToolsLab = ({ addXP = () => {}, addMissionCompleted = () => {}, onOpenDiagnostic = null }) => {
  const [labTab, setLabTab] = useState('katalog'); // 'katalog', 'materi', 'safety', 'quiz'
  const [selectedToolId, setSelectedToolId] = useState('gerinda-tangan');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'portable', 'shearing', 'drilling', 'sawing', 'finishing'
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // State untuk Interaksi Pin Anatomi Foto Alat
  const [activeKomponenIdx, setActiveKomponenIdx] = useState(0);
  const [showAllPins, setShowAllPins] = useState(true);
  const [hoveredPinIdx, setHoveredPinIdx] = useState(null);

  // Kalkulator RPM Bor di Tab Materi
  const [calcCs, setCalcCs] = useState(25); // ST37 = 25 m/min
  const [calcDia, setCalcDia] = useState(10); // mm

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Cari data alat terpilih
  const currentTool = CUTTING_TOOLS_DATA.find(t => t.id === selectedToolId) || CUTTING_TOOLS_DATA[0];

  // Integrasi Audio Narator Aksesibilitas & Inklusi
  const { speakText, stopSpeech, isSpeaking, currentNarrativeTitle } = useAccessibility();

  const getToolNarration = (tool) => {
    const komp = tool.komponen?.map(k => `${k.nama}: ${k.desc}`).slice(0, 3).join('. ') || '';
    const sop = tool.sopKerja?.slice(0, 2).join('. ') || '';
    const k3 = tool.k3Penting?.[0] || '';
    return `Alat pemotong yang sedang Anda pilih adalah: ${tool.nama}, nama teknis internasional: ${tool.namaEng}. Kategori alat: ${tool.kategori}. ${tool.deskripsiSingkat} ${tool.deskripsiLengkap}. Prinsip kerja pemotongannya: ${tool.prinsipKerja}. Tiga komponen kuncinya antara lain: ${komp}. Langkah standar SOP: ${sop}. Peraturan keselamatan K3 yang wajib dipatuhi: ${k3}.`;
  };

  const isSpeakingCurrentTool = isSpeaking && currentNarrativeTitle === `Alat: ${currentTool.nama}`;

  const handleToggleToolAudio = (tool = currentTool) => {
    const title = `Alat: ${tool.nama}`;
    if (isSpeaking && currentNarrativeTitle === title) {
      stopSpeech();
    } else {
      speakText(getToolNarration(tool), title);
    }
  };

  // Filter daftar alat
  const filteredTools = categoryFilter === 'all'
    ? CUTTING_TOOLS_DATA
    : CUTTING_TOOLS_DATA.filter(t => t.kategoriKey === categoryFilter);

  // Ganti alat aktif
  const handleSelectTool = (id) => {
    sound.playClick();
    setSelectedToolId(id);
    setSelectedImageIndex(0);
    setActiveKomponenIdx(0);
    setHoveredPinIdx(null);
  };

  // Hitung RPM: N = (1000 * Cs) / (pi * d)
  const calculatedRPM = Math.round((1000 * calcCs) / (Math.PI * calcDia));

  // Quiz handlers
  const handleQuizSelect = (qId, optionIdx) => {
    if (quizSubmitted) return;
    sound.playClick();
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        correctCount += 1;
      }
    });
    return correctCount * 100; // 100 XP per soal (total 1000 XP)
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      alert('Harap jawab seluruh 10 soal evaluasi sebelum mengumpulkan!');
      return;
    }
    sound.playSuccess?.();
    setQuizSubmitted(true);

    const scoreXP = calculateScore();
    const correctCount = Math.round(scoreXP / 100);
    const score100 = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

    recordQuizResult({
      modul: 'Alat Pemotong',
      judulKuis: 'Kuis Ensiklopedia Alat Pemotong',
      skor: score100,
      jawabanBenar: correctCount,
      totalSoal: QUIZ_QUESTIONS.length,
      detailJawaban: `${correctCount} dari ${QUIZ_QUESTIONS.length} soal dijawab benar (Skor: ${score100}/100)`
    });
  };

  const handleClaimXP = () => {
    const score = calculateScore();
    if (score >= 700 && !xpClaimed) {
      addXP(1000);
      addMissionCompleted('mission-cutting-tools');
      sound.playSuccess?.();
      setXpClaimed(true);
      alert(`🎉 Selamat! Anda memperoleh 1000 XP atas penguasaan modul Ensiklopedia Alat Pemotong Pemesinan!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', color: '#0f172a', overflow: 'hidden' }}>
      
      <div style={{ padding: '16px 20px 0 20px' }}>
        <LabDiagnosticBanner
          labTitle="Alat Pemotong & Perkakas Pemesinan"
          desc="Diagnosa 10 soal sudut baji pahat, jenis mata bor (twist drill), gergaji besi (TPI), dan SOP gerinda tangan."
          onOpenDiagnostic={onOpenDiagnostic}
        />
      </div>

      {/* =====================================================================
          HEADER MODUL PEMBELAJARAN
          ===================================================================== */}
      <div className="cutting-tools-header" style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="cutting-tools-header-icon" style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.25)'
          }}>
            ⚙️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="cutting-tools-title" style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Ensiklopedia Visual Alat Pemotong Pemesinan
              </h1>
              <span style={{
                background: '#fff7ed',
                color: '#ea580c',
                border: '1px solid #fed7aa',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                Foto Asli Bengkel & Industri
              </span>
            </div>
            <p className="cutting-tools-subtitle" style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Media Pembelajaran Pengenalan 9 Perkakas Tangan Bertenaga, Mesin Potong Fabrikasi & Presisi SMK Teknik Mesin
            </p>
          </div>
        </div>

        {/* Tab Navigasi Utama */}
        <div className="cutting-tools-tabs" style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'katalog', label: '📸 Katalog & Foto Asli Alat', icon: '🔍' },
            { id: 'materi', label: '📖 Teori & Standarisasi', icon: '📐' },
            { id: 'safety', label: '⚠️ SOP Keselamatan K3', icon: '🛡️' },
            { id: 'quiz', label: '🎯 Kuis Asesmen (1000 XP)', icon: '🏆' }
          ].map(tab => {
            const isActive = labTab === tab.id;
            return (
              <button
                key={tab.id}
                className="cutting-tools-tab-btn"
                onClick={() => {
                  sound.playClick();
                  setLabTab(tab.id);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}

          {onOpenDiagnostic && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDiagnostic();
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Mulai Tes Diagnostik Alat Pemotong (10 Soal Pilgan)"
            >
              <span>📋</span>
              <span>Tes Diagnostik (10 Soal)</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: KATALOG & FOTO ASLI ALAT (PEMBELAJARAN VISUAL MURNI)
          ===================================================================== */}
      {labTab === 'katalog' && (
        <div className="cutting-tools-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* SIDEBAR DAFTAR 9 ALAT */}
          <div className="cutting-tools-sidebar" style={{
            width: '320px',
            minWidth: '300px',
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Filter Kategori */}
            <div className="cutting-tools-sidebar-filter" style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Filter Kelompok Alat
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'Semua (9)' },
                  { key: 'portable', label: 'Bertenaga' },
                  { key: 'shearing', label: 'Plat/Shear' },
                  { key: 'drilling', label: 'Bor' },
                  { key: 'sawing', label: 'Gergaji' },
                  { key: 'finishing', label: 'Presisi' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => {
                      sound.playClick();
                      setCategoryFilter(f.key);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.68rem',
                      fontWeight: categoryFilter === f.key ? 800 : 600,
                      background: categoryFilter === f.key ? '#ea580c' : '#f1f5f9',
                      color: categoryFilter === f.key ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Menu 9 Alat */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', background: '#ffffff' }}>
              {filteredTools.map((t, index) => {
                const isSelected = t.id === selectedToolId;
                return (
                  <div
                    key={t.id}
                    className="cutting-tools-tool-item"
                    onClick={() => handleSelectTool(t.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: isSelected ? '#fff7ed' : '#ffffff',
                      border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Thumbnail Foto Asli */}
                    <div className="cutting-tools-thumb" style={{
                      width: '52px',
                      height: '42px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      flexShrink: 0,
                      border: isSelected ? '1px solid #ea580c' : '1px solid #e2e8f0'
                    }}>
                      <img
                        src={t.images[0].url}
                        alt={t.nama}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.65rem', color: isSelected ? '#c2410c' : '#94a3b8', fontWeight: 800 }}>
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.62rem', color: isSelected ? '#ea580c' : '#64748b', fontWeight: 700 }}>
                            {t.kategoriKey.toUpperCase()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleToolAudio(t);
                            }}
                            style={{
                              background: isSpeaking && currentNarrativeTitle === `Alat: ${t.nama}` ? '#ea580c' : 'rgba(0,0,0,0.06)',
                              color: isSpeaking && currentNarrativeTitle === `Alat: ${t.nama}` ? '#ffffff' : '#64748b',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '0.68rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={`Dengarkan suara materi ${t.nama}`}
                          >
                            {isSpeaking && currentNarrativeTitle === `Alat: ${t.nama}` ? '⏹️' : '🔊'}
                          </button>
                        </div>
                      </div>
                      <div className="cutting-tools-tool-name" style={{
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 800 : 700,
                        color: isSelected ? '#ea580c' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.nama.split('(')[0].trim()}
                      </div>
                      <div className="cutting-tools-tool-eng" style={{
                        fontSize: '0.68rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.namaEng}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Info Box */}
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b' }}>
                <span>💡</span>
                <span>Klik alat untuk membedah foto nyata, anatomi, spesifikasi, dan SOP bengkel.</span>
              </div>
            </div>
          </div>

          {/* MAIN DETAIL VIEW ALAT TERPILIH */}
          <div className="cutting-tools-main" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px', background: '#f8fafc' }}>
            
            {/* CARD 1: HEADER & FOTO NYATA RESOLUSI TINGGI */}
            <div className="cutting-tools-photo-card" style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Header Info */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {currentTool.nama}
                    </h2>
                    <span style={{
                      background: '#fff7ed',
                      color: '#c2410c',
                      border: '1px solid #fed7aa',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {currentTool.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    {currentTool.namaEng} • Kategori: <strong style={{ color: '#0f172a' }}>{currentTool.kategori}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Tombol Audio Narator Materi Terpilih */}
                  <button
                    onClick={() => handleToggleToolAudio(currentTool)}
                    style={{
                      background: isSpeakingCurrentTool ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : '#fff7ed',
                      border: isSpeakingCurrentTool ? '1.5px solid #9a3412' : '1.5px solid #fed7aa',
                      color: isSpeakingCurrentTool ? '#ffffff' : '#c2410c',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isSpeakingCurrentTool ? '0 4px 12px rgba(234, 88, 12, 0.35)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Dengarkan Penjelasan Suara Materi Ini (Inklusi & Gaya Belajar Auditori)"
                  >
                    <span style={{ fontSize: '1.05rem' }}>{isSpeakingCurrentTool ? '⏹️' : '🔊'}</span>
                    <span>{isSpeakingCurrentTool ? 'Hentikan Audio Narator' : 'Dengarkan Penjelasan Suara'}</span>
                  </button>

                  <button
                    onClick={() => setLightboxOpen(true)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#1e293b',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🔍</span> Perbesar Foto Asli
                  </button>
                </div>
              </div>

              {/* Active Audio Narration Banner */}
              {isSpeakingCurrentTool && (
                <div style={{
                  background: '#fff7ed',
                  borderBottom: '1px solid #fed7aa',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span className="sound-wave-bar bar-1" />
                      <span className="sound-wave-bar bar-2" />
                      <span className="sound-wave-bar bar-3" />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c' }}>
                      Audio Narator Inklusi: Membacakan materi {currentTool.nama}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={stopSpeech}
                      style={{
                        background: '#ea580c',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ⏹️ Hentikan Suara
                    </button>
                  </div>
                </div>
              )}

              {/* Showcase Foto Asli */}
              <div className="cutting-tools-photo-grid" style={{ display: 'grid', gridTemplateColumns: currentTool.images.length > 1 ? '1.5fr 1fr' : '1fr', gap: '16px', padding: '20px' }}>
                
                {/* Foto Utama */}
                <div className="cutting-tools-photo-box" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    className="cutting-tools-photo-img"
                    src={currentTool.images[selectedImageIndex]?.url || currentTool.images[0].url}
                    alt={currentTool.nama}
                    onClick={() => setLightboxOpen(true)}
                    style={{
                      width: '100%',
                      maxHeight: '440px',
                      objectFit: 'contain',
                      display: 'block',
                      cursor: 'zoom-in',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                  
                  {/* Watermark/Badge Asli */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #bae6fd',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <span>📷</span> FOTO ASLI BENGKEL & INDUSTRI
                  </div>

                  {/* Caption Foto */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)',
                    padding: '24px 16px 10px 16px',
                    color: '#0f172a'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentTool.images[selectedImageIndex]?.title}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: '2px' }}>
                      {currentTool.images[selectedImageIndex]?.desc}
                    </div>
                  </div>
                </div>

                {/* Kolom Samping: Thumbnail Multi-View & Deskripsi Singkat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Pilihan Thumbnail Foto Alternatif (Jika Ada) */}
                  {currentTool.images.length > 1 && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
                        SUDUT FOTO REALISTIS TAMBAHAN:
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {currentTool.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              sound.playClick();
                              setSelectedImageIndex(idx);
                            }}
                            style={{
                              width: '90px',
                              height: '65px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: selectedImageIndex === idx ? '2px solid #ea580c' : '1px solid #cbd5e1',
                              opacity: selectedImageIndex === idx ? 1 : 0.7,
                              transition: 'all 0.15s'
                            }}
                          >
                            <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Penjelasan Ringkas & Prinsip */}
                  <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Peran & Fungsi di Bengkel:
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#0f172a', lineHeight: 1.55, margin: 0 }}>
                      {currentTool.deskripsiLengkap}
                    </p>
                  </div>

                  <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', marginBottom: '4px' }}>
                      ⚙️ Mekanisme / Prinsip Pemotongan:
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#7c2d12', lineHeight: 1.5, margin: 0 }}>
                      {currentTool.prinsipKerja}
                    </p>
                  </div>

                  {/* Tombol Pintas ke Anatomi Ber-Pin */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      document.getElementById('anatomy-interactive-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      padding: '11px 16px',
                      background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(234, 88, 12, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🧩</span> Tunjukkan Posisi Bagian Alat Pada Foto Mesin (Pin Interaktif) ↓
                  </button>

                </div>

              </div>
            </div>

            {/* CARD 2: ANATOMI & KOMPONEN UTAMA ALAT (IDENTIFIKASI FISIK LANGSUNG DI FOTO) */}
            <div
              id="anatomy-interactive-section"
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <style>{`
                @keyframes pinPulse {
                  0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.8); }
                  70% { transform: translate(-50%, -50%) scale(1.18); box-shadow: 0 0 0 14px rgba(234, 88, 12, 0); }
                  100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
                }
                @keyframes calloutFloat {
                  0% { opacity: 0; transform: translateX(-50%) translateY(6px); }
                  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .anatomy-part-card {
                  transition: all 0.2s ease;
                }
                .anatomy-part-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }
              `}</style>

              {/* Header Bagian Anatomi */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🧩</span> Anatomi & Komponen Fisik Mesin
                    </h3>
                    <span style={{
                      background: '#fff7ed',
                      color: '#ea580c',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #fed7aa'
                    }}>
                      Visual Pin Interaktif
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Arahkan kursor atau klik nomor pin langsung pada foto alat nyata di bawah ini untuk melihat letak fisik komponen dan penerapannya di bengkel:
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowAllPins(!showAllPins);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      background: showAllPins ? '#f8fafc' : '#0f172a',
                      color: showAllPins ? '#334155' : '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{showAllPins ? '👁️' : '🎯'}</span>
                    {showAllPins ? 'Sembunyikan Pin' : 'Tampilkan Semua Pin'}
                  </button>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, background: '#f1f5f9', padding: '6px 10px', borderRadius: '7px' }}>
                    {currentTool.komponen.length} Bagian Fisik
                  </span>
                </div>
              </div>

              {/* Selector Bar: Pills Cepat Pemilih Komponen */}
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '14px'
              }}>
                {currentTool.komponen.map((komp, idx) => {
                  const isSelected = activeKomponenIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        setActiveKomponenIdx(idx);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                        background: isSelected ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#334155',
                        fontSize: '0.74rem',
                        fontWeight: isSelected ? 900 : 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '0.65rem'
                      }}>
                        {komp.no}
                      </span>
                      <span>{komp.nama.split('(')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* CANVAS FOTO REALISTIS DENGAN PIN INTERAKTIF */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  border: '2px solid #fdba74',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img
                  src={currentTool.images[0]?.url}
                  alt={currentTool.nama}
                  style={{
                    width: '100%',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />

                {/* Badge Penjelas di Atas Foto */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.88)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  zIndex: 20
                }}>
                  <span>📍</span> KLIK NOMOR PIN PADA FOTO UNTUK MELIHAT PENERAPAN BAGIANNYA
                </div>

                {/* Overlay Pin Interaktif */}
                {showAllPins && currentTool.komponen.map((komp, idx) => {
                  const isSelected = activeKomponenIdx === idx;
                  const isHovered = hoveredPinIdx === idx;
                  const posX = komp.pinPos?.x ?? 50;
                  const posY = komp.pinPos?.y ?? 50;
                  const calloutAbove = posY > 38;

                  return (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${posX}%`,
                        top: `${posY}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 30 : (isHovered ? 25 : 15)
                      }}
                    >
                      {/* Outer Pulse Wave Ring */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            border: '2.5px solid #ea580c',
                            animation: 'pinPulse 2s infinite ease-out',
                            pointerEvents: 'none'
                          }}
                        />
                      )}

                      {/* Pin Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setActiveKomponenIdx(idx);
                        }}
                        onMouseEnter={() => setHoveredPinIdx(idx)}
                        onMouseLeave={() => setHoveredPinIdx(null)}
                        style={{
                          width: isSelected ? '34px' : '28px',
                          height: isSelected ? '34px' : '28px',
                          borderRadius: '50%',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #f97316, #ea580c)' 
                            : 'rgba(15, 23, 42, 0.92)',
                          color: '#ffffff',
                          border: isSelected ? '2.5px solid #ffffff' : '2px solid #ea580c',
                          boxShadow: isSelected 
                            ? '0 0 18px rgba(234, 88, 12, 0.95), 0 4px 10px rgba(0,0,0,0.5)' 
                            : '0 2px 8px rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isSelected ? '0.74rem' : '0.66rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transform: isSelected ? 'scale(1.15)' : (isHovered ? 'scale(1.1)' : 'scale(1)')
                        }}
                      >
                        {komp.no}
                      </button>

                      {/* Floating Tooltip Callout on Pin */}
                      {(isSelected || isHovered) && (
                        <div
                          style={{
                            position: 'absolute',
                            [calloutAbove ? 'bottom' : 'top']: '40px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '260px',
                            background: 'rgba(15, 23, 42, 0.96)',
                            color: '#ffffff',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1.5px rgba(234, 88, 12, 0.5)',
                            textAlign: 'left',
                            zIndex: 40,
                            pointerEvents: 'none',
                            animation: 'calloutFloat 0.2s ease-out'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                            <span style={{
                              background: '#ea580c',
                              color: '#fff',
                              fontSize: '0.64rem',
                              fontWeight: 900,
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              {komp.no}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {komp.nama}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#fed7aa', fontWeight: 800, marginBottom: '4px', lineHeight: 1.3 }}>
                            📍 {komp.lokasiFisik}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                            ⚙️ {komp.desc}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* INSPECTOR SPOTLIGHT BAR: DETAIL LENGKAP KOMPONEN TERPILIH */}
              <div style={{
                marginTop: '16px',
                background: '#fff7ed',
                borderRadius: '12px',
                border: '1.5px solid #fdba74',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 10px rgba(234, 88, 12, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                    }}>
                      Bagian No. {currentTool.komponen[activeKomponenIdx]?.no || '01'}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#9a3412' }}>
                      {currentTool.komponen[activeKomponenIdx]?.nama}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ea580c',
                    background: '#ffedd5',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #fed7aa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span>🎯</span> Ditunjuk Pada Pin Foto di Atas
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '12px' }}>
                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>📍</span> Letak Fisik Pada Gambar Mesin:
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.45 }}>
                      {currentTool.komponen[activeKomponenIdx]?.lokasiFisik}
                    </div>
                  </div>
                  
                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>⚙️</span> Fungsi & Penerapan di Bengkel:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                      {currentTool.komponen[activeKomponenIdx]?.desc}
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID 6 KARTU KOMPONEN DENGAN SINKRONISASI DUA ARAH */}
              <div style={{ marginTop: '18px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Daftar Seluruh Komponen Fisik (Klik kartu untuk menyorot pin di gambar):
                </div>
                <div className="cutting-tools-anatomy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {currentTool.komponen.map((komp, idx) => {
                    const isSelected = activeKomponenIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="anatomy-part-card"
                        onClick={() => {
                          sound.playClick();
                          setActiveKomponenIdx(idx);
                        }}
                        style={{
                          background: isSelected ? '#fff7ed' : '#f8fafc',
                          borderRadius: '10px',
                          padding: '14px',
                          border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 4px 14px rgba(234, 88, 12, 0.16)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              background: isSelected 
                                ? 'linear-gradient(135deg, #f97316, #ea580c)' 
                                : '#e2e8f0',
                              color: isSelected ? '#ffffff' : '#334155',
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}>
                              {komp.no}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? '#9a3412' : '#0f172a' }}>
                              {komp.nama}
                            </span>
                          </div>
                          {isSelected && (
                            <span style={{ fontSize: '0.65rem', background: '#ea580c', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              Ditunjuk 👆
                            </span>
                          )}
                        </div>

                        <div style={{ background: isSelected ? '#ffedd5' : '#ffffff', padding: '6px 10px', borderRadius: '6px', border: isSelected ? '1px solid #fed7aa' : '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c2410c' }}>📍 Letak: </span>
                          <span style={{ fontSize: '0.73rem', color: '#0f172a', fontWeight: 700 }}>
                            {komp.lokasiFisik}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                          {komp.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CARD 3 & 4: SPESIFIKASI TEKNIS INDUSTRI & BENDA KERJA */}
            <div className="cutting-tools-spec-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
              
              {/* Spesifikasi Teknis Standar Industri */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> Spesifikasi Standar Industri
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentTool.spesifikasi.map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: sIdx % 2 === 0 ? '#f8fafc' : '#ffffff',
                        fontSize: '0.76rem',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <span style={{ color: '#64748b' }}>{spec.label}</span>
                      <strong style={{ color: '#0f172a', fontWeight: 800 }}>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benda Kerja & Profil Logam yang Sesuai */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔩</span> Aplikasi Benda Kerja yang Sesuai
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentTool.bendaKerja.map((benda, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.76rem',
                          color: '#1e293b'
                        }}
                      >
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                        <span>{benda}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '2px' }}>
                    💡 Standar Kurikulum SMK:
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#1e40af' }}>
                    Kompetensi Dasar (KD) Pengoperasian Alat Pemotong Pemesinan & Fabrikasi Logam Kelas X & XI Teknik Pemesinan.
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 5: STANDAR OPERASIONAL PROSEDUR (SOP) LANGKAH KERJA NYATA */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Standar Operasional Prosedur (SOP) Pengoperasian di Bengkel
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 16px 0' }}>
                Urutan instruksi kerja baku bengkel pemesinan dari persiapan awal, pencekaman, pemotongan, hingga perawatan
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentTool.sopKerja.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      background: '#f8fafc',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#fff7ed',
                      color: '#ea580c',
                      border: '1px solid #fed7aa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      flexShrink: 0
                    }}>
                      {sIdx + 1}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.55 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 6: KESELAMATAN KERJA (K3) & BAHAYA YANG HARUS DIHINDARI */}
            <div style={{
              background: '#fef2f2',
              borderRadius: '14px',
              border: '1px solid #fecaca',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                    Peringatan K3 Mutlak untuk {currentTool.nama.split('(')[0].trim()}
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#991b1b', margin: 0 }}>
                    Patuhi prosedur keselamatan berikut untuk mencegah insiden kecelakaan kerja di bengkel
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
                {currentTool.k3Penting.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      background: '#ffffff',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      borderLeft: '4px solid #ef4444',
                      border: '1px solid #fee2e2',
                      fontSize: '0.75rem',
                      color: '#991b1b',
                      lineHeight: 1.5
                    }}
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================================
          VIEW 2: TEORI & STANDARISASI PEMOTONGAN (RUMUS & TABEL)
          ===================================================================== */}
      {labTab === 'materi' && (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc' }}>
          
          {/* Header Teori */}
          <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              📐 Rumus Baku & Standarisasi Parameter Pemotongan Logam
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Kompilasi rumus teknis permesinan, kecepatan potong (Cutting Speed), aturan pemilihan TPI gergaji, dan tabel tap drill sizing.
            </p>
          </div>

          {/* KALKULATOR INTERAKTIF RPM BOR NYATA */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#c2410c', margin: 0 }}>
                  🔢 Kalkulator Putaran Spindel Bor (N = (1000 × Cs) / (π × d))
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Hitung RPM ideal mata bor HSS pada mesin bor bangku untuk mencegah mata bor gosong atau tumpul
                </p>
              </div>

              <div style={{
                background: '#fff7ed',
                border: '1.5px solid #ea580c',
                padding: '8px 18px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.65rem', color: '#9a3412', textTransform: 'uppercase', fontWeight: 800 }}>RPM Rekomendasi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c2410c' }}>
                  {calculatedRPM} <span style={{ fontSize: '0.8rem', color: '#ea580c' }}>RPM</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                  Pilih Material Benda Kerja:
                </label>
                <select
                  value={calcCs}
                  onChange={(e) => setCalcCs(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <option value={25}>Baja Karbon Rendah (ST37) — Cs = 25 m/min</option>
                  <option value={18}>Baja Karbon Sedang (S45C) — Cs = 18 m/min</option>
                  <option value={60}>Aluminium Paduan — Cs = 60 m/min</option>
                  <option value={40}>Kuningan (Brass) — Cs = 40 m/min</option>
                  <option value={14}>Stainless Steel 304 — Cs = 14 m/min</option>
                  <option value={20}>Besi Cor (Cast Iron) — Cs = 20 m/min</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Diameter Mata Bor (d):</span>
                  <span style={{ color: '#ea580c' }}>{calcDia} mm</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={calcDia}
                  onChange={(e) => setCalcDia(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                  <span>Ø 2 mm</span>
                  <span>Ø 15 mm</span>
                  <span>Ø 30 mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL PANDUAN PENTING */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            
            {/* Tabel Ukuran Bor Tap Metrik */}
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7', margin: '0 0 10px 0' }}>
                🔩 Tabel Tap Drill Size (Standar ISO Metrik)
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 10px 0' }}>
                Gunakan rumus: <strong>D_bor = D_nominal - Pitch</strong>
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                    <th style={{ padding: '8px 10px' }}>Ukuran Ulir</th>
                    <th style={{ padding: '8px 10px' }}>Kisar (Pitch)</th>
                    <th style={{ padding: '8px 10px' }}>Diameter Bor Tap</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { th: 'M3', p: '0.5 mm', d: '2.5 mm' },
                    { th: 'M4', p: '0.7 mm', d: '3.3 mm' },
                    { th: 'M5', p: '0.8 mm', d: '4.2 mm' },
                    { th: 'M6', p: '1.0 mm', d: '5.0 mm' },
                    { th: 'M8', p: '1.25 mm', d: '6.8 mm' },
                    { th: 'M10', p: '1.5 mm', d: '8.5 mm' },
                    { th: 'M12', p: '1.75 mm', d: '10.2 mm' },
                    { th: 'M16', p: '2.0 mm', d: '14.0 mm' }
                  ].map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0f172a' }}>{row.th}</td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>{row.p}</td>
                      <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 800 }}>Ø {row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aturan Pemilihan TPI Gergaji Besi */}
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c', margin: '0 0 10px 0' }}>
                🪚 Panduan Pemilihan TPI Bilah Gergaji Besi
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 10px 0' }}>
                TPI = Teeth Per Inch (Jumlah gigi per inci panjang bilah gergaji).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { tpi: '4 - 6 TPI (Gigi Kasar)', tebal: 'Material tebal > 50 mm, batang pejal as besar', desc: 'Pembuangan tatal cepat pada logam lunak dan penampang besar.' },
                  { tpi: '8 - 10 TPI (Gigi Sedang)', tebal: 'Material tebal 15 - 50 mm, profil siku, kanal', desc: 'Serbaguna untuk pemotongan profil baja umum di bengkel.' },
                  { tpi: '14 TPI (Gigi Halus Standar)', tebal: 'Material tebal 6 - 15 mm, pipa hollow tebal', desc: 'Standar umum power hacksaw dan horizontal bandsaw bengkel SMK.' },
                  { tpi: '18 - 24 TPI (Gigi Sangat Halus)', tebal: 'Material tipis < 6 mm, pipa tipis, pelat sheet', desc: 'Mencegah gigi rontok saat menyayat penampang tipis (rule of 3 teeth).' }
                ].map((item, iIdx) => (
                  <div key={iIdx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                      <span style={{ color: '#ea580c' }}>{item.tpi}</span>
                      <span style={{ color: '#64748b', fontSize: '0.68rem' }}>{item.tebal}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================================
          VIEW 3: SOP & KESELAMATAN KERJA (K3)
          ===================================================================== */}
      {labTab === 'safety' && (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc' }}>
          
          <div style={{
            background: '#fef2f2',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.04)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626', margin: '0 0 6px 0' }}>
              🛡️ Keselamatan dan Kesehatan Kerja (K3) Pemotongan Logam
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>
              Mesin dan perkakas pemotong bertenaga menyimpan energi kinetik tinggi, putaran puluhan ribu RPM, gaya tekan puluhan ton, dan percikan api bersuhu &gt; 1000°C. Kepatuhan K3 adalah harga mati bagi setiap teknisi dan siswa teknik mesin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🥽</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                1. Pelindung Mata & Wajah (ANSI Z87.1)
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Wajib mengenakan safety glasses dengan pelindung samping atau face shield penuh saat menggerinda atau memotong. Serpihan batu abrasif atau tatal panas dapat menyebabkan kebutaan permanen.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🚫🧤</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#dc2626', margin: '0 0 6px 0' }}>
                2. Aturan Sarung Tangan pada Mesin Putar
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                <strong>DILARANG KERAS</strong> memakai sarung tangan kain longgar saat mengoperasikan mesin bor, mesin bubut, atau reamer putar. Sarung tangan kulit HANYA digunakan saat mengangkat pelat tajam atau menggerinda.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🛑</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                3. Pencekaman Benda Kerja Mutlak
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Jangan pernah memegang benda kerja pelat atau pipa dengan tangan telanjang saat dibor atau dipotong. Selalu gunakan ragum meja, tang buaya (vice grip), atau klem C yang kokoh.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔇</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                4. Pelindung Pendengaran (Ear Muff)
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Kebisingan gerinda potong dan mesin guillotine dapat melampaui 95 dB. Gunakan ear plug atau ear muff untuk mencegah gangguan pendengaran kronis (Noise-Induced Hearing Loss).
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔥</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                5. Manajemen Bahaya Kebakaran
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Bersihkan area kerja radius 5 meter dari bahan mudah terbakar (kain majun berminyak, tiner cat, tabung elpiji/asetilen). Siapkan tabung APAR (Alat Pemadam Api Ringan) kelas ABC yang siap pakai.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🧹</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                6. Penanganan Tatal & Bram Tajam
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Gunakan kuas atau pengait tatal khusus untuk membersihkan tatal spiral mesin bor atau gerigi tatal gergaji. Jangan pernah menyeka tatal dengan telapak tangan atau meniupnya dengan angin kompresor ke arah orang lain.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================================
          VIEW 4: KUIS ASESMEN KOMPREHENSIF (10 SOAL • 1000 XP)
          ===================================================================== */}
      {labTab === 'quiz' && (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc' }}>
          
          {/* Header Kuis */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                🎯 Kuis Evaluasi Pemahaman Alat Pemotong & Perkakas
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Uji pengetahuan Anda tentang pengenalan foto alat, fungsi, spesifikasi, dan SOP K3 (10 Soal • 1000 XP).
              </p>
            </div>

            {quizSubmitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: calculateScore() >= 700 ? '#16a34a' : '#dc2626'
                }}>
                  Skor Anda: {calculateScore()} / 1000 XP
                </div>
                <button
                  disabled={xpClaimed || calculateScore() < 700}
                  onClick={handleClaimXP}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 900,
                    cursor: xpClaimed || calculateScore() < 700 ? 'not-allowed' : 'pointer',
                    background: xpClaimed ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {xpClaimed ? '✓ 1000 XP Telah Diklaim' : 'Klaim 1000 XP Sekarang'}
                </button>
              </div>
            )}
          </div>

          {/* Daftar Soal Kuis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {QUIZ_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  {idx + 1}. {q.question}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[q.id] === optIdx;
                    const isCorrect = q.correct === optIdx;
                    let btnBg = '#f8fafc';
                    let btnBorder = '1px solid #cbd5e1';
                    let btnColor = '#334155';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnBg = '#f0fdf4';
                        btnBorder = '1.5px solid #16a34a';
                        btnColor = '#15803d';
                      } else if (isSelected && !isCorrect) {
                        btnBg = '#fef2f2';
                        btnBorder = '1.5px solid #dc2626';
                        btnColor = '#b91c1c';
                      }
                    } else if (isSelected) {
                      btnBg = '#fff7ed';
                      btnBorder = '1.5px solid #ea580c';
                      btnColor = '#c2410c';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleQuizSelect(q.id, optIdx)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: btnBorder,
                          background: btnBg,
                          color: btnColor,
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '0.76rem',
                          textAlign: 'left',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.1s'
                        }}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div style={{ marginTop: '12px', background: '#f0f9ff', padding: '10px 14px', borderRadius: '6px', fontSize: '0.74rem', color: '#334155', borderLeft: '4px solid #0284c7' }}>
                    <strong style={{ color: '#0284c7' }}>💡 Pembahasan:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <button
                onClick={handleQuizSubmit}
                style={{
                  padding: '12px 34px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                }}
              >
                SUBMIT JAWABAN & SELESAIKAN EVALUASI (1000 XP)
              </button>
            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          LIGHTBOX MODAL UNTUK PERBESARAN FOTO ASLI UKURAN PENUH
          ===================================================================== */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 900,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            
            <img
              className="lightbox-img"
              src={currentTool.images[selectedImageIndex]?.url || currentTool.images[0].url}
              alt={currentTool.nama}
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
              }}
            />

            <div style={{ marginTop: '12px', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>
                {currentTool.nama} — {currentTool.images[selectedImageIndex]?.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                {currentTool.images[selectedImageIndex]?.desc}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CuttingToolsLab;
