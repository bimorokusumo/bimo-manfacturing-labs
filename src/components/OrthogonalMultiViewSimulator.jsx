import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../utils/audio';

// ==========================================
// 1. DEFINISI 8 BENDA STANDAR PROYEK/TUGAS SMK
// ==========================================
export const OBJECT_CATALOG = {
  stepped_l: {
    id: 'stepped_l',
    name: '1. Balok Tangga Berlubang Bor (Stepped L-Block with Bore Hole)',
    shortName: 'Balok Tangga Berlubang',
    difficulty: 'Tingkat Dasar (Frais & Bor)',
    category: 'Prismatik Bertingkat & Lubang',
    desc: 'Job sheet dasar mesin frais dan mesin bor bangku. Balok berundak huruf L dengan lubang silinder tembus vertikal di bagian anak tangga bawah.',
    dimensions: '40 x 36 x 30 mm (Lubang Ø12 mm)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan kontur utama huruf "L" berundak dengan garis putus-putus (garis gores tersembunyi) lubang bor vertikal.',
        features: [
          'Kontur huruf "L" terlihat ukuran nyata (True Shape)',
          'Lubang bor tembus vertikal ditunjukkan dengan 2 garis putus-putus (hidden lines)',
          'Garis sumbu merah strip-titik di tengah lubang bor'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari sisi kanan: Terlihat bidang persegi panjang tegak penuh (30 x 36 mm) dengan garis pembatas undakan di Y=18 mm.',
        features: [
          'Garis horizontal nyata pada Y=18 mm menandai batas anak tangga',
          'Dua garis putus-putus vertikal menunjukkan lubang bor di bagian undakan bawah',
          'Garis sumbu vertikal di tengah bidang'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Terlihat 2 bidang persegi panjang berdampingan, di mana bidang undak bawah memiliki lingkaran lubang bor.',
        features: [
          'Lingkaran lubang bor Ø12 mm tampak jelas nyata di undakan bawah',
          'Tanda garis sumbu silang (+) tepat di pusat lingkaran lubang',
          'Garis batas pemisah antara undakan atas dan undakan bawah'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari sisi kiri: Terlihat punggung balok tegak utuh. Undakan dan lubang bor berada di belakang (tersembunyi).',
        features: [
          'Bidang punggung luar persegi panjang 30 x 36 mm utuh',
          'Garis horizontal putus-putus menandai batas undakan di belakangnya',
          'Garis vertikal putus-putus menandai lubang bor tersembunyi'
        ]
      }
    }
  },
  t_slot_base: {
    id: 't_slot_base',
    name: '2. Balok Meja Alur-T (T-Slot Machine Bed Plate)',
    shortName: 'Balok Meja Alur-T',
    difficulty: 'Tingkat Menengah (Meja Frais)',
    category: 'Prismatik Beralur T (ISO 299)',
    desc: 'Komponen meja mesin frais standar industri. Memiliki alur T tembus yang terdiri dari leher alur sempit di atas dan rongga pelebaran di bawah untuk kepala baut T-bolt.',
    dimensions: '40 x 30 x 32 mm (Standar Alur T)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan profil penampang alur T secara utuh dan nyata (True Shape of T-Slot).',
        features: [
          'Bentuk kontur huruf T terbalik di tengah balok',
          'Leher alur atas selebar 12 mm dan rongga bawah selebar 24 mm',
          'Garis sumbu vertikal simetris strip-titik di tengah alur'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Kotak luar persegi panjang (32 x 30 mm) dengan 2 tingkat garis putus-putus kedalaman alur T.',
        features: [
          'Garis putus-putus atas menandai batas kedalaman leher alur',
          'Garis putus-putus bawah menandai dasar rongga alur T',
          'Membuktikan prinsip proyeksi rongga tembus dari samping'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Terlihat alur memanjang dengan garis nyata untuk celah leher dan garis putus-putus untuk rongga bawah.',
        features: [
          'Dua garis kontinu nyata menandai celah mulut alur selebar 12 mm',
          'Dua garis putus-putus di sisi luar celah menandai rongga tersembunyi selebar 24 mm',
          'Garis sumbu memanjang di tengah benda'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Simetris sempurna dengan pandangan kanan karena benda bersifat tembus sepanjang sumbu Z.',
        features: [
          'Bentuk persegi panjang luar 32 x 30 mm',
          'Garis tersembunyi (hidden dashed) leher dan rongga alur T'
        ]
      }
    }
  },
  v_block: {
    id: 'v_block',
    name: '3. Blok V Presisi Pencekam Poros (Precision V-Block)',
    shortName: 'Blok V Pencekam Poros',
    difficulty: 'Tingkat Menengah (Job Bubut/Bangku)',
    category: 'Perkakas Presisi Pencekam 90°',
    desc: 'Peralatan standar pencekam silinder poros saat kerja bangku atau pengukuran dengan sudut takik V 90° dan alur jepit samping (side clamping slots).',
    dimensions: '44 x 36 x 32 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan sudut takik V 90 derajat simetris di bagian atas dan alur pencekam klem di kedua sisi luar.',
        features: [
          'Takik sudut V 90° simetris tepat di sumbu tengah',
          '2 alur jepit klem samping (clamping slots) di sisi kiri & kanan',
          'Garis sumbu vertikal simetris di tengah'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak profil alur klem samping dan garis putus-putus penanda titik terendah lembah V di tengah.',
        features: [
          'Bentuk bidang sisi luar dengan alur klem tampak melintang',
          'Garis putus-putus (hidden line) dasar lembah takik V di tengah',
          'Bidang samping 32 x 36 mm'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Kedua lereng miring takik V bertemu pada sebuah garis lurus di garis sumbu tengah.',
        features: [
          'Garis tengah memanjang menandai pertemuan dasar takik V',
          'Dua bidang miring V tampak simetris memendek',
          'Alur klem samping tampak memanjang di tepi luar'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Menyerupai pandangan kanan karena benda bersifat simetris kiri-kanan.',
        features: [
          'Profil alur klem samping kiri',
          'Garis putus-putus dasar takik V'
        ]
      }
    }
  },
  bearing_pillow: {
    id: 'bearing_pillow',
    name: '4. Rumah Bantalan Poros (Bearing Pillow Block)',
    shortName: 'Rumah Bantalan Poros',
    difficulty: 'Tingkat Lanjutan (Komponen Mesin)',
    category: 'Elemen Penumpu Transmisi Poros',
    desc: 'Komponen penumpu poros berputar dengan lubang silinder bantalan di tengah atas dan tapak bawah berpaha baut (flange base) pengikat rangka mesin.',
    dimensions: '54 x 36 x 30 mm (Bore Ø18 mm)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan kubah lengkung atas dengan lubang lingkaran poros tembus di tengah serta sayap tapak kiri-kanan.',
        features: [
          'Lingkaran lubang poros Ø18 mm tampak nyata dengan garis sumbu silang (+)',
          'Kubah silinder atas bersambung ke tapak bawah',
          'Dua garis putus-putus vertikal untuk lubang baut pengikat di sayap tapak'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Menampilkan penampang samping berbentuk huruf T terbalik dengan lubang poros melintang.',
        features: [
          'Bentuk silinder penumpu tegak di atas pelat tapak horizontal',
          'Dua garis putus-putus horizontal menunjukkan lubang poros tembus',
          'Garis sumbu horizontal merah di pusat poros'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Tapak memanjang dengan 2 lingkaran lubang baut di kiri-kanan dan proyeksi kubah silinder di tengah.',
        features: [
          'Dua lingkaran lubang baut pengikat di kedua sayap tapak',
          'Kubah silinder tampak sebagai persegi panjang di tengah',
          'Dua garis putus-putus memanjang untuk lubang poros tembus di bawahnya'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Sama dengan pandangan kanan karena lubang poros melintang tembus simetris.',
        features: [
          'Profil T terbalik penopang bantalan',
          'Garis putus-putus lubang poros melintang'
        ]
      }
    }
  },
  bracket_gusset: {
    id: 'bracket_gusset',
    name: '5. Braket Siku Bersirip & Berlubang (Angle Bracket with Rib)',
    shortName: 'Braket Siku Bersirip',
    difficulty: 'Tingkat Menengah (Fabrikasi Mesin)',
    category: 'Konstruksi Pelat Siku 90°',
    desc: 'Dudukan siku L 90 derajat yang diperkuat sirip segitiga (gusset rib) di tengah dan dilengkapi lubang baut pengikat di pelat dasar dan pelat tegak.',
    dimensions: '42 x 36 x 30 mm (Sirip 6 mm)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan profil siku-L dengan sirip segitiga penguat di sudut dalamnya serta lubang baut tersembunyi.',
        features: [
          'Profil pelat siku L tebal 8 mm',
          'Segitiga sirip penguat (rib) di sudut dalam',
          'Garis putus-putus untuk lubang baut di pelat dasar dan pelat tegak'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak pelat belakang vertikal dengan lingkaran lubang baut dan rusuk miring sirip penguat menonjol ke depan.',
        features: [
          'Lingkaran nyata lubang baut di pelat tegak',
          'Tebal sirip penguat 6 mm di sumbu tengah',
          'Sisi dasar L terlihat menonjol ke depan'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menampilkan pelat dasar horizontal dengan lingkaran lubang baut dan sirip penguat di tengah.',
        features: [
          'Lingkaran nyata lubang baut pengikat dasar',
          'Tebal sirip penguat 6 mm di sumbu tengah',
          'Pelat tegak terlihat sebagai garis tebal 8 mm di belakang'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Menampilkan punggung pelat tegak rata dengan garis putus-putus untuk pelat dasar dan lubang baut.',
        features: [
          'Bidang punggung rata persegi panjang',
          'Garis sembunyi dasar siku dan posisi lubang baut'
        ]
      }
    }
  },
  pipe_flange: {
    id: 'pipe_flange',
    name: '6. Flens Pipa 4 Lubang Baut (4-Bolt Circular Flange)',
    shortName: 'Flens Pipa 4 Baut',
    difficulty: 'Tingkat Lanjutan (Piping & Fitting)',
    category: 'Sambungan Flens Perpipaan',
    desc: 'Flens sambungan pipa melingkar dengan leher poros pipa dan piringan flens dilengkapi 4 lubang baut simetris pada lingkaran jarak bagi (PCD).',
    dimensions: 'Ø50 x 28 mm (PCD Ø36 mm)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan piringan flens bawah dengan leher silinder pipa menjulang di atas serta lubang-lubang tembus.',
        features: [
          'Piringan flens bawah (Ø50 x 8 mm) dan leher pipa atas (Ø28 x 20 mm)',
          'Lubang pipa tengah tembus ditunjukkan garis putus-putus vertikal',
          'Lubang baut kiri-kanan ditunjukkan garis putus-putus dengan garis sumbu merah'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Menyerupai pandangan depan karena benda bersifat simetris putar (silindris).',
        features: [
          'Profil piringan dan leher pipa simetris',
          'Garis putus-putus lubang tembus pipa dan lubang baut depan-belakang',
          'Garis sumbu vertikal di tengah'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menampilkan 3 lingkaran konsentris dan 4 lingkaran lubang baut pada lingkaran pitch PCD.',
        features: [
          'Lingkaran luar flens Ø50 mm, leher Ø28 mm, dan lubang bor Ø16 mm',
          'Lingkaran jarak bagi baut (PCD Ø36 mm) strip-titik merah',
          '4 lingkaran lubang baut berjarak sudut 90° simetris'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Sama persis dengan pandangan kanan dan depan karena geometri berputar 360° simetris.',
        features: [
          'Bentuk silindris bertingkat',
          'Garis putus-putus lubang pipa & baut'
        ]
      }
    }
  },
  stepped_shaft: {
    id: 'stepped_shaft',
    name: '7. Poros Bubut Bertingkat & Alur Pasak (Stepped Shaft)',
    shortName: 'Poros Bertingkat & Pasak',
    difficulty: 'Tingkat Menengah (Job Mesin Bubut)',
    category: 'Benda Putar Transmisi Daya',
    desc: 'Poros transmisi daya 2 tingkat diameter (Ø32 mm & Ø20 mm) dengan alur pasak pengunci roda gigi (spurring keyway) hasil frais.',
    dimensions: 'Ø32/Ø20 x 52 mm (Pasak 5x3 mm)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan dua silinder bertingkat sejajar horizontal dengan takik alur pasak di bagian puncak poros kecil.',
        features: [
          'Silinder besar Ø32 x 26 mm di kiri dan silinder kecil Ø20 x 26 mm di kanan',
          'Takik alur pasak persegi kedalaman 3 mm di puncak poros kecil',
          'Garis sumbu horizontal strip-titik merah di sepanjang pusat poros'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Menampilkan LINGKARAN KONSENTRIS (lingkaran Ø20 di dalam lingkaran Ø32) dengan takik pasak di atas.',
        features: [
          'Dua lingkaran konsentris bertumpuk nyata',
          'Takik alur pasak persegi 5 x 3 mm di puncak lingkaran kecil',
          'Dua garis sumbu bersilang (Center mark +) di pusat lingkaran'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menyerupai pandangan depan, namun alur pasak tampak sebagai persegi panjang memanjang di poros kecil.',
        features: [
          'Dua tingkat silinder tampak sebagai persegi panjang berdampingan',
          'Alur pasak tampak dari atas selebar 5 mm sepanjang 16 mm',
          'Garis sumbu horizontal memanjang'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Lingkaran besar Ø32 menutupi lingkaran kecil di belakangnya (lingkaran kecil diwakili garis putus-putus).',
        features: [
          'Lingkaran luar Ø32 mm terlihat nyata',
          'Lingkaran kecil Ø20 mm dan alur pasak tersembunyi (garis putus-putus)',
          'Garis sumbu silang (+)'
        ]
      }
    }
  },
  dovetail_block: {
    id: 'dovetail_block',
    name: '8. Balok Peluncur Ekor Burung (Dovetail Slide Guide)',
    shortName: 'Balok Ekor Burung (Slide)',
    difficulty: 'Tingkat Lanjutan (Eretan Mesin Frais)',
    category: 'Mekanisme Luncur Sudut 60°',
    desc: 'Balok pemandu rel eretan mesin frais atau mesin bubut dengan profil trapesium terbalik bersudut 60 derajat dan alur oli pelumas di tengah.',
    dimensions: '44 x 28 x 35 mm (Rel 60°)',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan lidah ekor burung (trapesium) bersudut 60 derajat di atas landasan balok dengan takik alur oli pelumas di tengah.',
        features: [
          'Bentuk baji ekor burung bersudut 60° simetris',
          'Takik alur pelumas oli 4 x 2 mm di puncak lidah',
          'Balok landasan tebal 14 mm di bagian bawah'
        ]
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak bidang luar persegi panjang dengan garis horizontal pemisah dan garis putus-putus alur oli.',
        features: [
          'Dua persegi panjang bertumpuk (tinggi landasan dan tinggi lidah ekor burung)',
          'Garis putus-putus horizontal untuk kedalaman alur oli pelumas',
          'Dimensi samping 35 x 28 mm'
        ]
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menampilkan rel lidah ekor burung dengan alur oli pelumas memanjang di tengahnya.',
        features: [
          'Alur oli pelumas memanjang di sumbu tengah',
          'Dua garis batas lereng miring ekor burung',
          'Dua sayap bidang landasan bawah di samping kanan-kiri'
        ]
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Sama persis dengan pandangan kanan karena benda bersifat simetris tembus.',
        features: [
          'Persegi panjang dengan garis horizontal pemisah landasan',
          'Garis putus-putus kedalaman alur pelumas'
        ]
      }
    }
  }
};

// ==========================================
// 2. DIAGRAM 2D ORTOGONAL SVG UNTUK SEMUA 8 BENDA
// ==========================================
export const renderOrthogonal2DView = (objectId, viewName, size = 120, showDetails = false) => {
  const vb = "0 0 140 140";
  const solidColor = "#0f172a";
  const hiddenColor = "#ea580c";
  const centerColor = "#dc2626";
  const fillColor = "#f8fafc";
  const highlightFill = "#eff6ff";
  const fillAccent = "#e0e7ff";

  switch (objectId) {
    // ----------------------------------------
    // 1. STEPPED L-BLOCK WITH BORE HOLE
    // ----------------------------------------
    case 'stepped_l': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <polygon points="25,120 115,120 115,75 70,75 70,25 25,25" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="92.5" y1="65" x2="92.5" y2="130" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            <line x1="82" y1="75" x2="82" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="103" y1="75" x2="103" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            {showDetails && <text x="47" y="60" fontSize="9" fontWeight="800" fill="#1e40af">Undak Atas</text>}
            {showDetails && <text x="92.5" y="102" fontSize="8" fontWeight="800" textAnchor="middle" fill="#c2410c">Ø12 (Gores)</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="25" y="35" width="90" height="70" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="70" y1="35" x2="70" y2="105" stroke={solidColor} strokeWidth="2.2" />
            <circle cx="92.5" cy="70" r="11" fill="#ffffff" stroke={solidColor} strokeWidth="2.2" />
            <line x1="77" y1="70" x2="108" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="6 2 2 2" />
            <line x1="92.5" y1="54" x2="92.5" y2="86" stroke={centerColor} strokeWidth="1.2" strokeDasharray="6 2 2 2" />
            {showDetails && <text x="47" y="73" fontSize="9" fontWeight="800" textAnchor="middle" fill="#1e40af">Puncak</text>}
            {showDetails && <text x="92.5" y="96" fontSize="8" fontWeight="800" textAnchor="middle" fill="#047857">Ø12 Bor</text>}
          </svg>
        );
      }
      if (viewName === 'kanan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="35" y="25" width="70" height="95" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="35" y1="75" x2="105" y2="75" stroke={solidColor} strokeWidth="2.2" />
            <line x1="70" y1="65" x2="70" y2="130" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            <line x1="59" y1="75" x2="59" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="81" y1="75" x2="81" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            {showDetails && <text x="70" y="55" fontSize="9" fontWeight="800" textAnchor="middle" fill="#1e40af">Tampak Atas</text>}
          </svg>
        );
      }
      // kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <rect x="35" y="25" width="70" height="95" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          <line x1="35" y1="75" x2="105" y2="75" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="70" y1="65" x2="70" y2="130" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
          <line x1="59" y1="75" x2="59" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="81" y1="75" x2="81" y2="120" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          {showDetails && <text x="70" y="55" fontSize="9" fontWeight="800" textAnchor="middle" fill="#64748b">Punggung Rata</text>}
        </svg>
      );
    }

    // ----------------------------------------
    // 2. T-SLOT BASE PLATE
    // ----------------------------------------
    case 't_slot_base': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <polygon points="25,35 58,35 58,55 44,55 44,78 96,78 96,55 82,55 82,35 115,35 115,115 25,115" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="70" y1="25" x2="70" y2="125" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="70" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0f172a">Alur T ISO</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="25" y="30" width="90" height="80" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="58" y1="30" x2="58" y2="110" stroke={solidColor} strokeWidth="2.2" />
            <line x1="82" y1="30" x2="82" y2="110" stroke={solidColor} strokeWidth="2.2" />
            <line x1="44" y1="30" x2="44" y2="110" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="96" y1="30" x2="96" y2="110" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="70" y1="20" x2="70" y2="120" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="73" fontSize="8" fontWeight="800" textAnchor="middle" fill="#2563eb">Celah Leher 12mm</text>}
          </svg>
        );
      }
      // kanan & kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <rect x="30" y="35" width="80" height="80" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          <line x1="30" y1="55" x2="110" y2="55" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="30" y1="78" x2="110" y2="78" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          {showDetails && <text x="70" y="50" fontSize="8" fontWeight="800" textAnchor="middle" fill="#c2410c">Leher Alur (Gores)</text>}
          {showDetails && <text x="70" y="73" fontSize="8" fontWeight="800" textAnchor="middle" fill="#c2410c">Dasar Alur T</text>}
        </svg>
      );
    }

    // ----------------------------------------
    // 3. PRECISION V-BLOCK
    // ----------------------------------------
    case 'v_block': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <polygon points="25,35 48,35 70,68 92,35 115,35 115,62 105,62 105,82 115,82 115,115 25,115 25,82 35,82 35,62 25,62" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="70" y1="25" x2="70" y2="125" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="55" fontSize="8" fontWeight="900" textAnchor="middle" fill="#dc2626">V 90°</text>}
            {showDetails && <text x="70" y="103" fontSize="8" fontWeight="800" textAnchor="middle" fill="#475569">Alur Klem Samping</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="25" y="30" width="90" height="80" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="25" y1="70" x2="115" y2="70" stroke={solidColor} strokeWidth="2.4" />
            <line x1="25" y1="48" x2="115" y2="48" stroke={solidColor} strokeWidth="1.5" />
            <line x1="25" y1="92" x2="115" y2="92" stroke={solidColor} strokeWidth="1.5" />
            <line x1="35" y1="30" x2="35" y2="110" stroke={solidColor} strokeWidth="1.5" />
            <line x1="105" y1="30" x2="105" y2="110" stroke={solidColor} strokeWidth="1.5" />
            <line x1="70" y1="20" x2="70" y2="120" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="66" fontSize="8" fontWeight="900" textAnchor="middle" fill="#16a34a">Dasar Lembah V</text>}
          </svg>
        );
      }
      // kanan & kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <polygon points="30,35 110,35 110,115 30,115 30,82 40,82 40,62 30,62" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          <line x1="30" y1="68" x2="110" y2="68" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          {showDetails && <text x="70" y="63" fontSize="8" fontWeight="800" textAnchor="middle" fill="#c2410c">Lembah V (Gores)</text>}
        </svg>
      );
    }

    // ----------------------------------------
    // 4. BEARING PILLOW BLOCK
    // ----------------------------------------
    case 'bearing_pillow': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            {/* Tapak base */}
            <rect x="18" y="85" width="104" height="28" rx="4" fill={fillColor} stroke={solidColor} strokeWidth="2.4" />
            {/* Kubah silinder tengah */}
            <path d="M 45,85 A 25 25 0 0 1 95,85 Z" fill={fillAccent} stroke={solidColor} strokeWidth="2.4" />
            {/* Lubang poros */}
            <circle cx="70" cy="74" r="13" fill="#ffffff" stroke={solidColor} strokeWidth="2.4" />
            <line x1="52" y1="74" x2="88" y2="74" stroke={centerColor} strokeWidth="1.2" strokeDasharray="6 2 2 2" />
            <line x1="70" y1="56" x2="70" y2="92" stroke={centerColor} strokeWidth="1.2" strokeDasharray="6 2 2 2" />
            {/* Lubang baut tapak */}
            <line x1="30" y1="85" x2="30" y2="113" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="38" y1="85" x2="38" y2="113" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="34" y1="80" x2="34" y2="118" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="102" y1="85" x2="102" y2="113" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="110" y1="85" x2="110" y2="113" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="106" y1="80" x2="106" y2="118" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            {showDetails && <text x="70" y="77" fontSize="8" fontWeight="900" textAnchor="middle" fill="#0f172a">Ø18 Poros</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="18" y="45" width="104" height="50" rx="8" fill={fillColor} stroke={solidColor} strokeWidth="2.4" />
            <rect x="45" y="40" width="50" height="60" rx="3" fill={fillAccent} stroke={solidColor} strokeWidth="2.2" />
            {/* Baut tapak */}
            <circle cx="34" cy="70" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
            <circle cx="106" cy="70" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
            <line x1="25" y1="70" x2="43" y2="70" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="97" y1="70" x2="115" y2="70" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            {/* Poros tembus hidden */}
            <line x1="45" y1="57" x2="95" y2="57" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="45" y1="83" x2="95" y2="83" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="38" y1="70" x2="102" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
          </svg>
        );
      }
      // kanan & kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <polygon points="35,85 52,85 52,48 88,48 88,85 105,85 105,113 35,113" fill={fillColor} stroke={solidColor} strokeWidth="2.4" />
          <line x1="52" y1="61" x2="88" y2="61" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="52" y1="87" x2="88" y2="87" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="40" y1="74" x2="100" y2="74" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
        </svg>
      );
    }

    // ----------------------------------------
    // 5. ANGLE BRACKET WITH RIB & HOLES
    // ----------------------------------------
    case 'bracket_gusset': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <polygon points="25,25 45,25 45,95 115,95 115,115 25,115" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <polygon points="45,95 95,95 45,45" fill={fillAccent} stroke={solidColor} strokeWidth="2.2" />
            {/* Lubang baut tegak */}
            <line x1="25" y1="52" x2="45" y2="52" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="25" y1="68" x2="45" y2="68" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="18" y1="60" x2="52" y2="60" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            {/* Lubang baut dasar */}
            <line x1="72" y1="95" x2="72" y2="115" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="88" y1="95" x2="88" y2="115" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="80" y1="90" x2="80" y2="120" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            {showDetails && <text x="56" y="80" fontSize="8" fontWeight="800" fill="#1e40af">Sirip (Rib)</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="25" y="40" width="90" height="60" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="45" y1="40" x2="45" y2="100" stroke={solidColor} strokeWidth="2.2" />
            <rect x="45" y="66" width="50" height="8" fill={fillAccent} stroke={solidColor} strokeWidth="1.8" />
            <circle cx="80" cy="70" r="6" fill="#ffffff" stroke={solidColor} strokeWidth="2.0" />
            <line x1="68" y1="70" x2="92" y2="70" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="80" y1="58" x2="80" y2="82" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
          </svg>
        );
      }
      if (viewName === 'kanan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="40" y="25" width="60" height="90" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <circle cx="70" cy="60" r="6" fill="#ffffff" stroke={solidColor} strokeWidth="2.0" />
            <line x1="58" y1="60" x2="82" y2="60" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="70" y1="48" x2="70" y2="72" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="66" y1="95" x2="66" y2="115" stroke={solidColor} strokeWidth="2.0" />
            <line x1="74" y1="95" x2="74" y2="115" stroke={solidColor} strokeWidth="2.0" />
          </svg>
        );
      }
      // kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <rect x="40" y="25" width="60" height="90" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          <circle cx="70" cy="60" r="6" fill="#ffffff" stroke={solidColor} strokeWidth="2.0" />
          <line x1="40" y1="95" x2="100" y2="95" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
        </svg>
      );
    }

    // ----------------------------------------
    // 6. 4-BOLT CIRCULAR FLANGE
    // ----------------------------------------
    case 'pipe_flange': {
      if (viewName === 'depan' || viewName === 'kanan' || viewName === 'kiri') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            {/* Base piringan */}
            <rect x="20" y="88" width="100" height="24" rx="2" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            {/* Leher pipa */}
            <rect x="44" y="32" width="52" height="56" fill={fillAccent} stroke={solidColor} strokeWidth="2.5" />
            {/* Lubang pipa tengah hidden */}
            <line x1="57" y1="32" x2="57" y2="112" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="83" y1="32" x2="83" y2="112" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
            <line x1="70" y1="20" x2="70" y2="124" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {/* Baut samping hidden */}
            <line x1="28" y1="88" x2="28" y2="112" stroke={hiddenColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="36" y1="88" x2="36" y2="112" stroke={hiddenColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="32" y1="82" x2="32" y2="118" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            <line x1="104" y1="88" x2="104" y2="112" stroke={hiddenColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="112" y1="88" x2="112" y2="112" stroke={hiddenColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="108" y1="82" x2="108" y2="118" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
            {showDetails && <text x="70" y="72" fontSize="8" fontWeight="800" textAnchor="middle" fill="#0f172a">Pipa Ø16</text>}
          </svg>
        );
      }
      // atas
      return (
        <svg viewBox={vb} width={size} height={size}>
          {/* Flange outer */}
          <circle cx="70" cy="70" r="48" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          {/* PCD circle */}
          <circle cx="70" cy="70" r="36" fill="none" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
          {/* 4 bolt holes */}
          <circle cx="70" cy="34" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
          <circle cx="70" cy="106" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
          <circle cx="34" cy="70" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
          <circle cx="106" cy="70" r="5" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
          {/* Neck circle */}
          <circle cx="70" cy="70" r="26" fill={fillAccent} stroke={solidColor} strokeWidth="2.2" />
          {/* Bore circle */}
          <circle cx="70" cy="70" r="14" fill="#ffffff" stroke={solidColor} strokeWidth="2.2" />
          {/* Cross lines */}
          <line x1="16" y1="70" x2="124" y2="70" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
          <line x1="70" y1="16" x2="70" y2="124" stroke={centerColor} strokeWidth="1.0" strokeDasharray="6 2 2 2" />
          {showDetails && <text x="70" y="73" fontSize="8" fontWeight="900" textAnchor="middle" fill="#0f172a">PCD Ø36</text>}
        </svg>
      );
    }

    // ----------------------------------------
    // 7. STEPPED SHAFT WITH KEYWAY
    // ----------------------------------------
    case 'stepped_shaft': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="20" y="42" width="50" height="56" fill={fillAccent} stroke={solidColor} strokeWidth="2.5" />
            <rect x="70" y="52" width="50" height="36" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <rect x="85" y="47" width="22" height="5" fill="#0f172a" />
            <line x1="10" y1="70" x2="130" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            {showDetails && <text x="45" y="73" fontSize="9" fontWeight="800" textAnchor="middle" fill="#0369a1">Ø32</text>}
            {showDetails && <text x="96" y="73" fontSize="9" fontWeight="800" textAnchor="middle" fill="#0284c7">Ø20</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="20" y="42" width="50" height="56" fill={fillAccent} stroke={solidColor} strokeWidth="2.5" />
            <rect x="70" y="52" width="50" height="36" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <rect x="85" y="65" width="22" height="10" rx="3" fill="#ffffff" stroke={solidColor} strokeWidth="1.8" />
            <line x1="10" y1="70" x2="130" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            {showDetails && <text x="96" y="62" fontSize="7" fontWeight="800" textAnchor="middle" fill="#b45309">Pasak 5x16</text>}
          </svg>
        );
      }
      if (viewName === 'kanan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <circle cx="70" cy="70" r="42" fill={fillAccent} stroke={solidColor} strokeWidth="2.5" />
            <circle cx="70" cy="70" r="26" fill={fillColor} stroke={solidColor} strokeWidth="2.2" />
            <rect x="66" y="41" width="8" height="7" fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
            <line x1="20" y1="70" x2="120" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            <line x1="70" y1="20" x2="70" y2="120" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="88" fontSize="8" fontWeight="800" textAnchor="middle" fill="#0284c7">Ø20 di Ø32</text>}
          </svg>
        );
      }
      // kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <circle cx="70" cy="70" r="42" fill={fillAccent} stroke={solidColor} strokeWidth="2.5" />
          <circle cx="70" cy="70" r="26" fill="none" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <rect x="66" y="41" width="8" height="7" fill="none" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1="20" y1="70" x2="120" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
          <line x1="70" y1="20" x2="70" y2="120" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
        </svg>
      );
    }

    // ----------------------------------------
    // 8. DOVETAIL SLIDE GUIDE
    // ----------------------------------------
    case 'dovetail_block': {
      if (viewName === 'depan') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <polygon points="20,72 40,72 32,42 66,42 66,48 74,48 74,42 108,42 100,72 120,72 120,112 20,112" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="70" y1="25" x2="70" y2="122" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="60" fontSize="8" fontWeight="900" textAnchor="middle" fill="#1e40af">Ekor Burung 60°</text>}
            {showDetails && <text x="70" y="38" fontSize="7" fontWeight="800" textAnchor="middle" fill="#dc2626">Alur Oli</text>}
          </svg>
        );
      }
      if (viewName === 'atas') {
        return (
          <svg viewBox={vb} width={size} height={size}>
            <rect x="20" y="35" width="100" height="70" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
            <line x1="20" y1="48" x2="120" y2="48" stroke={solidColor} strokeWidth="2.0" />
            <line x1="20" y1="92" x2="120" y2="92" stroke={solidColor} strokeWidth="2.0" />
            <line x1="20" y1="67" x2="120" y2="67" stroke={solidColor} strokeWidth="1.5" />
            <line x1="20" y1="73" x2="120" y2="73" stroke={solidColor} strokeWidth="1.5" />
            <line x1="10" y1="70" x2="130" y2="70" stroke={centerColor} strokeWidth="1.2" strokeDasharray="8 2 2 2" />
            {showDetails && <text x="70" y="62" fontSize="8" fontWeight="800" textAnchor="middle" fill="#2563eb">Lidah Rel</text>}
          </svg>
        );
      }
      // kanan & kiri
      return (
        <svg viewBox={vb} width={size} height={size}>
          <rect x="30" y="42" width="80" height="70" fill={fillColor} stroke={solidColor} strokeWidth="2.5" />
          <line x1="30" y1="72" x2="110" y2="72" stroke={solidColor} strokeWidth="2.2" />
          <line x1="30" y1="48" x2="110" y2="48" stroke={hiddenColor} strokeWidth="1.8" strokeDasharray="4 3" />
          {showDetails && <text x="70" y="60" fontSize="8" fontWeight="800" textAnchor="middle" fill="#0f172a">Lidah 60°</text>}
          {showDetails && <text x="70" y="94" fontSize="8" fontWeight="800" textAnchor="middle" fill="#64748b">Landasan Bawah</text>}
        </svg>
      );
    }

    default:
      return (
        <svg viewBox={vb} width={size} height={size}>
          <rect x="25" y="25" width="90" height="90" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" rx="4" />
          <line x1="70" y1="20" x2="70" y2="120" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="8 2 2 2" />
          <text x="70" y="75" fontSize="10" fontWeight="800" textAnchor="middle" fill="#0f172a">2D View</text>
        </svg>
      );
  }
};

