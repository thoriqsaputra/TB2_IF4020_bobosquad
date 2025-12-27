# Tugas Besar II IF4020 Kriptografi
## Sistem Pencatatan Ijazah Digital Berbasis Blockchain

Proyek ini adalah prototipe sistem penerbitan, penyimpanan, dan verifikasi ijazah digital. Sistem ini dirancang untuk mengatasi maraknya ijazah palsu dengan memanfaatkan teknologi **Blockchain** (sebagai *immutable ledger*) dan **Off-chain Storage** yang terenkripsi untuk menjaga privasi data.

## 📝 Deskripsi Proyek
Sistem ini memungkinkan institusi pendidikan untuk menerbitkan ijazah digital yang sah. Ijazah ditandatangani secara digital menggunakan **ECDSA**, kemudian file dokumennya dienkripsi dengan **AES** sebelum diunggah ke **IPFS**. Metadata transaksi (seperti hash ijazah dan alamat issuer) dicatat di dalam *smart contract* untuk memastikan integritas dan sifat *tamper-proof*. 

## 🛠️ Tech Stack

*   **Frontend**: React.js dengan TypeScript, Vite, dan Tailwind CSS
*   **Backend**: Node.js dengan Express.js
*   **Smart Contract**: Solidity
*   **Database**: PostgreSQL
*   **Decentralized Storage**: IPFS
*   **DevOps/Deployment**: Docker & Docker Compose

## 📦 Dependensi

### Backend
- `express`: Framework server
- `ethers`: Interaksi dengan provider blockchain/smart contract
- `pg` & `sequelize`: Library untuk database PostgreSQL
- `ipfs-http-client`: Komunikasi dengan node IPFS
- `crypto`: Implementasi enkripsi AES dan hashing SHA-256
- `jsonwebtoken`: Autentikasi berbasis token

### Frontend
- `react`, `react-dom`: Library UI utama
- `ethers`: Koneksi ke dompet kripto (Metamask) dan integrasi Smart Contract
- `axios`: HTTP client untuk komunikasi ke backend
- `tailwindcss`, `postcss`: Styling framework
- `lucide-react`: Library icon

### Smart Contract
- `hardhat`: Development environment untuk Ethereum
- `ethers.js`: Library untuk pengujian dan skrip deploy

## 🚀 Cara Menjalankan
Pastikan Anda sudah menginstal **Docker** dan **Docker Compose** di mesin Anda.

1. Clone repositori ini:
   ```bash
   git clone https://github.com/thoriqsaputra/TB2_IF4020_bobosquad
   cd TB2_IF4020_bobosquad
   ```

2. Jalankan seluruh layanan menggunakan Docker Compose:
   ```bash
   docker compose up --build
   ```

3. Akses aplikasi melalui browser:
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3000`
   - **IPFS Gateway**: `http://localhost:8080`

*Catatan: Pastikan port tersebut tidak sedang digunakan oleh aplikasi lain.*

## 👥 Pembagian Tugas

| Nama | NIM | Tugas |
| :--- | :--- | :--- |
| Ahmad Thoriq Saputra | 13522141 | Mengerjakan kode bersama-sama |
| Muhammad Fatihul Irhab | 13522143 | Mengerjakan kode bersama-sama |
| Ikhwan Al Hakim | 13522147 | Mengerjakan kode bersama-sama |

---
