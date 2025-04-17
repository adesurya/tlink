#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Memulai setup taplink SIJAGO Affiliate App ===${NC}"

# Cek apakah Node.js terinstall
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js tidak ditemukan. Silakan install Node.js terlebih dahulu.${NC}"
    exit 1
fi

# Cek apakah npm terinstall
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm tidak ditemukan. Silakan install npm terlebih dahulu.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Cek apakah file .env ada
if [ ! -f .env ]; then
    echo -e "${YELLOW}File .env tidak ditemukan. Membuat file .env dari template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}File .env dibuat. Silakan sesuaikan konfigurasi sesuai kebutuhan.${NC}"
fi

# Buat direktori untuk gambar produk
echo -e "${YELLOW}Membuat direktori untuk gambar produk...${NC}"
mkdir -p public/images/products

# Membuat beberapa gambar dummy menggunakan placeholder.com
echo -e "${YELLOW}Membuat gambar produk dummy...${NC}"

# Fungsi untuk mendownload placeholder
download_placeholder() {
    category=$1
    id=$2
    curl -s "https://via.placeholder.com/300x300.png?text=${category}+${id}" > "public/images/products/${category}${id}.jpg"
}

# Download beberapa gambar placeholder untuk setiap kategori
for category in "beauty" "fashion" "electronics" "baby" "home"; do
    for i in {1..5}; do
        download_placeholder $category $i
        echo -e "Gambar ${category}${i}.jpg dibuat."
    done
done

echo -e "${GREEN}Gambar dummy telah dibuat.${NC}"

# Seed database
echo -e "${YELLOW}Seeding database...${NC}"
node seed/seed-data.js

echo -e "${GREEN}=== Setup taplink SIJAGO Affiliate App selesai ===${NC}"
echo -e "${GREEN}Jalankan aplikasi dengan perintah: npm start${NC}"
echo -e "${GREEN}Atau mode development: npm run dev${NC}"