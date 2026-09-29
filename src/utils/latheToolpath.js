// =========================================================================
// LATHE TOOLPATH & STEPPED PROFILE UTILITY
// Standar Industri: Sudut 90 Derajat (Perpendicular Shoulder) & G-Code Trajectory
// =========================================================================

export const PROFILE_RESOLUTION = 100;

/**
 * Mendeteksi segmen silinder konstan dan batas step bertingkat (sudut 90 derajat).
 * Menghindari hasil tirus/slanted/miring akibat interpolasi diagonal.
 */
export const generateSteppedProfileSegments = (profile, rawDiameter = 50) => {
  if (!profile || profile.length === 0) return [];
  const N = profile.length;
  const segments = [];
  let segStart = 0;
  let currentDia = profile[0] !== undefined ? profile[0] : rawDiameter;

  for (let i = 1; i < N; i++) {
    const dia = profile[i] !== undefined ? profile[i] : rawDiameter;
    // Step boundary jika selisih diameter lebih dari 0.15mm
    if (Math.abs(dia - currentDia) > 0.15) {
      segments.push({
        startIndex: segStart,
        endIndex: i, // batas step berada di index i
        diameter: currentDia
      });
      segStart = i;
      currentDia = dia;
    }
  }

  // Segmen terakhir sampai ujung cekam
  segments.push({
    startIndex: segStart,
    endIndex: N - 1,
    diameter: currentDia
  });

  return segments;
};

/**
 * Menghasilkan titik poligon SVG 2D dengan bidang silinder horizontal
 * dan undakan tegak lurus STRICTLY 90 DERAJAT (Delta X = 0).
 */
export const generateSteppedProfilePoints2D = (
  profile,
  rawDiameter = 50,
  rawLength = 100,
  workpieceWidthPx = 400,
  centerY = 200
) => {
  if (!profile || profile.length === 0) return '';
  const N = profile.length;
  const scaleY = 175 / 50; // Skala radius (25mm = 87.5px)
  const segments = generateSteppedProfileSegments(profile, rawDiameter);

  const topPoints = [];
  const bottomPoints = [];

  // Index 0 adalah muka benda kerja (Z=0, X=600)
  // Index N-1 adalah sisi cekam (Z=-rawLength, X=600 - workpieceWidthPx)
  const getX = (idx) => 600 - (idx / (N - 1)) * workpieceWidthPx;

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    const xStart = getX(seg.startIndex);
    const xEnd = getX(seg.endIndex);
    const rPx = (seg.diameter / 2) * scaleY;

    // Titik awal segmen silinder
    topPoints.push(`${xStart.toFixed(1)},${(centerY - rPx).toFixed(1)}`);
    bottomPoints.push(`${xStart.toFixed(1)},${(centerY + rPx).toFixed(1)}`);

    // Titik akhir segmen silinder
    topPoints.push(`${xEnd.toFixed(1)},${(centerY - rPx).toFixed(1)}`);
    bottomPoints.push(`${xEnd.toFixed(1)},${(centerY + rPx).toFixed(1)}`);

    // Jika ada segmen berikutnya dengan diameter berbeda,
    // iterasi berikutnya akan menambahkan titik di xEnd yang SAMA persis.
    // Menghubungkan titik (xEnd, r1) dan (xEnd, r2) menghasilkan garis tegak vertikal 90 DERAJAT!
  }

  bottomPoints.reverse();
  return [...topPoints, ...bottomPoints].join(' ');
};

/**
 * Parser Alur Gerakan Pahat dari Program G-Code ISO Mesin Bubut CNC
 * Menghasilkan segmen gerakan:
 * - 'rapid': G00 (gerakan cepat tanpa menyayat, kuning putus-putus)
 * - 'cut': G01 / G92 (gerakan pemakanan menyayat benda kerja, cyan solid bercahaya)
 */
