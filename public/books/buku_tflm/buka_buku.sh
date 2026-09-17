#!/bin/bash
# ==============================================================================
# Script Peluncur Buku Digital Interaktif TFLM - SMK N 2 Depok Sleman
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================================"
echo " 📖 MEMBUKA BUKU DIGITAL INTERAKTIF TFLM FASE E"
echo " SMK NEGERI 2 DEPOK SLEMAN - KURIKULUM DEEP LEARNING"
echo " Penyusun: Bimoro Kusumo, S.Pd (PPG 2025/2026)"
echo "========================================================================"
echo ""
echo "Menjalankan server lokal di port 8000..."
echo "Akses langsung di browser: http://localhost:8000"
echo "Tekan CTRL+C di terminal ini untuk menutup server kapan saja."
echo ""

# Buka otomatis di browser bawaan macOS
python3 -m http.server 8000 &
SERVER_PID=$!

sleep 1
open "http://localhost:8000" 2>/dev/null || open "$DIR/index.html"

# Tunggu proses server
wait $SERVER_PID
