export const latheJobsheets = [
  {
    id: 'jobsheet_1',
    title: 'Bubut Rata Silindris (Facing & Turning)',
    desc: 'Baja ST37 Ø 50mm -> Ø 44mm (P: 70mm)',
    material: 'Mild Steel (ST37)',
    diameter: 50,
    length: 100,
    vc: 25, // m/min
    targetMode: 'rata', // 'rata', 'ulir', 'alur'
    // N = (1000 * 25) / (3.14 * 50) = 159.2 RPM -> toleransi 150 - 175 RPM
    targetRpmRange: [150, 175],
    targetFeedRange: [0.1, 0.4],
    description: 'Penyayatan rata silindris permukaan luar dari Ø 50mm menjadi Ø 44mm (kedalaman potong 3mm) sepanjang 70mm. Ikuti garis blueprint target berwarna cyan di layar 2D.',
    thumbnail: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    xpReward: 150,
    targetSteps: [
      { zStart: 0, zEnd: -70, diameter: 44.0, label: 'Ø44 x 70mm (Sayat 3mm)' },
      { zStart: -70, zEnd: -100, diameter: 50.0, label: 'Ø50 (Pencekaman)' }
    ]
  },
  {
    id: 'jobsheet_2',
    title: 'Poros Bertingkat 2 Undakan (Stepped Shaft)',
    desc: 'Baja ST37 Ø 50mm -> Step 1: Ø 36 x 35mm, Step 2: Ø 44 x 35mm',
    material: 'Mild Steel (ST37)',
    diameter: 50,
    length: 100,
    vc: 25,
    targetMode: 'rata',
    // N = (1000 * 25) / (3.14 * 40) = 198.9 RPM -> toleransi 180 - 220 RPM
    targetRpmRange: [180, 220],
    targetFeedRange: [0.1, 0.35],
    description: 'Pembuatan poros bertingkat 2 undakan tegak lurus (90°). Tingkat 1 di ujung depan disayat ke Ø 36mm sepanjang 35mm. Tingkat 2 disayat ke Ø 44mm sepanjang 35mm.',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    xpReward: 200,
    targetSteps: [
      { zStart: 0, zEnd: -35, diameter: 36.0, label: 'Tingkat 1: Ø36 x 35mm' },
      { zStart: -35, zEnd: -70, diameter: 44.0, label: 'Tingkat 2: Ø44 x 35mm' },
      { zStart: -70, zEnd: -100, diameter: 50.0, label: 'Ø50 (Pencekaman)' }
    ]
  },
  {
    id: 'jobsheet_3',
    title: 'Poros Bertingkat & Alur (Stepped Shaft + Grooving)',
    desc: 'Kuningan Ø 50mm -> Step Ø42mm, Alur W=5mm Ø32mm, Step Ø46mm',
    material: 'Kuningan (Brass)',
    diameter: 50,
    length: 100,
    vc: 45,
    targetMode: 'alur',
    // N = (1000 * 45) / (3.14 * 40) = 358 RPM -> toleransi 340 - 400 RPM
    targetRpmRange: [340, 400],
    targetFeedRange: [0.05, 0.15],
    description: 'Pembuatan poros bertingkat dengan alur pasak/circlip di antara dua silinder. Buat step depan Ø 42mm, lalu potong alur selebar 5mm sedalam Ø 32mm menggunakan pahat alur, dan step belakang Ø 46mm.',
    thumbnail: 'https://images.unsplash.com/photo-1533256059296-38d5db3c570b?auto=format&fit=crop&w=400&q=80',
    xpReward: 250,
    targetSteps: [
      { zStart: 0, zEnd: -35, diameter: 42.0, label: 'Silinder 1: Ø42 x 35mm' },
      { zStart: -35, zEnd: -40, diameter: 32.0, isGroove: true, label: 'Alur W=5mm (Ø32)' },
      { zStart: -40, zEnd: -75, diameter: 46.0, label: 'Silinder 2: Ø46 x 35mm' },
      { zStart: -75, zEnd: -100, diameter: 50.0, label: 'Ø50 (Pencekaman)' }
    ]
  },
  {
    id: 'jobsheet_4',
    title: 'Poros Tirus & Silindris (Taper Turning & Step)',
    desc: 'Aluminium Ø 50mm -> Tirus Ø 34mm→Ø 44mm (L=35mm), Step Ø 44mm',
    material: 'Aluminium',
    diameter: 50,
    length: 100,
    vc: 60,
    targetMode: 'rata',
    // N = (1000 * 60) / (3.14 * 40) = 477 RPM -> toleransi 450 - 520 RPM
    targetRpmRange: [450, 520],
    targetFeedRange: [0.1, 0.3],
    description: 'Pembubutan bidang tirus bersambung dengan bidang silindris. Bagian tirus melandai dari diameter muka Ø 34mm membesar ke Ø 44mm pada panjang 35mm, dilanjutkan silinder lurus Ø 44mm.',
    thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80',
    xpReward: 260,
    targetSteps: [
      { zStart: 0, zEnd: -35, startDia: 34.0, endDia: 44.0, isTaper: true, label: 'Tirus Ø34→Ø44 (L=35)' },
      { zStart: -35, zEnd: -70, diameter: 44.0, label: 'Silinder Ø44 x 35mm' },
      { zStart: -70, zEnd: -100, diameter: 50.0, label: 'Ø50 (Pencekaman)' }
    ]
  },
  {
    id: 'jobsheet_5',
    title: 'Poros Ulir Bertingkat (Stepped Threading M20x2.5 + Undercut)',
    desc: 'Aluminium Ø 50mm -> Ulir M20x2.5 (L=30mm), Alur Bebas Ø16mm, Pundak Ø32mm',
    material: 'Aluminium',
    diameter: 50,
    length: 100,
    vc: 30, // Ulir biasanya 1/3 dari Vc normal
    targetMode: 'ulir',
    // N = (1000 * 30) / (3.14 * 20) = 477.7 RPM -> toleransi 450 - 500 RPM
    targetRpmRange: [450, 500],
    targetFeedRange: [2.5, 2.5], // Pitch = 2.5 mm
    description: 'Pembuatan poros ulir metris M20x2.5 lengkap dengan alur pembebas pahat ulir (undercut W=4mm Ø16mm) dan pundak bantalan silindris Ø 32mm. Pasang mode ulir dengan feed = pitch 2.5mm.',
    thumbnail: 'https://images.unsplash.com/photo-1590488427909-54fb27cf5c34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    xpReward: 300,
    targetSteps: [
      { zStart: 0, zEnd: -30, diameter: 20.0, isThread: true, label: 'Ulir M20x2.5 (L=30)' },
      { zStart: -30, zEnd: -34, diameter: 16.0, isGroove: true, label: 'Alur Bebas W=4 Ø16' },
      { zStart: -34, zEnd: -70, diameter: 32.0, label: 'Pundak Ø32 x 36mm' },
      { zStart: -70, zEnd: -100, diameter: 50.0, label: 'Ø50 (Pencekaman)' }
    ]
  }
];
