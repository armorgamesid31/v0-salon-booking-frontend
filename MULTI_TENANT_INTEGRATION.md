# Multi-Tenant Salon Randevu Sistemi - Entegrasyon Kılavuzu

## Mimari

Bu frontend **multi-tenant SaaS** yapısına tamamen uyumludur. Her salon kendi verilerini izole bir şekilde görmektedir.

### API Endpoint Yapısı

```
GET /api/salons/{salonId}                              # Salon bilgileri
GET /api/salons/{salonId}/services                      # Hizmetler
GET /api/salons/{salonId}/employees                     # Çalışanlar
GET /api/salons/{salonId}/packages                      # Paketler
GET /api/salons/{salonId}/services/{serviceId}/availability  # Müsaitlik
GET /api/salons/{salonId}/customers/{customerId}/appointments # Randevu geçmişi
POST /api/salons/{salonId}/appointments                 # Randevu oluştur
```

## Multi-Tenant Veri Akışı

1. **Salon Tanımlama**
   - URL: `/salon/[salonId]`
   - Header'daki salon bilgileri dinamik olarak API'den çekilir
   - Her request'e `salonId` otomatik eklenir

2. **Müşteri Tanımlama**
   - Auth middleware ile `customerId` session'dan alınır
   - Müşteri kendi randevularını ve paketlerini görür
   - Diğer müşterilerin verileri görülmez

3. **Veri İzolasyonu**
   - Backend RLS (Row Level Security) kullanmalıdır
   - Her query otomatik olarak `salonId` filtresi içermelidir
   - Müşteri verileri `customerId` ile verify edilmelidir

## Backend Entegrasyon Adımları

### 1. Environment Variables Ayarla

```bash
cp .env.example .env.local
```

Dosyayı edit et:
```
NEXT_PUBLIC_API_URL=https://your-backend.com
NEXT_PUBLIC_SALON_ID=salon-001
NEXT_PUBLIC_CUSTOMER_ID=customer-001
```

### 2. API Endpoints Oluştur

Backend'de aşağıdaki endpoints'i oluştur:

#### GET `/api/salons/{salonId}`
Response:
```json
{
  "id": "salon-001",
  "name": "Salon Adı",
  "description": "Salon Açıklaması",
  "headerMessage": "Header'da görünecek mesaj",
  "phone": "+90 212 555 0123",
  "address": "Adres"
}
```

#### GET `/api/salons/{salonId}/services`
Response:
```json
[
  {
    "id": "cat-1",
    "name": "Epilasyon & Tüy Alma",
    "icon": "⚡",
    "services": [
      {
        "id": "s1",
        "name": "Tam Vücut",
        "duration": "60 dk",
        "originalPrice": 1800,
        "salePrice": 1650
      }
    ]
  }
]
```

#### GET `/api/salons/{salonId}/employees`
Response:
```json
[
  {
    "id": "emp-1",
    "name": "Pınar",
    "specialization": "Epilasyon"
  }
]
```

#### GET `/api/salons/{salonId}/services/{serviceId}/availability?date=2024-01-15&numberOfPeople=1&employeeId=emp-1`
Response:
```json
{
  "available": true,
  "slots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
}
```

#### POST `/api/salons/{salonId}/appointments`
Request:
```json
{
  "customerId": "customer-001",
  "services": [
    {
      "serviceId": "s1",
      "employeeId": "emp-1"
    }
  ],
  "date": "2024-01-15",
  "time": "10:00",
  "numberOfPeople": 2,
  "customerInfo": {
    "name": "Müşteri Adı",
    "phone": "+90 555 123 4567",
    "email": "email@example.com"
  }
}
```

### 3. Veri Tabanı Şeması

Minimum gerekli tablolar:

