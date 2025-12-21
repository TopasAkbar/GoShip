# GoShip - Microservices Logistics System

Sistem microservices lengkap untuk domain Logistik/Ekspedisi menggunakan Node.js, GraphQL (Apollo Server), PostgreSQL, dan Docker.

## 📋 Daftar Isi

- [Arsitektur](#arsitektur)
- [Teknologi](#teknologi)
- [Struktur Project](#struktur-project)
- [Service Overview](#service-overview)
- [Cara Menjalankan](#cara-menjalankan)
- [GraphQL Queries & Mutations](#graphql-queries--mutations)
- [Port Mapping](#port-mapping)

## 🏗️ Arsitektur

GoShip menggunakan arsitektur **Microservices** dengan 6 service terpisah:

1. **Tariff Service** (Port 4001) - PUBLIC API
2. **Tracking Service** (Port 4002) - PUBLIC API
3. **Courier Service** (Port 4003)
4. **Area/Zone Service** (Port 4004)
5. **Manifest Service** (Port 4005)
6. **Operational Analytics Service** (Port 4006) - INTERNAL ONLY

Setiap service memiliki:
- Database PostgreSQL terpisah
- GraphQL endpoint terpisah
- Container Docker terpisah
- Schema GraphQL terpisah

## 🛠️ Teknologi

- **Backend**: Node.js dengan Express
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL (1 database per service)
- **ORM**: Sequelize
- **Containerization**: Docker & Docker Compose
- **Runtime**: Node.js 18

## 📁 Struktur Project

```
GoShip/
├── docker-compose.yml
├── README.md
└── services/
    ├── tariff-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── schema.graphql
    │       ├── resolvers.js
    │       ├── config/
    │       │   └── database.js
    │       ├── models/
    │       │   └── PricingRule.js
    │       └── seeders/
    │           └── seed.js
    ├── tracking-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── schema.graphql
    │       ├── resolvers.js
    │       ├── config/
    │       │   └── database.js
    │       ├── models/
    │       │   └── ShipmentStatus.js
    │       └── seeders/
    │           └── seed.js
    ├── courier-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── schema.graphql
    │       ├── resolvers.js
    │       ├── config/
    │       │   └── database.js
    │       ├── models/
    │       │   └── Courier.js
    │       └── seeders/
    │           └── seed.js
    ├── area-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── schema.graphql
    │       ├── resolvers.js
    │       ├── config/
    │       │   └── database.js
    │       ├── models/
    │       │   └── CoveredArea.js
    │       └── seeders/
    │           └── seed.js
    ├── manifest-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── schema.graphql
    │       ├── resolvers.js
    │       ├── config/
    │       │   └── database.js
    │       ├── models/
    │       │   └── ManifestLog.js
    │       └── seeders/
    │           └── seed.js
    └── analytics-service/
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js
            ├── schema.graphql
            ├── resolvers.js
            ├── config/
            │   └── database.js
            ├── models/
            │   └── index.js
            └── seeders/
                └── seed.js
```

## 🔍 Service Overview

### 1. Tariff Service (Port 4001) - PUBLIC API
**Fungsi**: Menghitung ongkos kirim berdasarkan origin, destination, dan berat.

**Database Table**: `Pricing_Rules`
- id, origin, destination, min_weight, max_weight, price

**GraphQL Query**:
```graphql
query {
  getShippingCost(origin: "JAKARTA", destination: "BANDUNG", weight: 2.5) {
    origin
    destination
    weight
    price
    currency
  }
}
```

### 2. Tracking Service (Port 4002) - PUBLIC API
**Fungsi**: Melacak status dan posisi paket berdasarkan tracking number.

**Database Table**: `Shipment_Status`
- id, tracking_number, status, location, updated_at

**GraphQL Query**:
```graphql
query {
  trackPackage(trackingNumber: "GS001234567") {
    trackingNumber
    status
    location
    updatedAt
  }
}
```

### 3. Courier Service (Port 4003)
**Fungsi**: Manajemen data kurir (driver) dan status aktif/tidak aktif.

**Database Table**: `Couriers`
- id, name, phone, vehicle_type, is_active

**GraphQL Queries & Mutations**:
```graphql
# Query
query {
  getCouriers(isActive: true) {
    id
    name
    phone
    vehicleType
    isActive
  }
}

# Mutation - Add Courier
mutation {
  addCourier(input: {
    name: "John Doe"
    phone: "081234567890"
    vehicleType: "MOTORCYCLE"
    isActive: true
  }) {
    id
    name
    phone
    vehicleType
    isActive
  }
}

# Mutation - Update Status
mutation {
  updateCourierStatus(id: 1, isActive: false) {
    id
    name
    isActive
  }
}
```

### 4. Area/Zone Service (Port 4004)
**Fungsi**: Manajemen area cakupan pengiriman.

**Database Table**: `Covered_Areas`
- id, province, city, district, is_active

**GraphQL Queries & Mutations**:
```graphql
# Query
query {
  getCoveredAreas(isActive: true) {
    id
    province
    city
    district
    isActive
  }
}

# Mutation
mutation {
  addCoveredArea(input: {
    province: "Jawa Barat"
    city: "Bandung"
    district: "Cimahi"
    isActive: true
  }) {
    id
    province
    city
    district
    isActive
  }
}
```

### 5. Manifest Service (Port 4005)
**Fungsi**: Generate resi pengiriman dan barcode.

**Database Table**: `Manifest_Logs`
- id, order_id, tracking_number, barcode, created_at

**GraphQL Mutation**:
```graphql
mutation {
  generateManifest(orderId: "ORD001", destination: "BANDUNG") {
    id
    orderId
    trackingNumber
    barcode
    createdAt
  }
}
```

### 6. Operational Analytics Service (Port 4006) - INTERNAL ONLY
**Fungsi**: Analisis performa operasional logistik (READ ONLY).

**Database Tables**:
- `Delivery_Performance` (analytics_db)
- `Courier_Metrics` (analytics_db)
- `Area_Statistics` (analytics_db)

**Mengakses data dari**:
- Tracking Service (Shipment_Status)
- Courier Service (Couriers)
- Manifest Service (Manifest_Logs)

**GraphQL Queries**:
```graphql
# Average Delivery Time by Area
query {
  averageDeliveryTimeByArea(area: "JAKARTA") {
    area
    averageDays
    totalShipments
  }
}

# Courier Performance
query {
  courierPerformance {
    courierId
    courierName
    totalDeliveries
    successRate
    averageDeliveryTime
  }
}

# Shipment Volume
query {
  shipmentVolume(startDate: "2024-01-01", endDate: "2024-12-31") {
    totalShipments
    period
    byStatus {
      status
      count
    }
  }
}

# Delivery Failure Rate
query {
  deliveryFailureRate(area: "JAKARTA") {
    area
    failureRate
    totalShipments
    failedShipments
  }
}
```

## 🚀 Cara Menjalankan

### Prerequisites
- Docker & Docker Compose terinstall
- Port 4001-4006 tersedia

### Langkah-langkah

1. **Clone atau download project ini**

2. **Jalankan semua service dengan Docker Compose**:
```bash
docker-compose up -d
```

3. **Seed data untuk setiap service** (opsional, jika ingin data dummy):
```bash
# Tariff Service
docker exec -it goship-tariff npm run seed

# Tracking Service
docker exec -it goship-tracking npm run seed

# Courier Service
docker exec -it goship-courier npm run seed

# Area Service
docker exec -it goship-area npm run seed

# Manifest Service
docker exec -it goship-manifest npm run seed

# Analytics Service
docker exec -it goship-analytics npm run seed
```

4. **Akses GraphQL Playground**:
- Tariff Service: http://localhost:4001/graphql
- Tracking Service: http://localhost:4002/graphql
- Courier Service: http://localhost:4003/graphql
- Area Service: http://localhost:4004/graphql
- Manifest Service: http://localhost:4005/graphql
- Analytics Service: http://localhost:4006/graphql

### Stop Services
```bash
docker-compose down
```

### Stop dan Hapus Volumes (Database Data)
```bash
docker-compose down -v
```

## 📊 Port Mapping

| Service | Port | GraphQL Endpoint |
|---------|------|------------------|
| Tariff Service | 4001 | http://localhost:4001/graphql |
| Tracking Service | 4002 | http://localhost:4002/graphql |
| Courier Service | 4003 | http://localhost:4003/graphql |
| Area Service | 4004 | http://localhost:4004/graphql |
| Manifest Service | 4005 | http://localhost:4005/graphql |
| Analytics Service | 4006 | http://localhost:4006/graphql |

## 🧪 Contoh Testing

### 1. Test Tariff Service
```graphql
query {
  getShippingCost(origin: "JAKARTA", destination: "BANDUNG", weight: 2.5) {
    origin
    destination
    weight
    price
    currency
  }
}
```

### 2. Test Tracking Service
```graphql
query {
  trackPackage(trackingNumber: "GS001234567") {
    trackingNumber
    status
    location
    updatedAt
  }
}
```

### 3. Test Courier Service
```graphql
query {
  getCouriers(isActive: true) {
    id
    name
    phone
    vehicleType
    isActive
  }
}
```

### 4. Test Manifest Service
```graphql
mutation {
  generateManifest(orderId: "ORD999", destination: "SURABAYA") {
    id
    orderId
    trackingNumber
    barcode
    createdAt
  }
}
```

## 📝 Catatan Penting

1. **Database**: Setiap service memiliki database PostgreSQL terpisah yang akan dibuat otomatis saat pertama kali dijalankan.

2. **Seed Data**: Data dummy sudah tersedia di setiap service. Jalankan seed script untuk mengisi data awal.

3. **Network**: Semua service terhubung dalam network Docker `goship-network` sehingga bisa saling berkomunikasi.

4. **Analytics Service**: Service ini mengakses database dari service lain (tracking, courier, manifest) untuk analisis. Pastikan service-service tersebut sudah berjalan.

5. **Environment Variables**: Setiap service menggunakan environment variables yang didefinisikan di `docker-compose.yml`.

## 🔧 Development

Untuk development mode, Anda bisa menjalankan service secara individual:

```bash
cd services/tariff-service
npm install
npm run dev
```

Pastikan database PostgreSQL sudah berjalan dan environment variables sudah diset dengan benar.

## 📄 License

ISC

---

**Dibuat dengan ❤️ untuk TUBES EAI Semester 5**





