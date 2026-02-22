# Booking Frontend UI - Analiz Raporu

## 1. Proje Stack'i ve Framework

### Ana Teknolojiler
- **Framework:** Next.js 16.1.6 (App Router)
- **Runtime:** React 19
- **Dil:** TypeScript 5.7.3
- **Styling:** Tailwind CSS 3.4.17 + PostCSS
- **Data Fetching:** SWR 2.2.4
- **Form Yönetimi:** React Hook Form 7.54.1 + Zod 3.24.1
- **UI Komponenler:** Radix UI + shadcn/ui
- **Icon Kütüphanesi:** Lucide React 0.544.0
- **Tarih İşlemleri:** date-fns 4.1.0

### Proje Yapısı
```
Next.js App Router (Client-Side Rendering)
├── app/ (route handlers)
├── components/ (UI components)
├── lib/ (utilities, API, types, constants)
└── hooks/ (custom React hooks)
```

## 2. Booking Sayfası Ana Giriş Dosyası

**Dosya:** `app/page.tsx`

**Komponenent:** `SalonDashboard` (1802 satır)

**İçeriği:**
- Tüm booking flow'u tek bir client-side component içinde
- Service selection, specialist selection, date/time picking
- Multi-person booking support (1-4 kişi)
- Package management
- Appointment history
- Registration ve confirmation modals

## 3. Magic Link Akışının UI'da Durumu

### Mevcut Durum: **MAGIC LINK AKIŞI MEVCUT DEĞİL**

Projede magic link authentication implementasyonu bulunmuyor. Bunun yerine şu akışlar var:

#### a) Sayfa Açılışında Müşteri Tipi Seçimi
**Dosya:** `app/page.tsx` (satır 1742-1796)
```typescript
// Customer Type Selection Modal
showCustomerTypeModal && isKnownCustomer === null
```
- "Bilinen Müşteri" veya "Yeni Müşteri" seçimi
- State ile kontrol ediliyor (`isKnownCustomer`)

#### b) Yeni Müşteri Kayıt Formu
**Dosya:** `app/page.tsx` (satır 1396-1558)
```typescript
// Registration Modal
showRegistrationModal
```
**Alanlar:**
- Ad Soyad
- Telefon
- Cinsiyet
- Doğum Tarihi
- Marketing onayı

**Akış:** Kayıt → Doğrudan onaylama (TODO: Backend API)

#### c) Mevcut Authentication Yapısı
**Dosya:** `.env.example` (satır 11-12)
```
NEXT_PUBLIC_CUSTOMER_ID=customer-001
```
- Müşteri ID'si environment variable'dan alınıyor
- Gerçek authentication yok, placeholder kullanılıyor

### Magic Link İçin Gerekli Değişiklikler

**Şu anda OTP komponenti mevcut:**
- `components/ui/input-otp.tsx` (shadcn/ui component)
- `input-otp` package yüklü (1.4.1)

**Fakat kullanılmıyor!**

## 4. Backend Entegrasyonu İçin Dokunulması Gereken Dosyalar

### Minimum Dosya Listesi (6 dosya):

#### 1. `lib/api.ts` (124 satır)
**Dokunulması gerekenler:**
- `fetchFromAPI` helper'a auth token ekleme
- Her API call'a Authorization header ekleme
- Token refresh mekanizması
- Error handling (401 Unauthorized)

**Yeni eklenecek fonksiyonlar:**
```typescript
export async function sendMagicLink(phone: string, salonId: string)
export async function verifyMagicLink(token: string, code: string)
export async function getCustomerSession()
export async function logout()
```

#### 2. `lib/types.ts` (86 satır)
**Eklenecek tipler:**
```typescript
export interface AuthSession {
  customerId: string
  salonId: string
  token: string
  expiresAt: string
}

export interface MagicLinkRequest {
  phone: string
  salonId: string
}

export interface MagicLinkVerification {
  token: string
  code: string
}
```

#### 3. `.env.example` (16 satır)
**Eklenecekler:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SALON_ID=salon-001
# Aşağıdakini kaldır (artık auth'dan gelecek):
# NEXT_PUBLIC_CUSTOMER_ID=customer-001
```

#### 4. `app/page.tsx` (1802 satır)
**Değişiklikler:**
- Customer Type Modal yerine Magic Link Login Modal
- Registration Modal'ı güncelleme (telefon + OTP)
- `isKnownCustomer` state'ini auth session'dan kontrol
- API call'larda token kullanımı

**Yeni eklenecek modals:**
```typescript
// Magic Link Login Modal (telefon girişi)
showMagicLinkModal

// OTP Verification Modal (kod doğrulama)
showOTPModal
```

#### 5. `app/layout.tsx` (718 satır)
**Eklenecekler:**
- Auth context provider
- Session yönetimi
- Protected route check
- Redirect logic (giriş yapmamışsa login'e yönlendir)

#### 6. `lib/constants.ts` (5818 satır)
**Eklenecekler:**
```typescript
export const AUTH_CONFIG = {
  magicLinkExpiry: 15 * 60 * 1000, // 15 dakika
  otpLength: 6,
  otpExpiry: 5 * 60 * 1000, // 5 dakika
}
```

### Opsiyonel Ama Önerilen Dosyalar (3 dosya):

#### 7. `hooks/useAuth.tsx` (YENİ)
**Yaratılacak:**
```typescript
export function useAuth() {
  // Session yönetimi
  // Login/logout functions
  // Token refresh
  // isAuthenticated check
}
```

#### 8. `components/MagicLinkLogin.tsx` (YENİ)
**Yaratılacak:**
- Telefon input
- Magic link gönderme butonu
- OTP input (input-otp kullanarak)
- Doğrulama butonu

#### 9. `middleware.ts` (YENİ - root level)
**Yaratılacak:**
```typescript
// Next.js middleware for auth check
// Redirect unauthenticated users
```

## Özet

### Mevcut Durum
- ✅ Modern Next.js + TypeScript stack
- ✅ Booking flow tamamen implementasyonlu
- ✅ Multi-tenant hazır (salonId parametrik)
- ✅ OTP komponenti yüklü ama kullanılmıyor
- ❌ Magic link authentication YOK
- ❌ Gerçek authentication mekanizması YOK
- ❌ Token yönetimi YOK

### Backend Entegrasyonu İçin Aksiyon Planı

**Minimum 6 dosya düzenlenecek:**
1. `lib/api.ts` - Auth fonksiyonları ekle
2. `lib/types.ts` - Auth tipleri ekle
3. `.env.example` - Auth config ekle
4. `app/page.tsx` - Magic link modals ekle
5. `app/layout.tsx` - Auth provider ekle
6. `lib/constants.ts` - Auth constants ekle

**Önerilen 3 yeni dosya:**
7. `hooks/useAuth.tsx` - Auth hook
8. `components/MagicLinkLogin.tsx` - Login UI
9. `middleware.ts` - Route protection

**Backend'den beklenen endpoint'ler:**
- `POST /api/auth/magic-link` - Magic link gönder
- `POST /api/auth/verify` - OTP doğrula
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/session` - Session kontrol

---

**Tarih:** 10 Şubat 2026  
**Analiz Eden:** Cursor AI Agent  
**Repo:** Booking Frontend UI (v0 generated)
