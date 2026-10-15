export const millingJobsheets = [
  {
    id: 'mill_jobsheet_1',
    title: 'Facing Permukaan (Rata Muka)',
    desc: 'Balok Mild Steel ST37 (100 x 50 x 30 mm) -> Sayat Muka Z: -1.0mm',
    material: 'Mild Steel (ST37)',
    toolDiameter: 16,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 30, // m/min
    targetMode: 'facing',
    // N = (1000 * 30) / (3.14 * 16) = 597 RPM -> range 550 - 650 RPM
    targetRpmRange: [550, 650],
    targetFeedRange: [80, 150],
    targetDepth: 1.0,
    description: 'Penyayatan rata muka (facing) permukaan atas balok baja Mild Steel. Hitung kecepatan putar spindel (RPM) berdasarkan diameter endmill Ø16mm dan Vc = 30 m/min. Atur kedalaman potong 1.0 mm dan ratakan seluruh bidang permukaan mengikuti garis panduan cyan.',
    thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    xpReward: 160,
    targetRegion: {
      type: 'facing',
      depth: 1.0,
      x: -50,
      y: -25,
      w: 100,
      l: 50,
      label: 'Bidang Facing Penuh (Z: -1.0mm)'
    }
  },
  {
    id: 'mill_jobsheet_2',
    title: 'Pengefraisan Undakan Bertingkat (Stepped Shoulder)',
    desc: 'Balok Mild Steel ST37 (100 x 50 x 30 mm) -> Undakan 50x50mm Z: -3.0mm',
    material: 'Mild Steel (ST37)',
    toolDiameter: 12,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 28,
    targetMode: 'step',
    // N = (1000 * 28) / (3.14 * 12) = 743 RPM -> range 700 - 800 RPM
    targetRpmRange: [700, 800],
    targetFeedRange: [100, 180],
    targetDepth: 3.0,
    description: 'Pembuatan undakan bertingkat tegak lurus pada separuh bidang balok (X: 0 hingga 50mm) dengan kedalaman 3.0 mm. Gunakan endmill Ø12mm dan ikuti batas garis kerja berwarna cyan.',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    xpReward: 200,
    targetRegion: {
      type: 'step',
      depth: 3.0,
      x: 0,
      y: -25,
      w: 50,
      l: 50,
      label: 'Undakan Bertingkat 50x50mm (Z: -3.0mm)'
    }
  },
  {
    id: 'mill_jobsheet_3',
    title: 'Pengefraisan Alur Pasak Memanjang (Slotting)',
    desc: 'Balok Aluminium 6061 (100 x 50 x 30 mm) -> Alur 100x12mm Z: -3.0mm',
    material: 'Aluminium 6061',
    toolDiameter: 10,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 90, // m/min untuk aluminium
    targetMode: 'alur',
    // N = (1000 * 90) / (3.14 * 10) = 2866 RPM -> range 2400 - 2900 RPM
    targetRpmRange: [2400, 2900],
    targetFeedRange: [180, 260],
    targetDepth: 3.0,
    description: 'Pembuatan alur pasak tembus memanjang di tengah balok aluminium menggunakan Endmill 4-flute Ø10mm. Buat kedalaman alur 3.0 mm dengan lebar 12.0 mm secara presisi lurus di sumbu X mengikuti garis job.',
    thumbnail: 'https://images.unsplash.com/photo-1533256059296-38d5db3c570b?auto=format&fit=crop&w=400&q=80',
    xpReward: 220,
    targetRegion: {
      type: 'slot',
      depth: 3.0,
      x: -50,
      y: -6,
      w: 100,
      l: 12,
      label: 'Alur Pasak Memanjang 100x12mm (Z: -3.0mm)'
    }
  },
  {
    id: 'mill_jobsheet_4',
    title: 'Pengefraisan Kantong Segiempat (Pocketing)',
    desc: 'Balok Kuningan Brass (100 x 50 x 30 mm) -> Kantong 50x30mm Z: -4.0mm',
    material: 'Kuningan (Brass)',
    toolDiameter: 10,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 50,
    targetMode: 'pocket',
    // N = (1000 * 50) / (3.14 * 10) = 1592 RPM -> range 1450 - 1650 RPM
    targetRpmRange: [1450, 1650],
    targetFeedRange: [120, 200],
    targetDepth: 4.0,
    description: 'Pembuatan kantong segiempat (pocket) tertutup di pusat balok kuningan berukuran 50 x 30 mm dengan kedalaman potong 4.0 mm. Sayat material di dalam kotak garis panduan blueprint.',
    thumbnail: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=400&q=80',
    xpReward: 250,
    targetRegion: {
      type: 'pocket',
      depth: 4.0,
      x: -25,
      y: -15,
      w: 50,
      l: 30,
      label: 'Kantong Tengah 50x30mm (Z: -4.0mm)'
    }
  },
  {
    id: 'mill_jobsheet_5',
    title: 'Pengefraisan Alur Melintang Sumbu Y (Cross Slotting)',
    desc: 'Balok ST37 (100 x 50 x 30 mm) -> Alur Melintang 16x50mm Z: -3.5mm',
    material: 'Mild Steel (ST37)',
    toolDiameter: 10,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 30,
    targetMode: 'alur',
    // N = (1000 * 30) / (3.14 * 10) = 955 RPM -> range 900 - 1050 RPM
    targetRpmRange: [900, 1050],
    targetFeedRange: [80, 140],
    targetDepth: 3.5,
    description: 'Pembuatan alur pasak melintang searah sumbu Y di tengah benda kerja dengan lebar 16.0 mm tembus sepanjang 50.0 mm dan kedalaman 3.5 mm. Ikuti batas garis kanal melintang cyan.',
    thumbnail: 'https://images.unsplash.com/photo-1590488427909-54fb27cf5c34?auto=format&fit=crop&w=400&q=80',
    xpReward: 280,
    targetRegion: {
      type: 'cross_slot',
      depth: 3.5,
      x: -8,
      y: -25,
      w: 16,
      l: 50,
      label: 'Alur Melintang Sumbu Y 16x50mm (Z: -3.5mm)'
    }
  }
];
