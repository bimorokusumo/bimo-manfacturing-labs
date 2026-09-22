#!/bin/bash
# ==============================================================================
# BIMO MANUFACTURING LABS - LAUNCHER OTOMATIS
# Cukup klik 2x file ini di folder untuk langsung menjalankan & membuka Web Labs
# ==============================================================================

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Pindah ke folder proyek ini
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

clear
echo "===================================================================="
echo "         🏭 BIMO MANUFACTURING LABS (SMKN 2 DEPOK)                 "
echo "===================================================================="
echo " Sedang menyalakan server lokal Vite..."
echo " Browser akan terbuka otomatis dalam 2 detik!"
echo ""
echo " URL Lokal   : http://localhost:5173/bimo-manfacturing-labs/"
echo "===================================================================="
echo " (Untuk menutup server: Cukup tutup jendela Terminal ini atau tekan Ctrl+C)"
echo "===================================================================="
echo ""

# Buka Google Chrome / Safari / Browser default otomatis
(sleep 2 && open "http://localhost:5173/bimo-manfacturing-labs/") &

# Jalankan server
npm run dev -- --host
