export const millingJobsheets = [
  {
    id: 'mill_jobsheet_1',
    title: 'Facing Permukaan (Rata Muka)',
    desc: 'Balok Mild Steel ST37 (100 x 50 x 30 mm)',
    material: 'Mild Steel (ST37)',
    toolDiameter: 16,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 30, // m/min
    targetMode: 'facing',
    // N = (1000 * Vc) / (pi * D) = (1000 * 30) / (3.14 * 16) = 30000 / 50.24 = 597 RPM
    targetRpmRange: [550, 650],
    targetFeedRange: [80, 150],
    targetDepth: 1.0,
    description: 'Penyayatan rata muka (facing) permukaan atas balok baja Mild Steel. Hitung kecepatan putar spindel (RPM) berdasarkan diameter endmill Ø16mm dan Vc = 30 m/min. Atur kedalaman potong 1.0 mm dan ratakan seluruh bidang permukaan.',
    thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    xpReward: 160
  },
  {
    id: 'mill_jobsheet_2',
    title: 'Pengefraisan Alur Pasak (Slotting)',
    desc: 'Balok Aluminium 6061 (100 x 50 x 30 mm)',
    material: 'Aluminium 6061',
    toolDiameter: 10,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 90, // m/min untuk aluminium
    targetMode: 'alur',
    // N = (1000 * 90) / (3.14 * 10) = 90000 / 31.4 = 2866 RPM -> range 2400 - 2900 RPM
    targetRpmRange: [2400, 2900],
    targetFeedRange: [180, 260],
    targetDepth: 2.0,
    description: 'Pembuatan alur pasak tembus memanjang di tengah balok aluminium menggunakan Endmill 4-flute Ø10mm. Buat kedalaman alur 2.0 mm secara presisi lurus di sumbu X.',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    xpReward: 220
  },
  {
    id: 'mill_jobsheet_3',
    title: 'Pengefraisan Kantong (Pocketing)',
    desc: 'Balok Kuningan Brass (100 x 50 x 30 mm)',
    material: 'Kuningan (Brass)',
    toolDiameter: 12,
    dimensions: { w: 100, l: 50, t: 30 },
    vc: 50,
    targetMode: 'pocket',
    // N = (1000 * 50) / (3.14 * 12) = 50000 / 37.68 = 1327 RPM
    targetRpmRange: [1250, 1400],
    targetFeedRange: [100, 180],
    targetDepth: 3.0,
    description: 'Pembuatan kantong segiempat (pocket) di tengah bidang kerja dengan kedalaman 3.0 mm. Pastikan putaran spindel stabil dan gunakan cairan pendingin (coolant) untuk menjaga kualitas permukaan.',
    thumbnail: 'https://images.unsplash.com/photo-1533256059296-38d5db3c570b?auto=format&fit=crop&w=400&q=80',
    xpReward: 250
  }
];
