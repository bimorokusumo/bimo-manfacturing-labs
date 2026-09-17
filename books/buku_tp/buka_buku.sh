#!/bin/bash
# ==============================================================================
# Script Peluncur Buku Digital Interaktif Teknik Pemesinan (TP) - SMK N 2 Depok
# Kurikulum Deep Learning - 50 Halaman Lengkap
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================================"
echo " 📖 MEMBUKA BUKU DIGITAL INTERAKTIF TEKNIK PEMESINAN (TP) FASE E"
echo " SMK NEGERI 2 DEPOK SLEMAN - KURIKULUM DEEP LEARNING (50 HALAMAN)"
echo " Penyusun: Bimoro Kusumo, S.Pd (PPG 2025/2026)"
echo "========================================================================"
echo ""
echo "Menjalankan server lokal di port 8080..."
echo "Akses langsung di browser: http://localhost:8080"
echo "Tekan CTRL+C di terminal ini untuk menutup server kapan saja."
echo ""

python3 -m http.server 8080 &
SERVER_PID=$!

sleep 1
open "http://localhost:8080" 2>/dev/null || open "$DIR/index.html"

wait $SERVER_PID
