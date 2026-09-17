export const latheJobsheets = [
  {
    id: 'jobsheet_1',
    title: 'Bubut Rata (Facing & Turning)',
    desc: 'Mild Steel Ø 50mm, P: 100mm',
    material: 'Mild Steel (ST37)',
    diameter: 50,
    length: 100,
    vc: 25, // m/min
    targetMode: 'rata', // 'rata', 'ulir', 'alur'
    // Rumus N = (1000 * Vc) / (pi * d) = (1000 * 25) / (3.14 * 50) = 25000 / 157 = 159.2 RPM
    // Kita buat rentang toleransi 150 - 170 RPM
    targetRpmRange: [150, 170], 
    targetFeedRange: [0.1, 0.4],
    description: 'Hitung RPM optimal untuk material Mild Steel (Vc = 25 m/min) dengan Diameter 50mm menggunakan pahat Carbide. Atur Mode Mesin, RPM, dan Feed Rate dengan benar.',
    thumbnail: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    xpReward: 150
  },
  {
    id: 'jobsheet_2',
    title: 'Bubut Ulir (Threading)',
    desc: 'Aluminium M20 x 2.5',
    material: 'Aluminium',
    diameter: 20,
    length: 50,
    vc: 30, // Ulir biasanya 1/3 dari Vc normal, misal Vc ulir aluminium = 30 m/min
    targetMode: 'ulir',
    // N = (1000 * 30) / (3.14 * 20) = 30000 / 62.8 = 477.7 RPM
    // Toleransi 450 - 500 RPM
    targetRpmRange: [450, 500],
    targetFeedRange: [2.5, 2.5], // Untuk ulir, Feed Rate = Pitch = 2.5
    description: 'Hitung RPM untuk Ulir M20x2.5 pada Aluminium (Vc = 30 m/min). Pastikan Mode Mesin disetel ke Threading (Ulir) dan Feed Rate sama dengan Pitch (2.5 mm).',
    thumbnail: 'https://images.unsplash.com/photo-1590488427909-54fb27cf5c34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    xpReward: 250
  },
  {
    id: 'jobsheet_3',
    title: 'Bubut Alur (Grooving)',
    desc: 'Kuningan Ø 30mm',
    material: 'Kuningan (Brass)',
    diameter: 30,
    length: 80,
    vc: 40,
    targetMode: 'alur',
    // N = (1000 * 40) / (3.14 * 30) = 40000 / 94.2 = 424.6 RPM
    // Toleransi 400 - 450 RPM
    targetRpmRange: [400, 450],
    targetFeedRange: [0.05, 0.15],
    description: 'Tentukan RPM yang tepat untuk membuat alur pada Kuningan (Vc = 40 m/min) dengan Diameter 30mm. Atur ke Mode Alur dengan Feed Rate rendah.',
    thumbnail: 'https://images.unsplash.com/photo-1533256059296-38d5db3c570b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    xpReward: 200
  }
];
