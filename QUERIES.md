# GoShip - GraphQL Queries & Mutations Examples

Dokumen ini berisi contoh-contoh query dan mutation GraphQL untuk semua service di GoShip.

## 📍 Tariff Service (Port 4001)

### Query: getShippingCost

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

**Response:**
```json
{
  "data": {
    "getShippingCost": {
      "origin": "JAKARTA",
      "destination": "BANDUNG",
      "weight": 2.5,
      "price": 25000,
      "currency": "IDR"
    }
  }
}
```

---

## 📦 Tracking Service (Port 4002)

### Query: trackPackage

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

**Response:**
```json
{
  "data": {
    "trackPackage": {
      "trackingNumber": "GS001234567",
      "status": "IN_TRANSIT",
      "location": "Jakarta Sorting Center",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 🚚 Courier Service (Port 4003)

### Query: getCouriers

```graphql
# Get all couriers
query {
  getCouriers {
    id
    name
    phone
    vehicleType
    isActive
  }
}
```

```graphql
# Get only active couriers
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

**Response:**
```json
{
  "data": {
    "getCouriers": [
      {
        "id": 1,
        "name": "Budi Santoso",
        "phone": "081234567890",
        "vehicleType": "MOTORCYCLE",
        "isActive": true
      }
    ]
  }
}
```

### Mutation: addCourier

```graphql
mutation {
  addCourier(input: {
    name: "John Doe"
    phone: "081234567890"
    vehicleType: "VAN"
    isActive: true
  }) {
    id
    name
    phone
    vehicleType
    isActive
  }
}
```

**Response:**
```json
{
  "data": {
    "addCourier": {
      "id": 6,
      "name": "John Doe",
      "phone": "081234567890",
      "vehicleType": "VAN",
      "isActive": true
    }
  }
}
```

### Mutation: updateCourierStatus

```graphql
mutation {
  updateCourierStatus(id: 1, isActive: false) {
    id
    name
    isActive
  }
}
```

**Response:**
```json
{
  "data": {
    "updateCourierStatus": {
      "id": 1,
      "name": "Budi Santoso",
      "isActive": false
    }
  }
}
```

---

## 🗺️ Area Service (Port 4004)

### Query: getCoveredAreas

```graphql
# Get all areas
query {
  getCoveredAreas {
    id
    province
    city
    district
    isActive
  }
}
```

```graphql
# Get only active areas
query {
  getCoveredAreas(isActive: true) {
    id
    province
    city
    district
    isActive
  }
}
```

**Response:**
```json
{
  "data": {
    "getCoveredAreas": [
      {
        "id": 1,
        "province": "DKI Jakarta",
        "city": "Jakarta Pusat",
        "district": "Gambir",
        "isActive": true
      }
    ]
  }
}
```

### Mutation: addCoveredArea

```graphql
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

**Response:**
```json
{
  "data": {
    "addCoveredArea": {
      "id": 7,
      "province": "Jawa Barat",
      "city": "Bandung",
      "district": "Cimahi",
      "isActive": true
    }
  }
}
```

---

## 📋 Manifest Service (Port 4005)

### Mutation: generateManifest

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

**Response:**
```json
{
  "data": {
    "generateManifest": {
      "id": 4,
      "orderId": "ORD999",
      "trackingNumber": "GS12345678ABCDEF",
      "barcode": "ABCD1234EFGH5678",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## 📊 Analytics Service (Port 4006)

### Query: averageDeliveryTimeByArea

```graphql
query {
  averageDeliveryTimeByArea(area: "JAKARTA") {
    area
    averageDays
    totalShipments
  }
}
```

**Response:**
```json
{
  "data": {
    "averageDeliveryTimeByArea": {
      "area": "JAKARTA",
      "averageDays": 2.5,
      "totalShipments": 150
    }
  }
}
```

### Query: courierPerformance

```graphql
# Get all couriers performance
query {
  courierPerformance {
    courierId
    courierName
    totalDeliveries
    successRate
    averageDeliveryTime
  }
}
```

```graphql
# Get specific courier performance
query {
  courierPerformance(courierId: 1) {
    courierId
    courierName
    totalDeliveries
    successRate
    averageDeliveryTime
  }
}
```

**Response:**
```json
{
  "data": {
    "courierPerformance": [
      {
        "courierId": 1,
        "courierName": "Budi Santoso",
        "totalDeliveries": 50,
        "successRate": 95.5,
        "averageDeliveryTime": 2.3
      }
    ]
  }
}
```

### Query: shipmentVolume

```graphql
# Get all time shipment volume
query {
  shipmentVolume {
    totalShipments
    period
    byStatus {
      status
      count
    }
  }
}
```

```graphql
# Get shipment volume by date range
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
```

**Response:**
```json
{
  "data": {
    "shipmentVolume": {
      "totalShipments": 3,
      "period": "2024-01-01 to 2024-12-31",
      "byStatus": [
        {
          "status": "IN_TRANSIT",
          "count": 2
        },
        {
          "status": "DELIVERED",
          "count": 1
        }
      ]
    }
  }
}
```

### Query: deliveryFailureRate

```graphql
# Get failure rate for specific area
query {
  deliveryFailureRate(area: "JAKARTA") {
    area
    failureRate
    totalShipments
    failedShipments
  }
}
```

```graphql
# Get overall failure rate
query {
  deliveryFailureRate {
    area
    failureRate
    totalShipments
    failedShipments
  }
}
```

**Response:**
```json
{
  "data": {
    "deliveryFailureRate": {
      "area": "JAKARTA",
      "failureRate": 3.33,
      "totalShipments": 150,
      "failedShipments": 5
    }
  }
}
```

---

## 🧪 Testing Tips

1. **Gunakan GraphQL Playground**: Setiap service memiliki GraphQL Playground di endpoint `/graphql`
2. **Seed Data First**: Pastikan sudah menjalankan seed script untuk setiap service agar data dummy tersedia
3. **Test Sequence**: 
   - Generate manifest dulu (Manifest Service)
   - Track package (Tracking Service)
   - Check analytics (Analytics Service)
4. **Error Handling**: Jika query gagal, periksa:
   - Apakah service sudah running?
   - Apakah data sudah di-seed?
   - Apakah parameter yang dikirim sudah benar?

---

**Happy Testing! 🚀**





