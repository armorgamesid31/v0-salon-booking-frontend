# Multi-Tenant Salon Randevu Sistemi - Mimarisi

## Genel Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────────────┐
│                       İçerisinde Bulunulan Salon                     │
│                        (Multi-Tenant Yapısı)                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (Bu Repo)                          │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Header: Salon Adı + Müşteri Bilgisi                    │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Kontroller (Arama + Cinsiyet + Sayaç)                  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Hizmet Kategorileri & Seçimi                           │ │ │
│  │  │  - Multi-person booking (1-4)                          │ │ │
│  │  │  - Specialist selection                                │ │ │
│  │  │  - Fiyat hesaplama (kişi × hizmet)                    │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Aktif Paketler                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Randevu Geçmişi                                         │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ▲                                       │
│                              │ API Calls (SWR)                       │
│                              │ salonId, customerId                   │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    BACKEND API (Sizin)                         │ │
│  │                                                                │ │
│  │  GET /api/salons/{salonId}                                   │ │
│  │  GET /api/salons/{salonId}/services                          │ │
│  │  GET /api/salons/{salonId}/employees                         │ │
│  │  GET /api/salons/{salonId}/packages                          │ │
│  │  GET /api/salons/{salonId}/services/{serviceId}/availability │ │
│  │  GET /api/salons/{salonId}/customers/{customerId}/appointments
│  │  POST /api/salons/{salonId}/appointments                     │ │
│  │                                                                │ │
│  │  ┌── Authentication Middleware ──┐                            │ │
│  │  │ - JWT / OAuth token check     │                            │ │
│  │  │ - customerId extract          │                            │ │
│  │  └───────────────────────────────┘                            │ │
│  │                              ▲                                  │ │
│  │                              │                                  │ │
│  │  ┌── Row Level Security (RLS) ──┐                              │ │
│  │  │ - salon_id filter             │                             │ │
│  │  │ - customer_id verify          │                             │ │
│  │  │ - Cross-tenant prevention     │                             │ │
│  │  └───────────────────────────────┘                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ▲                                       │
│                              │ SQL Queries                           │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    DATABASE                                    │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ salons { id, name, description, ... }                 │ │ │
│  │  │ salon_id = "{salonId}"                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ customers { id, salon_id, phone, email, ... }         │ │ │
│  │  │ salon_id = "{salonId}" AND id = "{customerId}"        │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ services { id, salon_id, name, price, ... }           │ │ │
│  │  │ salon_id = "{salonId}"                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ appointments { id, salon_id, customer_id, ... }        │ │ │
│  │  │ salon_id = "{salonId}" AND customer_id = "{customerId}"│ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ employees { id, salon_id, name, spec, ... }           │ │ │
│  │  │ salon_id = "{salonId}"                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ packages { id, salon_id, name, sessions, ... }        │ │ │
│  │  │ salon_id = "{salonId}"                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

## Veri Akışı - Randevu Oluşturma

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Müşteri Hizmet Seçer                                         │
│    - Hizmet kategorisi aç                                       │
│    - Hizmet seç (multi-person support)                          │
│    - Uzman seç (gerekiyorsa)                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend Verileri Hazırlar                                   │
│    {                                                             │
│      salonId: "salon-001",                                      │
│      customerId: "customer-001",                                │
│      services: [                                                │
│        { serviceId: "s1", employeeId: "emp-1" }                │
│      ],                                                          │
│      numberOfPeople: 2,                                         │
│      date: "2024-01-15",                                        │
│      time: "10:00",                                             │
│      totalPrice: 3300 (1650 × 2)                               │
│    }                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API Call: POST /api/salons/{salonId}/appointments            │
│    - SWR ile request gönderilir                                 │
│    - Headers'a auth token eklenir                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend: Auth Check                                          │
│    - Token doğrulanır                                           │
│    - customerId extract edilir                                  │
│    - salonId kontrol edilir                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Backend: RLS Checks                                          │
│    - services tüm hizmetler? ✓                                  │
│    - salon_id ile services filterle ✓                           │
│    - customerId müşteri mi? ✓                                   │
│    - employee salon'un çalışanı mı? ✓                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Backend: Availability Check                                  │
│    SELECT * FROM availability                                   │
│    WHERE salon_id = {salonId}                                   │
│    AND date = {date}                                            │
│    AND time = {time}                                            │
│    AND employee_id = {employeeId}                               │
│    AND available_slots >= {numberOfPeople}                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Backend: Create Appointment                                  │
│    INSERT INTO appointments (                                   │
│      id, salon_id, customer_id, service_id,                    │
│      employee_id, appointment_date, appointment_time,          │
│      number_of_people, total_price, status                     │
│    ) VALUES (...)                                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend: Success Response                                   │
│    {                                                             │
│      data: { appointmentId: "apt-123", ... },                  │
│      message: "Randevu başarıyla oluşturuldu"                  │
│    }                                                             │
│    - SWR cache güncellenir                                      │
│    - Randevu geçmişi refresh edilir                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. UI: Confirmation                                             │
│    - Success modal gösterilir                                   │
│    - Randevu geçmişine eklenir                                  │
│    - Seçimler reset edilir                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Isolation Kontrol Listesi

