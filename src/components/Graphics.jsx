import React from 'react';

// LOGO GRAPHIC
export const LogoIcon = ({ size = 32, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" fill={color}/>
    <path d="M19 8L21 6M17 4L19 2M21 4L22 3" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// TEKNIK PEMESINAN / LATHE GRAPHIC
export const LatheIcon = ({ size = 48, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="42" width="48" height="10" rx="2" fill="#334155"/>
    <rect x="12" y="52" width="8" height="6" fill="#1e293b"/>
    <rect x="44" y="52" width="8" height="6" fill="#1e293b"/>
    <rect x="10" y="24" width="16" height="18" rx="2" fill={color}/>
    <circle cx="18" cy="33" r="4" fill="#ffffff"/>
    <rect x="26" y="30" width="8" height="6" fill="#94a3b8"/>
    <rect x="34" y="28" width="10" height="14" rx="2" fill="#64748b"/>
    <path d="M39 20V28" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
    <rect x="48" y="26" width="10" height="16" rx="2" fill="#475569"/>
    <circle cx="53" cy="34" r="3" fill="#cbd5e1"/>
  </svg>
);

// WELDING TORCH GRAPHIC
export const WeldingIcon = ({ size = 48, color = "#ea580c" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 52L26 38" stroke="#334155" strokeWidth="8" strokeLinecap="round"/>
    <path d="M26 38L42 22" stroke={color} strokeWidth="6" strokeLinecap="round"/>
    <path d="M42 22L48 16" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
    {/* ARC FLASH SPARKS */}
    <circle cx="52" cy="12" r="5" fill="#f59e0b"/>
    <path d="M52 4V8M52 16V20M44 12H48M56 12H60M46 6L49 9M55 15L58 18" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// K3 / SAFETY HELMET GRAPHIC
export const SafetyIcon = ({ size = 48, color = "#10b981" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 36C12 24.9543 20.9543 16 32 16C43.0457 16 52 24.9543 52 36V40H12V36Z" fill="#f59e0b"/>
    <rect x="8" y="38" width="48" height="6" rx="3" fill="#d97706"/>
    <rect x="28" y="20" width="8" height="16" fill="#fbbf24"/>
    <rect x="20" y="44" width="24" height="12" rx="4" fill="#334155"/>
    <circle cx="26" cy="50" r="3" fill={color}/>
    <circle cx="38" cy="50" r="3" fill={color}/>
  </svg>
);

// GEAR SYSTEM GRAPHIC
export const GearIcon = ({ size = 48, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="36" r="14" fill={color}/>
    <circle cx="26" cy="36" r="6" fill="#ffffff"/>
    <circle cx="44" cy="22" r="10" fill="#2563eb"/>
    <circle cx="44" cy="22" r="4" fill="#ffffff"/>
    <path d="M26 18V22M26 50V54M8 36H12M40 36H44" stroke={color} strokeWidth="4" strokeLinecap="round"/>
    <path d="M44 8V12M44 32V36M30 22H34M54 22H58" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

// MATERIAL SCIENCE GRAPHIC
export const MaterialIcon = ({ size = 48, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="#cbd5e1" stroke="#475569" strokeWidth="3"/>
    <polygon points="32,8 52,20 32,32 12,20" fill="#e2e8f0"/>
    <polygon points="32,32 52,20 52,44 32,56" fill="#94a3b8"/>
    <circle cx="32" cy="32" r="6" fill={color}/>
  </svg>
);

// GENERAL UI GRAPHIC ICONS
export const CheckIcon = ({ size = 20, color = "#10b981" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const WarningIcon = ({ size = 20, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const TrophyIcon = ({ size = 48, color = "#f59e0b" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 12H48V28C48 36.8366 40.8366 44 32 44C23.1634 44 16 36.8366 16 28V12Z" fill={color}/>
    <path d="M16 18H8C8 26 14 30 16 30V18Z" fill="#d97706"/>
    <path d="M48 18H56C56 26 50 30 48 30V18Z" fill="#d97706"/>
    <rect x="28" y="44" width="8" height="10" fill="#475569"/>
    <rect x="20" y="54" width="24" height="6" rx="2" fill="#1e293b"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const ArrowLeftIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