// ==========================================
// 3. KOMPONEN 3D CAD REALISTIS MODEL SMK
// ==========================================
const CADObjectMesh = ({ objectId, materialMode }) => {
  const matProps = useMemo(() => {
    switch (materialMode) {
      case 'brass':
        return { color: '#f59e0b', metalness: 0.8, roughness: 0.25 };
      case 'aluminium':
        return { color: '#cbd5e1', metalness: 0.5, roughness: 0.3 };
      case 'blueprint':
        return { color: '#3b82f6', metalness: 0.1, roughness: 0.7 };
      case 'steel':
      default:
        return { color: '#94a3b8', metalness: 0.7, roughness: 0.25 };
    }
  }, [materialMode]);

  // 1. STEPPED L-BLOCK WITH BORE HOLE
  if (objectId === 'stepped_l') {
    return (
      <group>
        {/* Left upright pillar */}
        <mesh position={[-10, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 36, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[-10, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(20, 36, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>

        {/* Right lower step */}
        <mesh position={[10, -9, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 18, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[10, -9, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(20, 18, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>

        {/* Vertical drilled hole inside lower step */}
        <mesh position={[10, -9, 0]}>
          <cylinderGeometry args={[5, 5, 18.2, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // 2. T-SLOT BASE PLATE
  if (objectId === 't_slot_base') {
    const geom = useMemo(() => {
      const s = new THREE.Shape();
      s.moveTo(-20, -14);
      s.lineTo(20, -14);
      s.lineTo(20, 14);
      s.lineTo(6, 14);
      s.lineTo(6, 4);
      s.lineTo(12, 4);
      s.lineTo(12, -4);
      s.lineTo(-12, -4);
      s.lineTo(-12, 4);
      s.lineTo(-6, 4);
      s.lineTo(-6, 14);
      s.lineTo(-20, 14);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 36, bevelEnabled: false });
      g.center();
      return g;
    }, []);

    return (
      <group>
        <mesh geometry={geom} castShadow receiveShadow>
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geom, 20]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
      </group>
    );
  }

  // 3. PRECISION V-BLOCK
  if (objectId === 'v_block') {
    const geom = useMemo(() => {
      const s = new THREE.Shape();
      s.moveTo(-22, -16);
      s.lineTo(22, -16);
      s.lineTo(22, -6);
      s.lineTo(17, -6);
      s.lineTo(17, 2);
      s.lineTo(22, 2);
      s.lineTo(22, 16);
      s.lineTo(13, 16);
      s.lineTo(0, 1); // Takik V 90°
      s.lineTo(-13, 16);
      s.lineTo(-22, 16);
      s.lineTo(-22, 2);
      s.lineTo(-17, 2);
      s.lineTo(-17, -6);
      s.lineTo(-22, -6);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 34, bevelEnabled: false });
      g.center();
      return g;
    }, []);

    return (
      <group>
        <mesh geometry={geom} castShadow receiveShadow>
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geom, 20]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
      </group>
    );
  }

  // 4. BEARING PILLOW BLOCK
  if (objectId === 'bearing_pillow') {
    return (
      <group>
        {/* Base flange plate */}
        <mesh position={[0, -12, 0]} castShadow receiveShadow>
          <boxGeometry args={[52, 8, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -12, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(52, 8, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.8} />
        </lineSegments>

        {/* 2 Bolt holes in base */}
        <mesh position={[-18, -12, 0]}>
          <cylinderGeometry args={[3.5, 3.5, 8.2, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[18, -12, 0]}>
          <cylinderGeometry args={[3.5, 3.5, 8.2, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Center pillow housing dome */}
        <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[16, 16, 26, 36]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(16, 16, 26, 36)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.8} />
        </lineSegments>

        {/* Inner bearing bore */}
        <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[9, 9, 26.2, 36]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Left & Right web supports */}
        <mesh position={[-12, -4, 0]} castShadow>
          <boxGeometry args={[12, 8, 22]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[12, -4, 0]} castShadow>
          <boxGeometry args={[12, 8, 22]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  // 5. ANGLE BRACKET WITH RIB & HOLES
  if (objectId === 'bracket_gusset') {
    return (
      <group>
        {/* Base horizontal plate */}
        <mesh position={[0, -14, 0]} castShadow receiveShadow>
          <boxGeometry args={[42, 8, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -14, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(42, 8, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
        {/* Hole in base */}
        <mesh position={[10, -14, 0]}>
          <cylinderGeometry args={[4, 4, 8.2, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Upright vertical plate */}
        <mesh position={[-17, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 32, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[-17, 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(8, 32, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
        {/* Hole in upright plate */}
        <mesh position={[-17, 10, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[4, 4, 8.2, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Gusset Rib (triangular web) */}
        <mesh position={[0, 0, -3]} castShadow receiveShadow>
          <extrudeGeometry
            args={[
              (() => {
                const s = new THREE.Shape();
                s.moveTo(-13, -10);
                s.lineTo(17, -10);
                s.lineTo(-13, 17);
                s.closePath();
                return s;
              })(),
              { depth: 6, bevelEnabled: false }
            ]}
          />
          <meshStandardMaterial {...matProps} color="#94a3b8" />
        </mesh>
      </group>
    );
  }

  // 6. 4-BOLT CIRCULAR FLANGE
  if (objectId === 'pipe_flange') {
    return (
      <group>
        {/* Circular flange base */}
        <mesh position={[0, -10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[25, 25, 8, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -10, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(25, 25, 8, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.8} />
        </lineSegments>

        {/* Pipe neck */}
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[14, 14, 22, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, 5, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(14, 14, 22, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.8} />
        </lineSegments>

        {/* Center through bore */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[8, 8, 31, 36]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* 4 bolt holes in flange disk at PCD radius 19 */}
        {[
          [19, 0],
          [-19, 0],
          [0, 19],
          [0, -19]
        ].map(([bx, bz], bi) => (
          <mesh key={bi} position={[bx, -10, bz]}>
            <cylinderGeometry args={[3, 3, 8.2, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  // 7. STEPPED SHAFT WITH KEYWAY
  if (objectId === 'stepped_shaft') {
    return (
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Poros Besar Ø32 */}
        <mesh position={[0, -13, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[16, 16, 26, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -13, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(16, 16, 26, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.6} />
        </lineSegments>

        {/* Poros Kecil Ø20 */}
        <mesh position={[0, 13, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[10, 10, 26, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, 13, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(10, 10, 26, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.6} />
        </lineSegments>

        {/* Alur Pasak (Keyway) */}
        <mesh position={[8.5, 14, 0]} castShadow>
          <boxGeometry args={[3, 16, 5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // 8. DOVETAIL SLIDE GUIDE
  if (objectId === 'dovetail_block') {
    const geom = useMemo(() => {
      const s = new THREE.Shape();
      s.moveTo(-22, -14);
      s.lineTo(22, -14);
      s.lineTo(22, 0);
      s.lineTo(13, 0);
      s.lineTo(18, 14);
      s.lineTo(2, 14);
      s.lineTo(2, 11); // alur oli
      s.lineTo(-2, 11);
      s.lineTo(-2, 14);
      s.lineTo(-18, 14);
      s.lineTo(-13, 0);
      s.lineTo(-22, 0);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 35, bevelEnabled: false });
      g.center();
      return g;
    }, []);

    return (
      <group>
        <mesh geometry={geom} castShadow receiveShadow>
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[geom, 20]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
      </group>
    );
  }

  return null;
};

// ==========================================
// 4. CONTROLLER ANIMASI KAMERA HALUS
// ==========================================
const CameraAnimator = ({ targetPosition, controlsRef }) => {
  useFrame((state) => {
    if (targetPosition && controlsRef.current) {
      state.camera.position.lerp(targetPosition, 0.08);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  });
  return null;
};

// ==========================================
// 5. MAIN SIMULATOR COMPONENT
// ==========================================
const OrthogonalMultiViewSimulator = () => {
  const [selectedObjectId, setSelectedObjectId] = useState('stepped_l');
  const [projectionSystem, setProjectionSystem] = useState('amerika'); // 'amerika' or 'eropa'
  const [activeView, setActiveView] = useState('depan');
  const [materialMode, setMaterialMode] = useState('steel');
  const [autoRotate, setAutoRotate] = useState(false);

  const controlsRef = useRef(null);

  // Target Camera Positions according to ISO Orthographic Views
  const targetCamPos = useMemo(() => {
    const dist = 75;
    switch (activeView) {
      case 'depan':
        return new THREE.Vector3(0, 0, dist);
      case 'kanan':
        return new THREE.Vector3(dist, 0, 0);
      case 'atas':
        return new THREE.Vector3(0, dist, 0.001);
      case 'kiri':
        return new THREE.Vector3(-dist, 0, 0);
      case 'isometri':
      default:
        return new THREE.Vector3(55, 45, 55);
    }
  }, [activeView]);

  const activeObject = OBJECT_CATALOG[selectedObjectId] || OBJECT_CATALOG.stepped_l;
  const currentViewDetails = activeObject.views[activeView] || activeObject.views.depan;

  const handleSelectView = (viewKey) => {
    sound.playClick();
    setActiveView(viewKey);
  };

  const handleSelectObject = (objId) => {
    sound.playClick();
    setSelectedObjectId(objId);
  };

  // Reusable Projection View Card Component inside the Projection Map
  const renderProjectionCard = (viewKey, placementLabel) => {
    const isSelected = activeView === viewKey;
    const viewTitle = viewKey.toUpperCase();

    return (
      <button
        onClick={() => handleSelectView(viewKey)}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '10px 8px',
          borderRadius: '12px',
          border: isSelected ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1',
          background: isSelected ? '#eff6ff' : '#ffffff',
          color: isSelected ? '#1e40af' : '#1e293b',
          cursor: 'pointer',
          textAlign: 'center',
          boxShadow: isSelected ? '0 0 16px rgba(37, 99, 235, 0.35)' : '0 2px 6px rgba(0,0,0,0.03)',
          transition: 'all 0.18s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px'
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}>
          <span style={{ fontWeight: 900, fontSize: '0.76rem', letterSpacing: '0.3px' }}>
            PANDANGAN {viewTitle}
          </span>
          {isSelected && (
            <span style={{ fontSize: '0.58rem', background: '#2563eb', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
              AKTIF 3D
            </span>
          )}
        </div>

        {/* 2D TECHNICAL DRAWING VISUAL (Bukan sekadar tulisan!) */}
        <div style={{
          width: '100%',
          maxWidth: '120px',
          height: '92px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSelected ? 'rgba(255,255,255,0.85)' : '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '2px'
        }}>
          {renderOrthogonal2DView(selectedObjectId, viewKey, 88, false)}
        </div>

        {/* Card Subtitle / Placement Hint */}
        <div style={{
          fontSize: '0.66rem',
          fontWeight: 700,
          color: isSelected ? '#2563eb' : '#64748b',
          lineHeight: 1.2
        }}>
          {placementLabel}
        </div>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'inherit' }}>
      
      {/* HEADER SECTION WITH SYSTEM SELECTOR */}
      <div style={{
        background: '#ffffff',
        color: '#0f172a',
        padding: '22px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🧭</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a' }}>
                Simulator 3D & 2D Tata Letak Proyeksi Ortogonal (Standar ISO SMK)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Peta proyeksi menampilkan <strong>gambar kerja 2D visual nyata</strong> di setiap kuadran. Klik kotak pandangan untuk melihat model 3D berputar otomatis ke sudut pandang terkait.
              </p>
            </div>
          </div>
        </div>

        {/* PROJECTION SYSTEM TOGGLE (AMERIKA VS EROPA) */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '6px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => { sound.playClick(); setProjectionSystem('amerika'); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: projectionSystem === 'amerika' ? '#2563eb' : 'transparent',
              color: projectionSystem === 'amerika' ? '#fff' : '#475569',
              boxShadow: projectionSystem === 'amerika' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🇺🇸</span> Proyeksi Amerika (Sudut Ketiga)
          </button>
          <button
            onClick={() => { sound.playClick(); setProjectionSystem('eropa'); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: projectionSystem === 'eropa' ? '#d97706' : 'transparent',
              color: projectionSystem === 'eropa' ? '#fff' : '#475569',
              boxShadow: projectionSystem === 'eropa' ? '0 4px 12px rgba(217, 119, 6, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🇪🇺</span> Proyeksi Eropa (Sudut Pertama)
          </button>
        </div>
      </div>

      {/* OBJECT SELECTION GRID (8 BENDA STANDAR PROYEK SMK) */}
      <div style={{
        background: '#fff',
        padding: '18px 20px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📦</span> Pilih Benda Latihan Ortogonal (8 Model Standar Mesin):
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>
            {activeObject.category} • {activeObject.dimensions}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
          gap: '10px'
        }}>
          {Object.values(OBJECT_CATALOG).map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => handleSelectObject(obj.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#f8fafc',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.3 }}>
                  {obj.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: isSelected ? '#2563eb' : '#64748b' }}>
                  {obj.difficulty}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: 3D VIEWPORT (LEFT) & ORTHOGONAL PROJECTION MAP (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '20px' }}>
        
        {/* LEFT COLUMN: 3D INTERACTIVE CANVAS */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #cbd5e1',
          position: 'relative'
        }}>
          {/* Top Canvas Bar */}
          <div style={{
            padding: '12px 16px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px #16a34a' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                3D CAD Viewport ({activeObject.shortName})
              </span>
              <span style={{ fontSize: '0.72rem', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {activeView.toUpperCase()}
              </span>
            </div>

            {/* Material selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['steel', 'brass', 'aluminium', 'blueprint'].map((mat) => (
                <button
                  key={mat}
                  onClick={() => setMaterialMode(mat)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    background: materialMode === mat ? '#2563eb' : '#ffffff',
                    color: materialMode === mat ? '#fff' : '#475569'
                  }}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* 3D WebGL Canvas Container */}
          <div style={{ height: '390px', width: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 700, background: '#ffffff' }}>
                MEMUAT ENGINE 3D...
              </div>
            }>
              <Canvas
                shadows
                camera={{ position: [55, 45, 55], fov: 40 }}
                gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
                style={{ background: '#ffffff' }}
              >
                <ambientLight intensity={1.3} />
                <directionalLight position={[60, 80, 50]} intensity={1.8} castShadow />
                <directionalLight position={[-60, 40, -50]} intensity={0.8} />

                {/* Animated Camera Rig */}
                <CameraAnimator targetPosition={targetCamPos} controlsRef={controlsRef} />

                {/* 3D Model Centered */}
                <Center>
                  <CADObjectMesh objectId={selectedObjectId} materialMode={materialMode} />
                </Center>

                {/* Technical Ground Grid */}
                <Grid
                  position={[0, -22, 0]}
                  args={[120, 120]}
                  cellSize={10}
                  cellThickness={1}
                  cellColor="#e2e8f0"
                  sectionSize={30}
                  sectionThickness={1.5}
                  sectionColor="#cbd5e1"
                  fadeDistance={100}
                />

                <OrbitControls
                  ref={controlsRef}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  autoRotate={autoRotate}
                  autoRotateSpeed={1.5}
                />
              </Canvas>
            </Suspense>

            {/* FLOATING ACTION OVERLAYS FOR VIEW QUICK SWITCH */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{
                pointerEvents: 'auto',
                display: 'flex',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <button
                  onClick={() => handleSelectView('depan')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'depan' ? '#0f172a' : '#f1f5f9',
                    color: activeView === 'depan' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'depan' ? '0 2px 6px rgba(15,23,42,0.4)' : 'none'
                  }}
                >
                  Depan
                </button>
                <button
                  onClick={() => handleSelectView('atas')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'atas' ? '#2563eb' : '#f1f5f9',
                    color: activeView === 'atas' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'atas' ? '0 2px 6px rgba(37,99,235,0.4)' : 'none'
                  }}
                >
                  Atas
                </button>
                <button
                  onClick={() => handleSelectView('kanan')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'kanan' ? '#16a34a' : '#f1f5f9',
                    color: activeView === 'kanan' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'kanan' ? '0 2px 6px rgba(22,163,74,0.4)' : 'none'
                  }}
                >
                  Kanan
                </button>
                <button
                  onClick={() => handleSelectView('kiri')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'kiri' ? '#d97706' : '#f1f5f9',
                    color: activeView === 'kiri' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'kiri' ? '0 2px 6px rgba(217,119,6,0.4)' : 'none'
                  }}
                >
                  Kiri
                </button>
                <button
                  onClick={() => handleSelectView('isometri')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'isometri' ? '#7c3aed' : '#f1f5f9',
                    color: activeView === 'isometri' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'isometri' ? '0 2px 6px rgba(124,58,237,0.4)' : 'none'
                  }}
                >
                  📦 3D Iso
                </button>
              </div>

              <div style={{ pointerEvents: 'auto' }}>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: autoRotate ? '#16a34a' : 'rgba(255, 255, 255, 0.95)',
                    color: autoRotate ? '#fff' : '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  {autoRotate ? '⏸ Stop Putar' : '🔄 Putar Lambat'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
            💡 <em>Interaksi:</em> Klik salah satu kotak gambar 2D pada Peta Proyeksi di samping kanan untuk otomatis mengarahkan kamera 3D ke pandangan tersebut!
          </div>
        </div>

        {/* RIGHT COLUMN: PETA TATA LETAK PROYEKSI DENGAN GAMBAR 2D VISUAL NYATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* PETA TATA LETAK PROYEKSI ORTOGONAL */}
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                  🗺️ Peta Tata Letak ({projectionSystem === 'amerika' ? 'Proyeksi Amerika' : 'Proyeksi Eropa'})
                </h4>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Format tata letak kuadran standar ISO 5456. Setiap kotak memuat <strong>gambar 2D visual nyata</strong>:
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', background: projectionSystem === 'amerika' ? '#dbeafe' : '#fef3c7', color: projectionSystem === 'amerika' ? '#1e40af' : '#92400e' }}>
                {projectionSystem === 'amerika' ? 'Sudut Ketiga (3rd Angle)' : 'Sudut Pertama (1st Angle)'}
              </span>
            </div>

            {/* INTERACTIVE MULTI-VIEW BOXES WITH 2D DRAWINGS */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              {projectionSystem === 'amerika' ? (
                /* SISTEM AMERIKA:
                   Row 1: [Kosong] | [PANDANGAN ATAS] | [Kosong]
                   Row 2: [PANDANGAN KIRI] | [PANDANGAN DEPAN] | [PANDANGAN KANAN]
                */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(110px, 140px))',
                    gap: '10px',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    {/* Row 1, Col 1: Empty */}
                    <div></div>

                    {/* Row 1, Col 2: PANDANGAN ATAS */}
                    <div>
                      {renderProjectionCard('atas', '↑ Di Atas Depan')}
                    </div>

                    {/* Row 1, Col 3: Empty */}
                    <div></div>

                    {/* Row 2, Col 1: PANDANGAN KIRI */}
                    <div>
                      {renderProjectionCard('kiri', '← Di Kiri Depan')}
                    </div>

                    {/* Row 2, Col 2: PANDANGAN DEPAN */}
                    <div>
                      {renderProjectionCard('depan', '★ Pandangan Utama')}
                    </div>

                    {/* Row 2, Col 3: PANDANGAN KANAN */}
                    <div>
                      {renderProjectionCard('kanan', '→ Di Kanan Depan')}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#1e3a8a', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bfdbfe', width: '100%', textAlign: 'center' }}>
                    <strong>Prinsip Proyeksi Amerika (Sudut Ketiga):</strong> Searah pandangan pengamat. Pandangan Kanan diletakkan di sebelah <strong>KANAN</strong>, dan pandangan Atas diletakkan di sebelah <strong>ATAS</strong>.
                  </div>
                </div>
              ) : (
                /* SISTEM EROPA:
                   Row 1: [PANDANGAN KANAN] | [PANDANGAN DEPAN] | [PANDANGAN KIRI]
                   Row 2: [Kosong] | [PANDANGAN ATAS] | [Kosong]
                */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(110px, 140px))',
                    gap: '10px',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    {/* Row 1, Col 1: PANDANGAN KANAN (Diletakkan di KIRI) */}
                    <div>
                      {renderProjectionCard('kanan', '← Dari Kanan ke Kiri')}
                    </div>

                    {/* Row 1, Col 2: PANDANGAN DEPAN */}
                    <div>
                      {renderProjectionCard('depan', '★ Pandangan Utama')}
                    </div>

                    {/* Row 1, Col 3: PANDANGAN KIRI (Diletakkan di KANAN) */}
                    <div>
                      {renderProjectionCard('kiri', '→ Dari Kiri ke Kanan')}
                    </div>

                    {/* Row 2, Col 1: Empty */}
                    <div></div>

                    {/* Row 2, Col 2: PANDANGAN ATAS (Diletakkan di BAWAH) */}
                    <div>
                      {renderProjectionCard('atas', '↓ Dari Atas ke Bawah')}
                    </div>

                    {/* Row 2, Col 3: Empty */}
                    <div></div>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#92400e', background: '#fffbeb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a', width: '100%', textAlign: 'center' }}>
                    <strong>Prinsip Proyeksi Eropa (Sudut Pertama):</strong> Prinsip bayangan seberang. Pandangan kanan pengamat diproyeksikan dan diletakkan di sebelah <strong>KIRI</strong>, sedangkan pandangan atas diletakkan di sebelah <strong>BAWAH</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DETAIL GAMBAR 2D DIPERBESAR & ANALISIS STANDAR ISO 128 */}
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: '150px 1fr',
            gap: '18px',
            alignItems: 'center'
          }}>
            {/* SVG 2D Enlarged View Box */}
            <div style={{
              width: '150px',
              height: '150px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)'
            }}>
              {renderOrthogonal2DView(selectedObjectId, activeView, 140, true)}
            </div>

            {/* Explanation text & ISO 128 Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px' }}>
                  GAMBAR KERJA 2D (ISO 128)
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentViewDetails.title}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
                {currentViewDetails.desc}
              </div>

              {/* Garis ISO 128 Legend */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '6px 10px',
                background: '#f1f5f9',
                borderRadius: '6px',
                fontSize: '0.68rem',
                color: '#475569'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '14px', height: '3px', background: '#0f172a', display: 'inline-block' }}></span>
                  <strong>Garis Nyata</strong> (Kontur)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #ea580c', display: 'inline-block' }}></span>
                  <strong style={{ color: '#ea580c' }}>Garis Gores</strong> (Sembunyi)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #dc2626', display: 'inline-block' }}></span>
                  <strong style={{ color: '#dc2626' }}>Garis Sumbu</strong> (Center)
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                <strong>Fitur Visual Proyeksi:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                  {currentViewDetails.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrthogonalMultiViewSimulator;
