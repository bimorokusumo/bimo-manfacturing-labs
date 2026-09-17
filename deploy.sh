#!/bin/bash
# ==============================================================================
# SCRIPT DEPLOY LABS KE GITHUB
# Repository: https://github.com/bimorokusumo/Website-AI-Talent-Mapping
# ==============================================================================

set -e

cd "$(dirname "$0")"

echo "=========================================================="
echo "🚀 MEMULAI DEPLOY WEB LABS KE GITHUB"
echo "=========================================================="

# 1. Build Project
echo "📦 Menjalankan build produksi..."
npm run build

# 2. Git Status
echo "🔍 Memeriksa status git..."
git add .
if ! git diff-index --quiet HEAD --; then
  git commit -m "feat: deploy latest Web Labs with 3D Safety & Heat Treatment"
fi

echo "----------------------------------------------------------"
echo "PILIH METODE PUSH KE GITHUB:"
echo "1) Personal Access Token (PAT) [Paling Praktis]"
echo "2) SSH Key (id_ed25519)"
echo "----------------------------------------------------------"
read -p "Masukkan pilihan [1 atau 2]: " choice

if [ "$choice" == "1" ]; then
  read -s -p "Masukkan GitHub Personal Access Token (ghp_...): " GITHUB_TOKEN
  echo ""
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token tidak boleh kosong!"
    exit 1
  fi
  echo "🚀 Mengirim ke https://github.com/bimorokusumo/Website-AI-Talent-Mapping.git..."
  git push -u "https://${GITHUB_TOKEN}@github.com/bimorokusumo/Website-AI-Talent-Mapping.git" main --force
  echo "✅ Berhasil dideploy ke GitHub!"
elif [ "$choice" == "2" ]; then
  echo "🚀 Mengirim via SSH..."
  git remote set-url origin git@github.com:bimorokusumo/Website-AI-Talent-Mapping.git
  git push -u origin main --force
  echo "✅ Berhasil dideploy ke GitHub!"
else
  echo "❌ Pilihan tidak valid."
  exit 1
fi

echo "=========================================================="
echo "🎉 DEPLOY SELESAI!"
echo "Repository: https://github.com/bimorokusumo/Website-AI-Talent-Mapping"
echo "GitHub Actions akan otomatis mempublikasikan website ke GitHub Pages."
echo "=========================================================="