export const parseGcodeToolpath = (gcodeText, rawDiameter = 50, rawLength = 100) => {
  if (!gcodeText) return [];
  const lines = gcodeText.split('\n');
  const segments = [];

  let curX = rawDiameter + 4;
  let curZ = 4.0;
  let modalG = 'G00';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('(') || rawLine.startsWith('O') || rawLine.startsWith('%')) {
      continue;
    }
    // Hapus komentar dalam tanda kurung
    const line = rawLine.replace(/\(.*?\)/g, '').trim().toUpperCase();
    if (!line) continue;

    // Update modal G command
    if (line.includes('G00') || line.includes('G0 ')) modalG = 'G00';
    else if (line.includes('G01') || line.includes('G1 ')) modalG = 'G01';
    else if (line.includes('G92')) modalG = 'G92';

    // Parse X, Z, F
    const xMatch = line.match(/X([-\d.]+)/);
    const zMatch = line.match(/Z([-\d.]+)/);

    let targetX = curX;
    let targetZ = curZ;

    if (xMatch) {
      const val = parseFloat(xMatch[1]);
      targetX = (val <= 2.5 && val > 0) ? val * rawDiameter : val;
    }
    if (zMatch) {
      const val = parseFloat(zMatch[1]);
      targetZ = (val < 0 && Math.abs(val) <= 3.0) ? (val / 2.0) * rawLength : val;
    }

    if (modalG === 'G92') {
      // Siklus pembuatan ulir G92 (4 gerakan standar CNC)
      const safeX = rawDiameter + 4;
      const startZ = curZ;

      // 1. Rapid infeed ke kedalaman ulir pass ini
      segments.push({
        type: 'rapid',
        from: { x: curX, z: curZ },
        to: { x: targetX, z: startZ },
        lineIndex: i,
        label: `G92 Infeed X${targetX.toFixed(1)}`
      });
      // 2. Pemakanan ulir sinkron sepanjang Z
      segments.push({
        type: 'cut',
        from: { x: targetX, z: startZ },
        to: { x: targetX, z: targetZ },
        lineIndex: i,
        label: `G92 Sayat Ulir X${targetX.toFixed(1)} Z${targetZ.toFixed(1)}`
      });
      // 3. Retract miring 45 derajat keluar ulir
      segments.push({
        type: 'rapid',
        from: { x: targetX, z: targetZ },
        to: { x: safeX, z: targetZ },
        lineIndex: i,
        label: `G92 Retract X${safeX.toFixed(1)}`
      });
      // 4. Return cepat ke posisi awal startZ
      segments.push({
        type: 'rapid',
        from: { x: safeX, z: targetZ },
        to: { x: safeX, z: startZ },
        lineIndex: i,
        label: `G92 Return Z${startZ.toFixed(1)}`
      });

      curX = safeX;
      curZ = startZ;
    } else if (xMatch || zMatch) {
      const isRapid = modalG === 'G00';
      segments.push({
        type: isRapid ? 'rapid' : 'cut',
        from: { x: curX, z: curZ },
        to: { x: targetX, z: targetZ },
        lineIndex: i,
        label: `${modalG} X${targetX.toFixed(1)} Z${targetZ.toFixed(1)}`
      });

      curX = targetX;
      curZ = targetZ;
    }
  }

  return segments;
};

/**
 * Ekstraksi titik waypoints unik dari segmen toolpath untuk penanda koordinat
 */
export const extractToolpathWaypoints = (segments) => {
  if (!segments || segments.length === 0) return [];
  const waypoints = [];
  const visited = new Set();

  segments.forEach(seg => {
    const k1 = `${seg.from.x.toFixed(1)},${seg.from.z.toFixed(1)}`;
    const k2 = `${seg.to.x.toFixed(1)},${seg.to.z.toFixed(1)}`;
    if (!visited.has(k1)) {
      visited.add(k1);
      waypoints.push(seg.from);
    }
    if (!visited.has(k2)) {
      visited.add(k2);
      waypoints.push(seg.to);
    }
  });

  return waypoints;
};
