import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../utils/audio';

// ==========================================
// 1. DEFINISI 8 BENDA SEDERHANA GAMBAR TEKNIK
// ==========================================
export const OBJECT_CATALOG = {
  stepped_l: {
    id: 'stepped_l',
    name: '1. Balok Tangga Bertingkat (L-Block)',
    shortName: 'Balok Tangga L',
    difficulty: 'Tingkat Dasar',
    category: 'Prismatik Bertingkat',
    desc: 'Benda dasar bertingkat 2 level. Sangat ideal untuk memahami perbedaan antara bidang tampak penuh dari samping dan bentuk berundak dari depan.',
    dimensions: '40 x 40 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan kontur utama huruf "L" dengan undakan setinggi 20 mm.',
        features: ['Kontur huruf L nyata', 'Tidak ada garis tersembunyi', 'Bidang undak vertikal dan horizontal']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari sisi kanan: Terlihat sebagai 1 bidang persegi panjang tegak penuh (30 x 40 mm). Garis undakan terlihat sebagai batas sambungan bidang.',
        features: ['Bidang persegi panjang utuh 30x40 mm', 'Garis horizontal pada ketinggian 20 mm menandai batas anak tangga', 'Tidak ada garis tersembunyi']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Terlihat sebagai 2 bidang persegi panjang berdampingan (masing-masing 20 x 30 mm).',
        features: ['2 bidang datar berdampingan', 'Garis pemisah di tengah (X = 20 mm)', 'Dimensi total 40 x 30 mm']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari sisi kiri: Terlihat bidang datar persegi panjang utuh tegak 30 x 40 mm polos.',
        features: ['Bidang persegi panjang utuh polos', 'Garis undak tersembunyi digambar garis putus-putus jika diproyeksikan penuh']
      }
    }
  },
  slotted_u: {
    id: 'slotted_u',
    name: '2. Balok Alur U (Slotted U-Block)',
    shortName: 'Balok Alur U',
    difficulty: 'Tingkat Dasar',
    category: 'Prismatik Beralur',
    desc: 'Balok dengan alur/parit U tembus di tengah atas. Menunjukkan bagaimana fitur tembus diproyeksikan sebagai garis tersembunyi (hidden dashed lines) dari pandangan samping.',
    dimensions: '40 x 30 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan profil huruf "U" dengan kedalaman alur 16 mm di tengah balok.',
        features: ['Bentuk profil huruf U jelas', 'Alur selebar 16 mm di tengah', 'Dasar alur pada ketinggian 14 mm']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Bentuk luar persegi panjang 30 x 30 mm. Dasar alur U tidak tampak langsung, sehingga diwakili GARIS PUTUS-PUTUS (Hidden Line) pada Y = 14 mm.',
        features: ['Bujur sangkar luar 30 x 30 mm', 'Garis PUTUS-PUTUS (Hidden line) dasar alur', 'Simbol penting penerapan ISO 128 garis sembunyi']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Terlihat 3 lajur persegi panjang (lajur dinding kiri, dasar parit alur tengah, dan lajur dinding kanan).',
        features: ['3 bidang memanjang sejajar', 'Lebar alur 16 mm diapit dua dinding 12 mm', 'Garis tepi alur terlihat nyata']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Simetris dengan pandangan kanan, berupa kotak 30 x 30 mm dengan garis putus-putus kedalaman alur.',
        features: ['Bujur sangkar 30 x 30 mm', 'Garis putus-putus kedalaman parit']
      }
    }
  },
  wedge: {
    id: 'wedge',
    name: '3. Balok Baji Miring (Incline / Wedge Block)',
    shortName: 'Balok Baji Miring',
    difficulty: 'Tingkat Menengah',
    category: 'Bidang Miring (Inclined)',
    desc: 'Balok dengan bidang kemiringan (slope). Membuktikan prinsip proyeksi ortogonal di mana bidang miring tampak memendek (foreshortened) pada pandangan atas dan samping.',
    dimensions: '40 x 36 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan bentuk trapesium siku-siku dengan sudut kemiringan nyata dari puncak kiri turun ke undak kanan.',
        features: ['Bidang miring terlihat ukuran aslinya (True Shape)', 'Tinggi puncak 36 mm, tinggi undak kanan 14 mm', 'Panjang dasar 40 mm']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Bidang miring terproyeksi menjadi bidang tegak lurus dengan garis batas horizontal pada ketinggian undak.',
        features: ['Persegi panjang 30 x 36 mm', 'Garis horizontal tampak nyata pada Y = 14 mm', 'Bidang miring tampak sebagai persegi panjang (foreshortened)']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Bidang miring tampak memendek menjadi persegi panjang di samping bidang datar puncak.',
        features: ['2 bidang tampak berdampingan', 'Bidang datar puncak 15 x 30 mm', 'Bidang miring terproyeksi memendek 25 x 30 mm']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Tampak persegi panjang utuh 30 x 36 mm dengan garis putus-putus batas undak samping.',
        features: ['Persegi panjang 30 x 36 mm', 'Garis tersembunyi pada batas undak bawah']
      }
    }
  },
  v_block: {
    id: 'v_block',
    name: '4. Blok V Penjepit Poros (Standard V-Block)',
    shortName: 'Blok V Pencekam',
    difficulty: 'Tingkat Menengah',
    category: 'Perkakas Presisi',
    desc: 'Peralatan standar pencekam silinder bengkel bubut dengan takik V 90° di atas dan alur jepit samping (side clamping slots).',
    dimensions: '40 x 35 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan sudut takik V 90 derajat di bagian atas dan alur pencekam klem di kedua sisi luar.',
        features: ['Takik V simetris 90°', '2 alur klem pencekam di kanan dan kiri', 'Garis sumbu vertikal simetris di tengah']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak alur klem samping dan garis putus-putus penanda titik terendah takik V di tengah.',
        features: ['Bentuk profil alur klem luar', 'Garis putus-putus (hidden line) dasar lembah V', 'Bidang sisi 30 x 35 mm']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Kedua lereng miring takik V bertemu pada sebuah garis lurus di garis sumbu tengah.',
        features: ['Garis sumbu pertemuan dasar V di tengah', 'Dua bidang miring V tampak simetris', 'Alur klem samping tampak memanjang']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Menyerupai pandangan kanan karena benda bersifat simetris kiri-kanan.',
        features: ['Profil alur klem samping', 'Garis putus-putus dasar takik V']
      }
    }
  },
  bracket_gusset: {
    id: 'bracket_gusset',
    name: '5. Siku Penguat Bersirip (Angle Bracket with Rib)',
    shortName: 'Braket Siku Bersirip',
    difficulty: 'Tingkat Menengah',
    category: 'Komponen Konstruksi Mesin',
    desc: 'Pelat siku 90 derajat yang diperkuat rusuk segitiga (gusset/rib) di bagian tengah. Standar teknik mesin untuk memahami tebal sirip.',
    dimensions: '40 x 36 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan profil siku-L dengan sirip segitiga penguat di sudut dalamnya.',
        features: ['Profil pelat L tebal 8 mm', 'Segitiga sirip penguat (rib) di tengah', 'Garis batas ketebalan pelat']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak pelat belakang vertikal (30 x 36 mm) dan rusuk miring sirip penguat menonjol ke arah pengamat.',
        features: ['Pelat tegak 30 x 36 mm', 'Ketebalan sirip 6 mm di tengah', 'Sisi dasar L terlihat menonjol ke depan']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menampilkan pelat dasar horizontal (40 x 30 mm) dengan sirip penguat tebal 6 mm di tengah.',
        features: ['Pelat dasar 40 x 30 mm', 'Tebal sirip penguat 6 mm di sumbu tengah', 'Pelat tegak terlihat sebagai garis tebal 8 mm']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Menampilkan punggung pelat tegak rata dengan garis putus-putus untuk pelat dasar.',
        features: ['Bidang punggung rata 30 x 36 mm', 'Garis sembunyi dasar siku']
      }
    }
  },
  bridge_block: {
    id: 'bridge_block',
    name: '6. Balok Tapak Jembatan (Bridge / C-Channel Block)',
    shortName: 'Tapak Kaki Jembatan',
    difficulty: 'Tingkat Menengah',
    category: 'Prismatik Berongga',
    desc: 'Balok dengan rongga terowongan/kolong di bagian bawah, membentuk dua kaki tapak mesin penopang.',
    dimensions: '40 x 30 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan gerbang terowongan kolong selebar 20 mm dan setinggi 14 mm di antara dua kaki penopang.',
        features: ['Bentuk gerbang jembatan (C terbalik)', '2 kaki penopang selebar masing-masing 10 mm', 'Rongga kolong tembus']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Rongga kolong terlihat tembus sebagai lorong terowongan di bagian bawah.',
        features: ['Persegi panjang 30 x 30 mm', 'Tampak lorong kolong terbuka di bagian bawah', 'Dua kaki penopang menyatu dari samping']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Terlihat sebagai satu bidang persegi panjang utuh 40 x 30 mm tanpa rongga.',
        features: ['Satu bidang persegi panjang utuh 40 x 30 mm', 'Rongga bawah ditunjukkan garis putus-putus jika ditarik proyeksi tembus']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Sama dengan pandangan kanan, menampilkan profil lorong kolong bawah.',
        features: ['Profil lorong tembus bawah', 'Bidang dinding samping']
      }
    }
  },
  stepped_shaft: {
    id: 'stepped_shaft',
    name: '7. Poros Bertingkat & Alur Pasak (Stepped Shaft)',
    shortName: 'Poros Bertingkat Silinder',
    difficulty: 'Tingkat Lanjutan',
    category: 'Benda Putar (Rotational)',
    desc: 'Poros bubut bertingkat dengan diameter besar (D=30 mm) dan diameter kecil (D=18 mm) yang dilengkapi alur pasak pengunci (keyway slot).',
    dimensions: 'D30/D18 x 50 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan dua silinder bertingkat sejajar horizontal dengan takik alur pasak di bagian puncak poros kecil.',
        features: ['Silinder D30 x 25 mm di kiri', 'Silinder D18 x 25 mm di kanan', 'Garis sumbu horizontal strip-titik di tengah', 'Alur pasak kedalaman 3 mm']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Berputar 90 derajat menampilkan LINGKARAN KONSENTRIS (lingkaran D18 di dalam lingkaran D30) dengan takik alur pasak persegi di puncak.',
        features: ['Dua lingkaran konsentris bertumpuk', 'Takik alur pasak persegi 5 x 3 mm di atas', 'Dua garis sumbu bersilang (Center mark)']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menyerupai pandangan depan, namun alur pasak tampak sebagai persegi panjang memanjang di poros kecil.',
        features: ['Dua tingkat silinder tampak persegi panjang', 'Alur pasak tampak dari atas selebar 5 mm sepanjang 16 mm']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Lingkaran besar D30 menutupi lingkaran kecil di belakangnya (lingkaran kecil diwakili garis putus-putus).',
        features: ['Lingkaran besar D30 terlihat nyata', 'Lingkaran kecil D18 tersembunyi (garis putus-putus)']
      }
    }
  },
  dovetail_block: {
    id: 'dovetail_block',
    name: '8. Balok Ekor Burung (Dovetail Slide Block)',
    shortName: 'Balok Ekor Burung',
    difficulty: 'Tingkat Lanjutan',
    category: 'Mekanisme Peluncur Mesin',
    desc: 'Balok pemandu rel mesin frais atau mesin bubut dengan profil trapesium terbalik bersudut 60 derajat untuk mengunci luncuran.',
    dimensions: '40 x 30 x 30 mm',
    views: {
      depan: {
        title: 'Pandangan Depan (Front View)',
        desc: 'Menampilkan lidah ekor burung (trapesium) bersudut 60 derajat di atas balok landasan.',
        features: ['Bentuk baji ekor burung bersudut 60°', 'Balok landasan tebal 15 mm', 'Garis batas sambungan sudut trapesium']
      },
      kanan: {
        title: 'Pandangan Kanan (Right Side View)',
        desc: 'Dilihat dari kanan: Tampak bidang luar persegi panjang dengan garis horizontal pemisah antara landasan dan lidah ekor burung.',
        features: ['Persegi panjang 30 x 30 mm', 'Garis horizontal pada ketinggian 15 mm', 'Tidak ada garis tersembunyi dari samping']
      },
      atas: {
        title: 'Pandangan Atas (Top View)',
        desc: 'Dilihat dari atas: Menampilkan rel lidah ekor burung yang melebar dengan dua sayap landasan di kanan-kirinya.',
        features: ['Lidah ekor burung di tengah selebar 36 mm', 'Garis rusuk kemiringan tampak dari atas']
      },
      kiri: {
        title: 'Pandangan Kiri (Left Side View)',
        desc: 'Dilihat dari kiri: Sama seperti pandangan kanan, menampilkan profil samping persegi panjang bergaris tengah.',
        features: ['Persegi panjang 30 x 30 mm', 'Garis batas landasan']
      }
    }
  }
};

