# 🚢 GoShip - Logistics Microservices System

**GoShip** adalah sistem manajemen logistik berbasis **Microservices** yang dibangun menggunakan **Node.js**, **Apollo GraphQL Federation**, dan **Docker**.  
Sistem ini berperan sebagai **Third-Party Logistics (3PL)** yang menyediakan layanan perhitungan ongkos kirim, manajemen pengiriman (*manifest*), serta pelacakan paket secara **real-time**.

Proyek ini dikembangkan sebagai bagian dari **Tugas Besar Integrasi Sistem** dan terintegrasi dengan:
- 🛒 **Marketplace BlackDoctrine**
- 💳 **Dompet Digital TLKMSEL**

---

## 📌 Fitur Utama

- 🔐 Autentikasi Admin (JWT)
- 📦 Generate Nomor Resi Otomatis
- 🚚 Manajemen Pengiriman (Manifest)
- 📍 Tracking Paket Real-Time (History Status)
- 💰 Perhitungan Ongkos Kirim
- 🌍 Database Wilayah (Provinsi, Kota, Kecamatan)
- 🧩 Arsitektur Microservices + GraphQL Federation

---

## 🧱 Arsitektur Sistem

GoShip menggunakan pendekatan **Microservices Architecture**, di mana setiap service berdiri sendiri dan diintegrasikan melalui **Apollo GraphQL Gateway** sebagai *Single Entry Point*.

---

## 📂 Struktur Microservices

| Service Name | Port Container | Fungsi Utama | Lokasi Direktori |
|--------------|----------------|--------------|------------------|
| **API Gateway** | `4000` | Gateway GraphQL (Apollo Federation) | `services/api-gateway` |
| **Auth Service** | - | Login admin & validasi JWT | `services/auth-service` |
| **Tariff Service** | - | Perhitungan ongkos kirim | `services/tariff-service` |
| **Manifest Service** | - | Generate pengiriman & nomor resi | `services/manifest-service` |
| **Tracking Service** | - | Update status & history tracking | `services/tracking-service` |
| **Area Service** | - | Data wilayah pengiriman | `services/area-service` |
| **Courier Service** | - | Manajemen data kurir & armada | `services/courier-service` |

---

## ⚙️ Teknologi yang Digunakan

- Node.js
- Apollo Server & GraphQL Federation
- Docker & Docker Compose
- JWT Authentication
- Database (MongoDB / PostgreSQL – menyesuaikan service)
- Microservices Architecture

---

## 🚀 Cara Menjalankan Aplikasi

### 🔧 Prasyarat
- Docker
- Docker Compose

### 📥 Instalasi

```bash
git clone https://github.com/TopasAkbar/GoShip.git
cd GoShip
docker-compose up --build
```

### 🌐 Akses GraphQL Playground
```
http://localhost:4000/graphql
```

---

## 🧪 Dokumentasi API (GraphQL)

### 1️⃣ Public Tracking (Cek Resi)
**Tujuan:** Melihat status terkini paket berdasarkan Nomor Resi.
* **Contoh Resi:** Gunakan resi dari transaksi Marketplace (misal: `GS29255143520`).

```graphql
query LacakPaket {
  trackingByResi(resiNumber: "GS29255143520") {
    resiNumber
    currentStatus
    histories {
      status
      description
      location
      timestamp
    }
  }
}
```

---

### 2️⃣ Autentikasi Admin

#### Login Admin
```graphql
mutation LoginAdmin {
  login(username: "admin", password: "admin123") {
    success
    token
    admin {
      username
    }
  }
}
```

#### Pasang Token di HTTP Headers
```json
{
  "Authorization": "Bearer PASTE_TOKEN_DISINI"
}
```

---

### 3️⃣ Simulasi Kurir (Update Tracking)

#### Paket Dijemput
```graphql
mutation {
  updateTrackingStatus(
    resiNumber: "GS29255143520",
    status: PICKED_UP,
    description: "Paket telah dijemput oleh kurir",
    location: "Gudang Toko Jakarta"
  ) {
    currentStatus
  }
}
```

#### Paket Dalam Perjalanan
```graphql
mutation {
  updateTrackingStatus(
    resiNumber: "GS29255143520",
    status: IN_TRANSIT,
    description: "Paket menuju hub transit",
    location: "Tol Cikampek KM 57"
  ) {
    currentStatus
  }
}
```

#### Paket Diterima
```graphql
mutation {
  updateTrackingStatus(
    resiNumber: "GS29255143520",
    status: DELIVERED,
    description: "Paket diterima oleh penerima",
    location: "Alamat Tujuan"
  ) {
    currentStatus
  }
}
```

---

### 4️⃣ Cek Ongkos Kirim (Integrasi Marketplace)

```graphql
query CekOngkir {
  calculateOngkir(
    kotaAsal: "1",
    kotaTujuan: "2",
    berat: 1.0
  ) {
    totalOngkir
    breakdown {
      metodePengiriman
      harga
      estimasiHari
    }
  }
}
```

---

## 🔄 Integrasi Antar Sistem

### Marketplace → GoShip
- orderId
- alamatPenjemputan
- alamatPengiriman
- beratProduk

### GoShip → Marketplace
- nomorResi
- metodePengiriman
- hargaOngkir
- statusPengiriman

---