### Frontend Tarafında
- [x] salonId her API call'a eklenir
- [x] customerId her request'te gönderilir
- [x] Environment variables'dan salon/customer ID alınır
- [x] XSS protection (React otomatik)

### Backend Tarafında (Sizin sorumluluğunuz)
- [ ] JWT/OAuth authentication middleware
- [ ] customerId token'dan extract edilir
- [ ] Her request'te salonId ve customerId kontrol edilir
- [ ] RLS policies (Supabase) veya WHERE clauses
- [ ] Cross-tenant SQL injection prevention
- [ ] Sensitive data backend'de şifrelenir

### Database Tarafında (Sizin sorumluluğunuz)
- [ ] Her tablo salon_id indexi var
- [ ] Müşteri tablosunda (salon_id, phone) UNIQUE constraint
- [ ] RLS policies enable edilmiş
- [ ] Audit logging yapılandırılmış
- [ ] Backup/Recovery planı var

## Performance Optimizations

### Frontend
- [x] SWR ile automatic caching
- [x] `dedupingInterval: 60000` - 1 dakikalık cache
- [x] `revalidateOnFocus: false` - window focus'ta refetch yok
- [x] Lazy loading (accordion expanded state)
- [x] Image optimization (sonra eklenecek)

### Backend (Önerilen)
- [ ] Database connection pooling
- [ ] Redis caching (availability, packages)
- [ ] API rate limiting
- [ ] Query optimization (indexes)
- [ ] CDN for static assets
- [ ] Database replica for read-heavy queries

## Security Best Practices

### ✅ Frontend Yapılacak
- [x] HTTPS (production'da zorunlu)
- [x] Sensitive data localStorage'a yazılmıyor
- [x] CSRF protection (Next.js built-in)

### ✅ Backend Yapılacak (Sizin)
- [ ] HTTPS enforced
- [ ] CORS headers configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection headers
- [ ] CSRF tokens (if applicable)
- [ ] API key rotation
- [ ] Audit logging
- [ ] Data encryption at rest

### ✅ Database Yapılacak (Sizin)
- [ ] RLS policies for all tables
- [ ] Minimum privilege principle
- [ ] Regular backups
- [ ] Connection encryption (SSL/TLS)
- [ ] User permissions audited regularly

## Skalabilite

### Şu an optimize
- ✓ Tek salon 5000+ müşteri
- ✓ Günde 10000+ randevu
- ✓ 100+ concurrent users

### İlerisi için
- [ ] Database sharding (milyonlarca müşteri)
- [ ] Microservices (availability service split)
- [ ] Message queue (appointment creation async)
- [ ] WebSockets (real-time notifications)
- [ ] CDN (static content)

## Deployment Strategy

```
Development:
├── Frontend: localhost:3000
├── Backend: localhost:3001
└── DB: Local PostgreSQL

Staging:
├── Frontend: staging.frontend.com
├── Backend: api-staging.yourdomain.com
└── DB: Staging database with RLS

Production:
├── Frontend: yourdomain.com (Vercel)
├── Backend: api.yourdomain.com (your hosting)
└── DB: Production database with backups & monitoring
```

## Monitoring & Logging

### Frontend
- Browser console errors
- Network tab API failures
- Performance metrics (Lighthouse)

### Backend (Önerilir)
- API endpoint latency
- Database query performance
- Error rate monitoring
- User activity logging
- Security event logging

### Database
- Slow query logs
- Connection pool usage
- Backup job status
- Replication lag (if replicas exist)