// ==========================================
// 2. GEOMETRI TIGA DIMENSI TERTENTU (PROCEDURAL THREE.JS)
// ==========================================
const createModelGeometry = (id) => {
  switch (id) {
    case 'stepped_l': {
      const s = new THREE.Shape();
      s.moveTo(-20, -20);
      s.lineTo(20, -20);
      s.lineTo(20, 0);
      s.lineTo(0, 0);
      s.lineTo(0, 20);
      s.lineTo(-20, 20);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    case 'slotted_u': {
      const s = new THREE.Shape();
      s.moveTo(-20, -15);
      s.lineTo(20, -15);
      s.lineTo(20, 15);
      s.lineTo(8, 15);
      s.lineTo(8, -1);
      s.lineTo(-8, -1);
      s.lineTo(-8, 15);
      s.lineTo(-20, 15);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    case 'wedge': {
      const s = new THREE.Shape();
      s.moveTo(-20, -18);
      s.lineTo(20, -18);
      s.lineTo(20, -4);
      s.lineTo(-5, 18);
      s.lineTo(-20, 18);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    case 'v_block': {
      const s = new THREE.Shape();
      s.moveTo(-20, -17.5);
      s.lineTo(20, -17.5);
      s.lineTo(20, -6);
      s.lineTo(16, -6);
      s.lineTo(16, 2);
      s.lineTo(20, 2);
      s.lineTo(20, 17.5);
      s.lineTo(12, 17.5);
      s.lineTo(0, 3); // lembah V
      s.lineTo(-12, 17.5);
      s.lineTo(-20, 17.5);
      s.lineTo(-20, 2);
      s.lineTo(-16, 2);
      s.lineTo(-16, -6);
      s.lineTo(-20, -6);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    case 'bridge_block': {
      const s = new THREE.Shape();
      s.moveTo(-20, -15);
      s.lineTo(-10, -15);
      s.lineTo(-10, -1);
      s.lineTo(10, -1);
      s.lineTo(10, -15);
      s.lineTo(20, -15);
      s.lineTo(20, 15);
      s.lineTo(-20, 15);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    case 'dovetail_block': {
      const s = new THREE.Shape();
      s.moveTo(-20, -15);
      s.lineTo(20, -15);
      s.lineTo(20, 0);
      s.lineTo(14, 0);
      s.lineTo(18, 15);
      s.lineTo(-18, 15);
      s.lineTo(-14, 0);
      s.lineTo(-20, 0);
      s.closePath();
      const geom = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false });
      geom.center();
      return geom;
    }
    default:
      return null;
  }
};

// ==========================================
// 3. KOMPONEN 3D MESH DENGAN OUTLINE CAD SHARP
// ==========================================
const CADObjectMesh = ({ objectId, materialMode }) => {
  const geom = useMemo(() => createModelGeometry(objectId), [objectId]);

  const edgesGeom = useMemo(() => {
    if (!geom) return null;
    return new THREE.EdgesGeometry(geom, 20); // sudut tajam
  }, [geom]);

  // Material style
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

  // Special case: Siku Bersirip (bracket_gusset) compound mesh
  if (objectId === 'bracket_gusset') {
    return (
      <group>
        {/* Base horizontal */}
        <mesh position={[0, -14, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 8, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -14, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(40, 8, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>

        {/* Upright vertical */}
        <mesh position={[-16, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 28, 30]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[-16, 4, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(8, 28, 30)]} />
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>

        {/* Gusset Rib (extrude triangle) */}
        <mesh position={[0, 0, -3]} castShadow receiveShadow>
          <extrudeGeometry
            args={[
              (() => {
                const s = new THREE.Shape();
                s.moveTo(-12, -10);
                s.lineTo(16, -10);
                s.lineTo(-12, 18);
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

  // Special case: Poros Bertingkat & Alur Pasak (stepped_shaft)
  if (objectId === 'stepped_shaft') {
    return (
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Poros Besar */}
        <mesh position={[0, -12.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[15, 15, 25, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, -12.5, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(15, 15, 25, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.5} />
        </lineSegments>

        {/* Poros Kecil */}
        <mesh position={[0, 12.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[9, 9, 25, 48]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <lineSegments position={[0, 12.5, 0]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(9, 9, 25, 48)]} />
          <lineBasicMaterial color="#0f172a" linewidth={1.5} />
        </lineSegments>

        {/* Alur Pasak (Keyway) */}
        <mesh position={[7.5, 14, 0]} castShadow>
          <boxGeometry args={[3, 16, 5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (!geom) return null;

  return (
    <group>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial {...matProps} side={THREE.DoubleSide} />
      </mesh>
      {edgesGeom && (
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color="#0f172a" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
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
// 5. DIAGRAM 2D ORTOGONAL SVG DINAMIS
// ==========================================
const Orthographic2DPreview = ({ objectId, activeView }) => {
  const renderSVGPaths = () => {
    switch (objectId) {
      case 'stepped_l':
        if (activeView === 'kanan' || activeView === 'kiri') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Outer rectangle 30 x 40 */}
              <rect x="40" y="20" width="80" height="120" fill="#e0e7ff" stroke="#1e293b" strokeWidth="3" />
              {/* Undakan tengah */}
              <line x1="40" y1="80" x2="120" y2="80" stroke="#1e293b" strokeWidth="2.5" />
              {/* Keterangan */}
              <text x="80" y="55" fontSize="11" fontWeight="800" textAnchor="middle" fill="#1e40af">Bidang Atas</text>
              <text x="80" y="115" fontSize="11" fontWeight="800" textAnchor="middle" fill="#4338ca">Bidang Bawah</text>
            </svg>
          );
        }
        if (activeView === 'atas') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <rect x="25" y="40" width="110" height="80" fill="#dbeafe" stroke="#1e293b" strokeWidth="3" />
              <line x1="80" y1="40" x2="80" y2="120" stroke="#1e293b" strokeWidth="2.5" />
              <text x="52" y="85" fontSize="10" fontWeight="800" textAnchor="middle" fill="#1e40af">Puncak</text>
              <text x="108" y="85" fontSize="10" fontWeight="800" textAnchor="middle" fill="#2563eb">Undak</text>
            </svg>
          );
        }
        // default depan
        return (
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <polygon points="30,130 130,130 130,80 80,80 80,30 30,30" fill="#f1f5f9" stroke="#1e293b" strokeWidth="3" />
            <text x="55" y="60" fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Profil "L"</text>
          </svg>
        );

      case 'slotted_u':
        if (activeView === 'kanan' || activeView === 'kiri') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Kotak luar */}
              <rect x="35" y="35" width="90" height="90" fill="#ecfdf5" stroke="#1e293b" strokeWidth="3" />
              {/* Garis putus-putus (Hidden Line dasar alur) */}
              <line x1="35" y1="80" x2="125" y2="80" stroke="#ea580c" strokeWidth="2.5" strokeDasharray="6 4" />
              <text x="80" y="72" fontSize="9" fontWeight="800" textAnchor="middle" fill="#c2410c">Garis Tersembunyi (Alur U)</text>
              <text x="80" y="110" fontSize="10" fontWeight="700" textAnchor="middle" fill="#047857">Tampak Samping</text>
            </svg>
          );
        }
        if (activeView === 'atas') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <rect x="30" y="35" width="100" height="90" fill="#ecfdf5" stroke="#1e293b" strokeWidth="3" />
              <line x1="60" y1="35" x2="60" y2="125" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="100" y1="35" x2="100" y2="125" stroke="#1e293b" strokeWidth="2.5" />
              <text x="80" y="85" fontSize="10" fontWeight="800" textAnchor="middle" fill="#059669">Dasar Parit U</text>
            </svg>
          );
        }
        return (
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <polygon points="30,130 130,130 130,35 100,35 100,80 60,80 60,35 30,35" fill="#f1f5f9" stroke="#1e293b" strokeWidth="3" />
            <text x="80" y="110" fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Profil U-Slot</text>
          </svg>
        );

      case 'wedge':
        if (activeView === 'kanan' || activeView === 'kiri') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <rect x="35" y="25" width="90" height="110" fill="#fef3c7" stroke="#1e293b" strokeWidth="3" />
              <line x1="35" y1="85" x2="125" y2="85" stroke="#1e293b" strokeWidth="2.5" />
              <text x="80" y="60" fontSize="10" fontWeight="800" textAnchor="middle" fill="#b45309">Bidang Miring (Proyeksi)</text>
              <text x="80" y="112" fontSize="10" fontWeight="800" textAnchor="middle" fill="#78350f">Undak Datar</text>
            </svg>
          );
        }
        return (
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <polygon points="30,130 130,130 130,90 70,30 30,30" fill="#f1f5f9" stroke="#1e293b" strokeWidth="3" />
            <text x="95" y="65" fontSize="10" fontWeight="800" fill="#b45309">Kemiringan</text>
          </svg>
        );

      case 'stepped_shaft':
        if (activeView === 'kanan' || activeView === 'kiri') {
          return (
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Lingkaran Luar D30 */}
              <circle cx="80" cy="80" r="55" fill="#e0f2fe" stroke="#1e293b" strokeWidth="3" />
              {/* Lingkaran Dalam D18 */}
              <circle cx="80" cy="80" r="32" fill="#bae6fd" stroke="#1e293b" strokeWidth="2.5" />
              {/* Alur pasak */}
              <rect x="74" y="44" width="12" height="8" fill="#0f172a" stroke="#0f172a" strokeWidth="1" />
              {/* Garis sumbu */}
              <line x1="20" y1="80" x2="140" y2="80" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
              <line x1="80" y1="20" x2="80" y2="140" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
              <text x="80" y="100" fontSize="9" fontWeight="800" textAnchor="middle" fill="#0284c7">Lingkaran Konsentris</text>
            </svg>
          );
        }
        return (
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <rect x="25" y="45" width="55" height="70" fill="#e0f2fe" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="80" y="60" width="55" height="40" fill="#bae6fd" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="100" y="56" width="20" height="4" fill="#0f172a" />
            <line x1="15" y1="80" x2="145" y2="80" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            <text x="52" y="85" fontSize="10" fontWeight="800" textAnchor="middle" fill="#0369a1">D30</text>
            <text x="108" y="85" fontSize="10" fontWeight="800" textAnchor="middle" fill="#0284c7">D18</text>
          </svg>
        );

      default:
        // Generic CAD orthographic box preview
        return (
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <rect x="30" y="30" width="100" height="100" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" rx="4" />
            <line x1="30" y1="80" x2="130" y2="80" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" />
            <line x1="80" y1="30" x2="80" y2="130" stroke="#dc2626" strokeWidth="1" strokeDasharray="10 3 2 3" />
            <text x="80" y="70" fontSize="10" fontWeight="800" textAnchor="middle" fill="#0f172a">PROYEKSI 2D</text>
            <text x="80" y="105" fontSize="9" fontWeight="700" textAnchor="middle" fill="#64748b">ISO 128</text>
          </svg>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {renderSVGPaths()}
    </div>
  );
};

// ==========================================
// 6. MAIN SIMULATOR COMPONENT
// ==========================================
const OrthogonalMultiViewSimulator = () => {
  const [selectedObjectId, setSelectedObjectId] = useState('stepped_l');
  const [projectionSystem, setProjectionSystem] = useState('amerika'); // 'amerika' or 'eropa'
  const [activeView, setActiveView] = useState('kanan'); // default kanan to showcase user's request!
  const [materialMode, setMaterialMode] = useState('steel');
  const [autoRotate, setAutoRotate] = useState(false);

  const controlsRef = useRef(null);

  // Target Camera Positions according to ISO Orthographic Views
  const targetCamPos = useMemo(() => {
    const dist = 75;
    switch (activeView) {
      case 'depan':
        return new THREE.Vector3(0, 0, dist);
      case 'kanan': // USER'S MAIN REQUEST: Klik Pandangan Kanan -> Kamera ke +X
        return new THREE.Vector3(dist, 0, 0);
      case 'atas':
        return new THREE.Vector3(0, dist, 0.001);
      case 'kiri':
        return new THREE.Vector3(-dist, 0, 0);
      case 'bawah':
        return new THREE.Vector3(0, -dist, 0.001);
      case 'belakang':
        return new THREE.Vector3(0, 0, -dist);
      case 'isometri':
      default:
        return new THREE.Vector3(55, 45, 55);
    }
  }, [activeView]);

  const activeObject = OBJECT_CATALOG[selectedObjectId] || OBJECT_CATALOG.stepped_l;
  const currentViewDetails = activeObject.views[activeView] || activeObject.views.kanan || {
    title: `Pandangan ${activeView.toUpperCase()}`,
    desc: 'Orientasi sudut pandang ortogonal standar ISO 5456.',
    features: ['Orientasi 90 derajat', 'Sumbu proyeksi tegak lurus']
  };

  const handleSelectView = (viewKey) => {
    sound.playClick();
    setActiveView(viewKey);
  };

  const handleSelectObject = (objId) => {
    sound.playClick();
    setSelectedObjectId(objId);
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
                Simulator 3D Tata Letak Pandangan Ortogonal (Multi-View Placement)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Klik tombol pandangan (misal: <strong>👉 Pandangan Kanan</strong>) untuk melihat model 3D berputar otomatis secara halus ke sudut proyeksi terkait.
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

      {/* OBJECT SELECTION CAROUSEL / GRID (8 BENDA SEDERHANA) */}
      <div style={{
        background: '#fff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📦</span> Pilih Benda Latihan Ortogonal (8 Model Standar Mesin):
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
            {activeObject.category} • {activeObject.dimensions}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: '8px'
        }}>
          {Object.values(OBJECT_CATALOG).map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => handleSelectObject(obj.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#f8fafc',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 4px 10px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {obj.shortName}
                </div>
                <div style={{ fontSize: '0.68rem', color: isSelected ? '#3b82f6' : '#94a3b8' }}>
                  {obj.difficulty}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: 3D VIEWPORT (LEFT) & ORTHOGONAL LAYOUT / EXPLANATION (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '20px' }}>
        
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
                3D CAD Viewport
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
          <div style={{ height: '370px', width: '100%', position: 'relative' }}>
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

                {/* Technical Ground Grid - clean light technical grid */}
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
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <button
                  onClick={() => handleSelectView('depan')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeView === 'depan' ? '#2563eb' : '#f1f5f9',
                    color: activeView === 'depan' ? '#fff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'depan' ? '0 2px 6px rgba(37,99,235,0.4)' : 'none'
                  }}
                >
                  Depan
                </button>
                <button
                  onClick={() => handleSelectView('atas')}
                  style={{
                    padding: '6px 12px',
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
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: activeView === 'kanan' ? 'none' : '1px solid #86efac',
                    background: activeView === 'kanan' ? '#16a34a' : '#f0fdf4',
                    color: activeView === 'kanan' ? '#fff' : '#166534',
                    fontWeight: 900,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    boxShadow: activeView === 'kanan' ? '0 0 10px rgba(22, 163, 74, 0.5)' : 'none'
                  }}
                  title="Klik untuk memutar benda menampilkan pandangan kanan"
                >
                  👉 Kanan
                </button>
                <button
                  onClick={() => handleSelectView('kiri')}
                  style={{
                    padding: '6px 12px',
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
                    padding: '6px 12px',
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
                    background: autoRotate ? '#16a34a' : 'rgba(255, 255, 255, 0.94)',
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
            💡 <em>Tips:</em> Klik & drag untuk memutar bebas 360°, scroll mouse untuk zoom in/out, atau klik salah satu kotak proyeksi di samping untuk snapping instan!
          </div>
        </div>

        {/* RIGHT COLUMN: TATA LETAK MULTI-VIEW PROJECTION PLACEMENT & 2D PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TATA LETAK BIDANG INTERAKTIF (KLIK KOTAK -> BENDA BERPUTAR) */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  🗺️ Peta Tata Letak ({projectionSystem === 'amerika' ? 'Proyeksi Amerika' : 'Proyeksi Eropa'})
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Klik salah satu kotak pandangan di bawah untuk memutar model 3D:
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', background: projectionSystem === 'amerika' ? '#dbeafe' : '#fef3c7', color: projectionSystem === 'amerika' ? '#1e40af' : '#92400e' }}>
                {projectionSystem === 'amerika' ? 'Sudut Ketiga (3rd Angle)' : 'Sudut Pertama (1st Angle)'}
              </span>
            </div>

            {/* INTERACTIVE MULTI-VIEW BOXES */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              {projectionSystem === 'amerika' ? (
                /* SISTEM AMERIKA:
                   - Top di Atas Depan
                   - Front di Tengah
                   - Right di Kanan Depan
                */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 130px', gap: '10px', justifyContent: 'center' }}>
                    
                    {/* Placeholder Kosong */}
                    <div></div>

                    {/* PANDANGAN ATAS (KLIKABLE) */}
                    <button
                      onClick={() => handleSelectView('atas')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'atas' ? '2.5px solid #2563eb' : '1.5px solid #93c5fd',
                        background: activeView === 'atas' ? '#dbeafe' : '#eff6ff',
                        color: '#1e40af',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'atas' ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>PANDANGAN ATAS</div>
                      <div style={{ fontSize: '0.65rem', color: '#3b82f6', marginTop: '2px' }}>Ditarik ke ATAS</div>
                      {activeView === 'atas' && <span style={{ fontSize: '0.6rem', background: '#2563eb', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>

                    {/* PANDANGAN DEPAN (KLIKABLE) */}
                    <button
                      onClick={() => handleSelectView('depan')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'depan' ? '2.5px solid #0f172a' : '1.5px solid #64748b',
                        background: activeView === 'depan' ? '#e2e8f0' : '#f1f5f9',
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'depan' ? '0 0 12px rgba(15, 23, 42, 0.3)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>PANDANGAN DEPAN</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Pandangan Utama</div>
                      {activeView === 'depan' && <span style={{ fontSize: '0.6rem', background: '#0f172a', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>

                    {/* PANDANGAN KANAN (KLIKABLE - FITUR UTAMA USER) */}
                    <button
                      onClick={() => handleSelectView('kanan')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'kanan' ? '2.5px solid #16a34a' : '1.5px solid #86efac',
                        background: activeView === 'kanan' ? '#dcfce7' : '#f0fdf4',
                        color: '#166534',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'kanan' ? '0 0 14px rgba(22, 163, 74, 0.5)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>👉 PANDANGAN KANAN</div>
                      <div style={{ fontSize: '0.65rem', color: '#16a34a', marginTop: '2px' }}>Ditarik ke KANAN</div>
                      {activeView === 'kanan' && <span style={{ fontSize: '0.6rem', background: '#16a34a', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <strong>Kaidah Amerika:</strong> Searah & intuitif. Pandangan Kanan diletakkan tepat di sebelah <strong>KANAN</strong> pandangan depan.
                  </div>
                </div>
              ) : (
                /* SISTEM EROPA:
                   - Front di Tengah
                   - Pandangan Kiri diletakkan di KANAN
                   - Pandangan Kanan diletakkan di KIRI (Dilihat dari kanan, diproyeksikan ke kiri)
                   - Top di BAWAH Depan
                */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 130px', gap: '10px', justifyContent: 'center' }}>
                    
                    {/* PANDANGAN DEPAN */}
                    <button
                      onClick={() => handleSelectView('depan')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'depan' ? '2.5px solid #0f172a' : '1.5px solid #64748b',
                        background: activeView === 'depan' ? '#e2e8f0' : '#f1f5f9',
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'depan' ? '0 0 12px rgba(15, 23, 42, 0.3)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>PANDANGAN DEPAN</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>Pandangan Utama</div>
                      {activeView === 'depan' && <span style={{ fontSize: '0.6rem', background: '#0f172a', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>

                    {/* PANDANGAN KIRI (Dilihat dari kiri, ditarik ke KANAN) */}
                    <button
                      onClick={() => handleSelectView('kiri')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'kiri' ? '2.5px solid #d97706' : '1.5px solid #fcd34d',
                        background: activeView === 'kiri' ? '#fef3c7' : '#fffbeb',
                        color: '#92400e',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'kiri' ? '0 0 12px rgba(217, 119, 6, 0.4)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>PANDANGAN KIRI</div>
                      <div style={{ fontSize: '0.65rem', color: '#b45309', marginTop: '2px' }}>Diletakkan di KANAN</div>
                      {activeView === 'kiri' && <span style={{ fontSize: '0.6rem', background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>

                    {/* PANDANGAN ATAS (Dilihat dari atas, ditarik ke BAWAH) */}
                    <button
                      onClick={() => handleSelectView('atas')}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '8px',
                        border: activeView === 'atas' ? '2.5px solid #ea580c' : '1.5px solid #fdba74',
                        background: activeView === 'atas' ? '#ffedd5' : '#fff7ed',
                        color: '#9a3412',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: activeView === 'atas' ? '0 0 12px rgba(234, 88, 12, 0.4)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: '0.78rem' }}>PANDANGAN ATAS</div>
                      <div style={{ fontSize: '0.65rem', color: '#ea580c', marginTop: '2px' }}>Diletakkan di BAWAH</div>
                      {activeView === 'atas' && <span style={{ fontSize: '0.6rem', background: '#ea580c', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>AKTIF 3D</span>}
                    </button>

                    {/* Placeholder */}
                    <div></div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', background: '#fff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <strong>Kaidah Eropa:</strong> Prinsip bayangan seberang. Pandangan kanan pengamat diproyeksikan dan ditaruh di sebelah <strong>KIRI</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2D ORTHOGONAL PROJECTION PREVIEW & TECHNICAL EXPLANATION */}
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: '140px 1fr',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* SVG 2D View Box */}
            <div style={{
              width: '140px',
              height: '140px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}>
              <Orthographic2DPreview objectId={selectedObjectId} activeView={activeView} />
            </div>

            {/* Explanation text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px' }}>
                  GAMBAR PROYEKSI 2D (ISO 128)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentViewDetails.title}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {currentViewDetails.desc}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                <strong>Fitur Visual Utama:</strong>
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
