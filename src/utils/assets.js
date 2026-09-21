/**
 * Asset URL Resolver Utility
 * Memastikan path file lokal (/assets/..., /images/..., dll.) otomatis
 * terselesaikan dengan benar sesuai base path environment (misal /bimo-manfacturing-labs/)
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  // Abaikan URL eksternal atau data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return cleanBase + cleanPath;
};

/**
 * Avatar SVG generator lokal (0 latency, 0 network request)
 * Menggantikan layanan eksternal ui-avatars.com yang lambat
 */
export const getInitialsAvatar = (name = 'Siswa', isTeacher = false) => {
  const cleanName = (name || 'S').trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'S';
  const bgColor = isTeacher ? '#f59e0b' : '#0284c7';
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${encodeURIComponent(bgColor)}"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(initial)}</text></svg>`;
};
