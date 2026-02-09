# Multi-Tenant Salon Randevu Sistemi - Frontend

Modern ve estetik salon/spa hizmet booking platformu. Multi-tenant SaaS yapısına tamamen uyumludur.

## Özellikler

✅ **Responsive Design** - Mobil, tablet ve desktop'ta optimal görünüm  
✅ **Multi-Tenant Ready** - Her salon kendi verilerini izole şekilde görmektedir  
✅ **Multi-Person Booking** - 4 kişiye kadar aynı hizmet için randevu alınabilir  
✅ **Specialist Selection** - Hizmetlere göre uzman seçimi yapılabilir  
✅ **Price Calculation** - Kişi sayısı ve hizmet kombinasyonlarına göre dinamik fiyat  
✅ **Service Filtering** - Arama ve cinsiyet filtrelemesi  
✅ **Appointment History** - Geçmiş randevuları görüntüleme  
✅ **Package Management** - Aktif paketleri takip etme  
✅ **Dark Mode Support** - Koyu tema desteği  

## Teknoloji Stack

- **Next.js 16** - Modern React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Responsive styling
- **SWR** - Data fetching ve caching
- **Lucide Icons** - Icon library
- **shadcn/ui** - UI components

## Kurulum

### 1. Repo'yu clone et

```bash
git clone <repo-url>
cd salon-booking-frontend
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Environment variables'ı ayarla

```bash
cp .env.example .env.local
```

`env.local` dosyasını edit et:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SALON_ID=salon-001
NEXT_PUBLIC_CUSTOMER_ID=customer-001
```

### 4. Development server'ı başlat

```bash
npm run dev
```

Browser'da `http://localhost:3000` adresi açılacak.

## Proje Yapısı

```
salon-booking-frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main dashboard
│   └── loading.tsx          # Loading state
├── components/
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── useSalon.tsx         # Salon context hook
│   ├── useSalonData.ts      # Data fetching hooks (SWR)
│   └── use-mobile.tsx       # Mobile detection
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── constants.ts         # Dummy data & constants
│   ├── api.ts               # API helper functions
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Multi-Tenant Mimarisi

### Salon Isolasyonu
Her salon `salonId` ile tanımlanır ve tüm API request'lerine otomatik olarak `salonId` eklenir:

```typescript
// Örnek: Hizmetleri çek
const services = await getServices(salonId)
// API: GET /api/salons/{salonId}/services
```

### Müşteri Tanımlama
Her müşteri `customerId` ile tanımlanır ve sadece kendi verilerine erişebilir:

```typescript
// Kişisel randevuları çek
const appointments = await getAppointments(salonId, customerId)
// API: GET /api/salons/{salonId}/customers/{customerId}/appointments
```

### Veri Akışı

```
┌─────────────────────────────────────────┐
│         Frontend (Bu Repo)              │
├─────────────────────────────────────────┤
│  - Hizmet seçimi                        │
│  - Randevu oluşturma                    │
│  - Müşteri bilgileri                    │
└────────────────┬────────────────────────┘
                 │ API Calls (SWR)
                 │ salonId, customerId
                 ▼
┌─────────────────────────────────────────┐
│     Backend API (Sizin Backend'iniz)    │
├─────────────────────────────────────────┤
│  - Müsaitlik kontrolü                   │
│  - Randevu doğrulama                    │
│  - RLS ile veri izolasyonu              │
│  - Multi-tenant logic                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Database                       │
├─────────────────────────────────────────┤
│  - Salonlar (isolated)                  │
│  - Müşteriler (per salon)               │
│  - Randevular (RLS protected)           │
│  - Hizmetler (per salon)                │
└─────────────────────────────────────────┘
```

## API Entegrasyon

Backend'i bağlamak için `MULTI_TENANT_INTEGRATION.md` dosyasını okuyun.

Özet endpoint'ler:

| Endpoint | Method | Açıklama |
|----------|--------|---------|
| `/api/salons/{salonId}` | GET | Salon bilgileri |
| `/api/salons/{salonId}/services` | GET | Hizmetler |
| `/api/salons/{salonId}/employees` | GET | Çalışanlar |
| `/api/salons/{salonId}/packages` | GET | Paketler |
| `/api/salons/{salonId}/services/{serviceId}/availability` | GET | Müsaitlik |
| `/api/salons/{salonId}/customers/{customerId}/appointments` | GET | Randevu geçmişi |
| `/api/salons/{salonId}/appointments` | POST | Randevu oluştur |

## Dummy Data

Frontend'de `lib/constants.ts` içinde örnek veriler vardır. Backend'i bağlamadığınız sürece bu veriler kullanılır:

```typescript
// Dummy salon
export const DUMMY_SALON: Salon = { ... }

// Dummy services
export const DUMMY_SERVICES: ServiceCategory[] = [ ... ]

// Dummy employees
export const DUMMY_EMPLOYEES: Employee[] = [ ... ]
```

API başarısız olursa otomatik olarak dummy veriler kullanılır, böylece geliştirme devam edebilir.

## Özelliklerin Detayları

### Multi-Person Booking
- 1-4 kişi arası seçim yapılabilir
- Her kişi için ayrı uzman seçimi yapılabilir (multi-tenant sistem destekler)
- Fiyat otomatik kişi sayısıyla çarpılır

### Specialist Selection
- Uzman seçimi gereken hizmetler için modal açılır
- "Fark etmez" seçeneği mevcuttur
- Multi-person bookingde her kişi için ayrı uzman seçilebilir

### Service Filtering
- Arama kutusu ile hizmetleri filtreleyebilirsiniz
- Cinsiyet filtrelemesi (Kadın/Erkek ikonları)
- Sayaç ile 1-4 kişi seçebilirsiniz

### Responsive Layout
- Mobil: Bottom sheet modals
- Tablet/Desktop: Dialog modals
- Touch-friendly hitbox'lar

## Development

### Build for production
```bash
npm run build
```

### Run production build
```bash
npm start
```

### Lint
```bash
npm run lint
```

## Güvenlik Notları

- ✅ Frontend'de hiçbir sensitive data depolanmamıştır
- ✅ Tüm API calls backend üzerinden doğrulanmalıdır
- ✅ Backend'de RLS/authorization checks yapılmalıdır
- ✅ CORS politikası doğru konfigüre edilmelidir
- ✅ Rate limiting uygulanmalıdır

## Deployment

### Vercel'e Deploy (Önerilir)

```bash
npm install -g vercel
vercel
```

### Diğer Platformlar

Standard Next.js deployment adımlarını takip edin.

## Troubleshooting

**API'den veri gelmiyor:**
- `.env.local` dosyasında `NEXT_PUBLIC_API_URL` kontrol edin
- Browser console'da network hatası kontrol edin
- Backend'in CORS'u enable ettiğini kontrol edin

**Dummy veriler gösteriliyor:**
- API endpoint'lerinin doğru format'ta olduğunu kontrol edin
- Backend'in ayakta olduğunu kontrol edin
- `NEXT_PUBLIC_API_URL` correct olduğunu kontrol edin

**Styling sorunları:**
- `npm install` ile bağımlılıkları yeniden yükleyin
- Tailwind CSS rebuild edin: `npm run dev` restart edin

## Katkıda Bulunmak

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## İletişim

Sorularınız için backend team'e başvurun veya `MULTI_TENANT_INTEGRATION.md` dosyasını okuyun.