```sql
-- Salonlar
CREATE TABLE salons (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  header_message VARCHAR(255),
  created_at TIMESTAMP,
  CONSTRAINT salon_isolation CHECK (id IS NOT NULL)
);

-- Müşteriler
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  salon_id UUID REFERENCES salons(id),
  phone VARCHAR(20),
  email VARCHAR(255),
  gender VARCHAR(10),
  created_at TIMESTAMP,
  UNIQUE(salon_id, phone)
);

-- Hizmetler
CREATE TABLE services (
  id UUID PRIMARY KEY,
  salon_id UUID REFERENCES salons(id),
  name VARCHAR(255),
  duration VARCHAR(20),
  original_price DECIMAL,
  sale_price DECIMAL,
  created_at TIMESTAMP,
  INDEX (salon_id)
);

-- Çalışanlar
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  salon_id UUID REFERENCES salons(id),
  name VARCHAR(255),
  specialization VARCHAR(255),
  created_at TIMESTAMP,
  INDEX (salon_id)
);

-- Randevular
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  salon_id UUID REFERENCES salons(id),
  customer_id UUID REFERENCES customers(id),
  service_id UUID REFERENCES services(id),
  employee_id UUID REFERENCES employees(id),
  appointment_date DATE,
  appointment_time TIME,
  number_of_people INT,
  total_price DECIMAL,
  status VARCHAR(50),
  created_at TIMESTAMP,
  INDEX (salon_id),
  INDEX (customer_id),
  INDEX (appointment_date)
);
```

### 4. Row-Level Security (RLS) - Supabase Örneği

```sql
-- Salonlar - her salon sadece kendi verisini görsün
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salons are viewable by public" ON salons FOR SELECT USING (true);

-- Müşteriler - her müşteri sadece kendi verisini görsün
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own data" ON customers FOR SELECT
  USING (auth.uid() = id);

-- Hizmetler - salon müşterileri sadece kendi salon hizmetlerini görsün
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services viewable by salon's customers" ON services FOR SELECT
  USING (salon_id IN (
    SELECT salon_id FROM customers WHERE customers.id = auth.uid()
  ));

-- Randevular - müşteri sadece kendi randevularını görsün
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own appointments" ON appointments FOR SELECT
  USING (customer_id = auth.uid());
```

## Dummy Data Fallback

Frontend'de `lib/constants.ts` içinde dummy veriler vardır. Eğer API çekemezse, otomatik olarak dummy veriler kullanılır. Bu geliştirme sırasında faydalıdır.

```typescript
// API'den başarısız olursa dummy data çekilir
try {
  const services = await getServices(salonId);
} catch {
  return DUMMY_SERVICES; // Fallback
}
```

## Canlıya Geçiş

1. Backend'i deploy et
2. `.env.local` dosyasını güncelle (production URL'si)
3. Authentication system'i ekle (JWT, OAuth, vb.)
4. Salon/müşteri ID'leri dinamik olarak al (URL parametresi veya session'dan)
5. RLS policies test et
6. Deployment yap

## Multi-Tenant Güvenlik Kontrol Listesi

- [ ] Her API request'e `salonId` filtresi uygulanıyor
- [ ] Müşteri verilerine `customerId` ile kontrol edilip erişiliyor
- [ ] RLS policies yapılandırılmış ve test edilmiş
- [ ] Cross-tenant data leakage test edildi
- [ ] Authentication middleware aktif
- [ ] Rate limiting uygulandı
- [ ] API endpoints logging'i aktif
- [ ] CORS politikası doğru ayarlandı

## Troubleshooting

**API çağrıları başarısız oluyorsa:**
- Browser console'da fetch hatası kontrol et
- Network tab'da status code kontrol et
- Backend logs'unda error message kontrol et

**Dummy data yerine API verisi görmek istiyorsam:**
- `.env.local` dosyasında `NEXT_PUBLIC_API_URL` kontrol et
- API endpoint'lerinin doğru formatta olduğundan emin ol
- Backend'in CORS'u enable ettiğinden emin ol
