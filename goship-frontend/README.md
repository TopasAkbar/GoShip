# GoShip Frontend

Frontend web application untuk sistem microservices logistik GoShip menggunakan React.js, Vite, Tailwind CSS, dan Apollo Client dengan integrasi JWT Authentication.

## 🛠️ Teknologi

- **Framework**: React.js 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client
- **Routing**: React Router v6
- **Authentication**: JWT (JSON Web Token)
- **State Management**: React Context API
- **Charts**: Recharts

## 📁 Struktur Project

```
goship-frontend/
├── src/
│   ├── apollo/
│   │   └── client.js          # Apollo Client setup dengan JWT injection
│   ├── auth/
│   │   ├── AuthContext.jsx     # Auth context untuk state management
│   │   └── ProtectedRoute.jsx # Component untuk protected routes
│   ├── graphql/
│   │   ├── auth.js            # GraphQL queries untuk Auth Service
│   │   ├── tariff.js          # GraphQL queries untuk Tariff Service
│   │   ├── tracking.js        # GraphQL queries untuk Tracking Service
│   │   ├── courier.js         # GraphQL queries untuk Courier Service
│   │   ├── area.js            # GraphQL queries untuk Area Service
│   │   ├── manifest.js        # GraphQL queries untuk Manifest Service
│   │   └── analytics.js       # GraphQL queries untuk Analytics Service
│   ├── pages/
│   │   ├── Login.jsx           # Halaman Login
│   │   ├── Register.jsx       # Halaman Register
│   │   ├── Home.jsx            # Halaman Home
│   │   ├── Tariff.jsx         # Halaman Cek Ongkir (Public)
│   │   ├── Tracking.jsx       # Halaman Tracking Paket (Public)
│   │   ├── Dashboard.jsx      # Admin Dashboard (Protected)
│   │   ├── Courier.jsx         # Courier Management (Protected)
│   │   ├── Area.jsx            # Area Management (Protected)
│   │   ├── Manifest.jsx       # Manifest Generator (Protected)
│   │   └── Analytics.jsx      # Operational Analytics (Protected)
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation Bar dengan logout
│   │   └── Layout.jsx         # Layout Wrapper
│   ├── App.jsx                # Main App dengan routing & auth
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles dengan Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.example
└── README.md
```

## 🚀 Cara Menjalankan

### Prerequisites

- Node.js 18+ terinstall
- Backend GoShip sudah berjalan (docker-compose up)

### Langkah-langkah

1. **Install dependencies**:
```bash
cd goship-frontend
npm install
```

2. **Setup environment variables**:
```bash
# Copy .env.example ke .env (jika belum ada)
# Atau buat file .env dengan isi:
VITE_TARIFF_API=http://localhost:4001/graphql
VITE_TRACKING_API=http://localhost:4002/graphql
VITE_COURIER_API=http://localhost:4003/graphql
VITE_AREA_API=http://localhost:4004/graphql
VITE_MANIFEST_API=http://localhost:4005/graphql
VITE_ANALYTICS_API=http://localhost:4006/graphql
VITE_AUTH_API=http://localhost:4007/graphql
```

3. **Jalankan development server**:
```bash
npm run dev
```

4. **Buka browser**:
```
http://localhost:3000
```

### Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`.

## 🔐 Authentication

Frontend menggunakan JWT (JSON Web Token) untuk autentikasi:

1. **Register**: User mendaftar dengan email, password, dan role
2. **Login**: User login dan mendapatkan JWT token
3. **Token Storage**: JWT disimpan di `localStorage`
4. **Auto Injection**: JWT otomatis dikirim ke protected services via Authorization header
5. **Protected Routes**: Halaman admin memerlukan authentication
6. **Logout**: Hapus token dan redirect ke login

### Public Routes (Tidak perlu login)
- `/` - Homepage
- `/login` - Login page
- `/register` - Register page
- `/tariff` - Cek Ongkir
- `/tracking` - Tracking Paket

### Protected Routes (Perlu login)
- `/dashboard` - Admin Dashboard
- `/dashboard/courier` - Courier Management
- `/dashboard/area` - Area Management
- `/dashboard/manifest` - Manifest Generator
- `/dashboard/analytics` - Operational Analytics

## 📄 Halaman & Fitur

### 1. Login Page (`/login`)
- Input: Email & Password
- Mutation: `login`
- Simpan JWT ke localStorage
- Redirect ke Dashboard setelah login

### 2. Register Page (`/register`)
- Input: Name, Email, Password, Role
- Mutation: `register`
- Redirect ke Login setelah register

### 3. Homepage (`/`)
- Tampilan welcome dengan menu navigasi
- Link ke Cek Ongkir, Tracking, dan Admin Dashboard

### 4. Cek Ongkir (`/tariff`) - Public
- Input: Origin, Destination, Weight
- Query GraphQL: `getShippingCost`
- Menampilkan hasil perhitungan ongkir

### 5. Tracking Paket (`/tracking`) - Public
- Input: Tracking Number
- Query GraphQL: `trackPackage`
- Menampilkan status, lokasi, dan update terakhir

### 6. Admin Dashboard (`/dashboard`) - Protected
- Menu navigasi ke:
  - Courier Management
  - Area Management
  - Manifest Generator
  - Operational Analytics

### 7. Courier Management (`/dashboard/courier`) - Protected
- List semua courier
- Form tambah courier baru
- Toggle status aktif/nonaktif
- Queries: `getCouriers`, `addCourier`, `updateCourierStatus`
- **Requires JWT**: Semua request otomatis include Authorization header

### 8. Area Management (`/dashboard/area`) - Protected
- List semua area coverage
- Form tambah area baru
- Queries: `getCoveredAreas`, `addCoveredArea`
- **Requires JWT**: Semua request otomatis include Authorization header

### 9. Manifest Generator (`/dashboard/manifest`) - Protected
- Input: Order ID dan Destination
- Generate manifest dengan tracking number dan barcode
- Mutation: `generateManifest`
- **Requires JWT**: Semua request otomatis include Authorization header

### 10. Operational Analytics (`/dashboard/analytics`) - Protected
- Dashboard analytics dengan charts:
  - Average Delivery Time by Area
  - Courier Performance (Bar Chart)
  - Shipment Volume by Status (Pie Chart)
  - Courier Average Delivery Time (Line Chart)
  - Overall Delivery Failure Rate
- Queries: `averageDeliveryTimeByArea`, `courierPerformance`, `shipmentVolume`, `deliveryFailureRate`

## 🔧 Konfigurasi

### Apollo Client

Setiap service memiliki Apollo Client terpisah yang dikonfigurasi di `src/apollo/client.js`. Endpoint GraphQL bisa dikonfigurasi via environment variables.

**JWT Injection**: Protected services (Courier, Area, Manifest, Analytics) otomatis mengirim JWT token via Authorization header:
```
Authorization: Bearer <token>
```

Token diambil dari `localStorage.getItem('token')` dan di-inject ke setiap request GraphQL.

### Tailwind CSS

Konfigurasi Tailwind ada di `tailwind.config.js`. Warna primary menggunakan skema biru (primary-50 sampai primary-900).

## 🎨 UI/UX Features

- **Responsive Design**: Semua halaman responsive untuk mobile dan desktop
- **Loading States**: Setiap query menampilkan loading state
- **Error Handling**: Error dari GraphQL ditampilkan dengan jelas
- **Clean UI**: Desain sederhana dan profesional menggunakan Tailwind CSS
- **Charts**: Visualisasi data menggunakan Recharts

## 📝 Contoh Penggunaan

### Register & Login Flow
1. Buka halaman `/register`
2. Input name, email, password, dan role
3. Klik "Create account"
4. Redirect ke `/login`
5. Input email dan password
6. Klik "Sign in"
7. JWT token disimpan di localStorage
8. Redirect ke `/dashboard`

### Cek Ongkir (Public)
1. Buka halaman `/tariff`
2. Input origin: `JAKARTA`
3. Input destination: `BANDUNG`
4. Input weight: `2.5`
5. Klik "Hitung Ongkir"
6. Hasil akan ditampilkan

### Tracking Paket (Public)
1. Buka halaman `/tracking`
2. Input tracking number: `GS001234567`
3. Klik "Track Paket"
4. Informasi paket akan ditampilkan

### Generate Manifest (Protected - Perlu Login)
1. Login terlebih dahulu di `/login`
2. Buka halaman `/dashboard/manifest`
3. Input order ID: `ORD999`
4. Input destination: `SURABAYA`
5. Klik "Generate Manifest"
6. Tracking number dan barcode akan ditampilkan
7. JWT token otomatis dikirim ke backend

## 🐛 Troubleshooting

### Error: Cannot connect to GraphQL endpoint
- Pastikan backend services sudah berjalan (`docker-compose up`)
- Cek environment variables di file `.env`
- Pastikan port tidak conflict
- **Pastikan Auth Service berjalan di port 4007**

### Error: Unauthorized / 401
- Pastikan sudah login dan JWT token ada di localStorage
- Cek apakah token masih valid (belum expired)
- Coba logout dan login lagi
- Pastikan Auth Service sudah berjalan

### Error: Redirect ke login terus menerus
- Clear localStorage: `localStorage.clear()`
- Refresh halaman
- Coba login lagi

### Error: CORS
- Pastikan backend mengizinkan CORS dari `http://localhost:3000`
- Atau gunakan proxy di `vite.config.js`
- Pastikan Auth Service mengizinkan CORS

### Charts tidak muncul
- Pastikan Recharts sudah terinstall: `npm install recharts`
- Cek console browser untuk error

### JWT Token tidak terkirim
- Cek apakah token ada di localStorage: `localStorage.getItem('token')`
- Pastikan Apollo Client sudah dikonfigurasi dengan auth link
- Cek Network tab di browser untuk melihat request headers

## 📄 License

ISC

---

**Dibuat untuk TUBES EAI Semester 5 - GoShip Logistics System**

