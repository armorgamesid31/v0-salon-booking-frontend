'use client'

import React from "react"
import { CheckCircle } from 'lucide-react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChevronDown,
  Search,
  Bell,
  Zap,
  Sparkles,
  Leaf,
  Heart,
  Scissors,
  Palette,
  Eye,
  Droplet,
  Flower,
  Wand2,
  MessageCircle,
  Plus,
  Calendar,
  Clock,
  Star,
  X,
  History,
  Package,
} from 'lucide-react'

interface ServiceItem {
  id: string
  name: string
  duration: string
  originalPrice: number
  salePrice: number
  tags?: string[]
}

interface ServiceCategory {
  id: string
  name: string
  count: number
  icon: React.ReactNode
  services: ServiceItem[]
}

interface PastAppointment {
  id: string
  service: string
  date: string
  time: string
  specialists: string[]
  packageName?: string
  isRated?: boolean
}

interface ActivePackage {
  id: string
  name: string
  badge: 'Aktif' | 'Bitiryor'
  remainingSessions: number
  totalSessions: number
  expiryDate: string
  warning?: string
  availableServices: Array<{
    id: string
    name: string
    duration: string
    used: number
    total: number
    isFinished?: boolean
  }>
}

const CUSTOMER = {
  name: 'Ayşe',
  greeting: 'Tekrar hoş geldin',
}

const PAST_APPOINTMENTS: PastAppointment[] = [
  {
    id: 'a1',
    service: 'Lazer',
    date: '2024-03-12',
    time: '14:00',
    specialists: ['Bacak', 'Kol'],
    packageName: 'Laser Paketi',
    isRated: false,
  },
  {
    id: 'a2',
    service: 'Cilt Bakımı',
    date: '2024-02-28',
    time: '10:30',
    specialists: ['Premium Yüz Bakımı'],
    isRated: true,
  },
  {
    id: 'a3',
    service: 'Saç Kesimi',
    date: '2024-02-15',
    time: '15:00',
    specialists: ['Mehmet'],
    isRated: false,
  },
]

const ACTIVE_PACKAGES: ActivePackage[] = [
  {
    id: 'p1',
    name: 'Laser Paketi – Tam Vücut',
    badge: 'Aktif',
    remainingSessions: 6,
    totalSessions: 10,
    expiryDate: '30 Haziran 2024',
    warning: 'Bacak bölgesi için son 2 hakkın kaldı',
    availableServices: [
      { id: 's1', name: 'Bacak Lazer', duration: '30 dk', used: 2, total: 4 },
      { id: 's2', name: 'Kol Lazer', duration: '20 dk', used: 3, total: 4 },
      { id: 's3', name: 'Bikini Bölgesi', duration: '15 dk', used: 4, total: 4, isFinished: true },
    ],
  },
  {
    id: 'p2',
    name: 'Manikür & Pedikür Paketi',
    badge: 'Bitiryor',
    remainingSessions: 1,
    totalSessions: 5,
    expiryDate: '15 Nisan 2024',
    availableServices: [
      { id: 's4', name: 'Manikür', duration: '30 dk', used: 4, total: 5 },
    ],
  },
]

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'epilasyon',
    name: 'Epilasyon & Tüy Alma',
    count: 4,
    icon: <Zap className="w-5 h-5" />,
    services: [
      { id: 's1', name: 'Tam Vücut', duration: '60 dk', originalPrice: 1800, salePrice: 1650, tags: ['Fast Track'] },
      { id: 's2', name: 'Sırt Lazer', duration: '30 dk', originalPrice: 1200, salePrice: 1100 },
      { id: 's3', name: 'Bacak Lazer', duration: '45 dk', originalPrice: 1500, salePrice: 1350 },
      { id: 's4', name: 'Sır Ağda', duration: '20 dk', originalPrice: 400, salePrice: 400 },
    ],
  },
  {
    id: 'ciltkabimi',
    name: 'Cilt Bakımı & Yüz',
    count: 4,
    icon: <Heart className="w-5 h-5" />,
    services: [
      { id: 's5', name: 'Klasik Yüz Temizliği', duration: '60 dk', originalPrice: 300, salePrice: 250 },
      { id: 's6', name: 'Hydrafacial', duration: '50 dk', originalPrice: 800, salePrice: 700 },
      { id: 's7', name: 'İğneli Mezoterapi', duration: '40 dk', originalPrice: 600, salePrice: 500 },
      { id: 's8', name: 'Kimyasal Peeling', duration: '45 dk', originalPrice: 500, salePrice: 420 },
    ],
  },
  {
    id: 'vucutsekillendir',
    name: 'Vücut Şekillendirme',
    count: 3,
    icon: <Leaf className="w-5 h-5" />,
    services: [
      { id: 's9', name: 'Selülit Tedavisi', duration: '45 dk', originalPrice: 400, salePrice: 350 },
      { id: 's10', name: 'Liposuction', duration: '60 dk', originalPrice: 1200, salePrice: 1000 },
      { id: 's11', name: 'Enjeksiyon Tedavisi', duration: '30 dk', originalPrice: 600, salePrice: 500 },
    ],
  },
  {
    id: 'tirnaksac',
    name: 'Tırnak Sanatı & Ayak Bakımı',
    count: 4,
    icon: <Sparkles className="w-5 h-5" />,
    services: [
      { id: 's12', name: 'Manikür', duration: '45 dk', originalPrice: 150, salePrice: 120 },
      { id: 's13', name: 'Pedikür', duration: '50 dk', originalPrice: 180, salePrice: 150 },
      { id: 's14', name: 'Tırnak Tasarımı', duration: '60 dk', originalPrice: 250, salePrice: 200 },
      { id: 's15', name: 'Kalıcı Cilalama', duration: '55 dk', originalPrice: 300, salePrice: 250 },
    ],
  },
  {
    id: 'kashkiprik',
    name: 'Kaş & Kirpik',
    count: 4,
    icon: <Eye className="w-5 h-5" />,
    services: [
      { id: 's16', name: 'Kaş Tasarımı', duration: '30 dk', originalPrice: 200, salePrice: 150 },
      { id: 's17', name: 'Kaş Ombre', duration: '45 dk', originalPrice: 400, salePrice: 350 },
      { id: 's18', name: 'Kirpik Lifting', duration: '50 dk', originalPrice: 500, salePrice: 420 },
      { id: 's19', name: 'Kirpik Uzatma', duration: '60 dk', originalPrice: 600, salePrice: 500 },
    ],
  },
  {
    id: 'sactasarimi',
    name: 'Saç Tasarımı',
    count: 5,
    icon: <Scissors className="w-5 h-5" />,
    services: [
      { id: 's20', name: 'Saç Kesimi', duration: '30 dk', originalPrice: 150, salePrice: 120 },
      { id: 's21', name: 'Saç Boyama', duration: '90 dk', originalPrice: 400, salePrice: 320 },
      { id: 's22', name: 'Balayaj', duration: '120 dk', originalPrice: 600, salePrice: 480 },
      { id: 's23', name: 'Fön & Şekil', duration: '45 dk', originalPrice: 200, salePrice: 160 },
      { id: 's24', name: 'Saç Bakımı', duration: '60 dk', originalPrice: 300, salePrice: 240 },
    ],
  },
  {
    id: 'kalicimakyaj',
    name: 'Kalıcı Makyaj',
    count: 3,
    icon: <Palette className="w-5 h-5" />,
    services: [
      { id: 's25', name: 'Kaş Tatouaj', duration: '60 dk', originalPrice: 800, salePrice: 700 },
      { id: 's26', name: 'Eyeliner Tatouaj', duration: '45 dk', originalPrice: 600, salePrice: 500 },
      { id: 's27', name: 'Dudak Tatouaj', duration: '50 dk', originalPrice: 700, salePrice: 600 },
    ],
  },
  {
    id: 'medikal',
    name: 'Medikal Estetik',
    count: 4,
    icon: <Droplet className="w-5 h-5" />,
    services: [
      { id: 's28', name: 'Botox', duration: '20 dk', originalPrice: 1000, salePrice: 800 },
      { id: 's29', name: 'Dolgu Enjeksiyonu', duration: '30 dk', originalPrice: 1200, salePrice: 1000 },
      { id: 's30', name: 'PRP Tedavisi', duration: '45 dk', originalPrice: 1500, salePrice: 1200 },
      { id: 's31', name: 'Lipolitik Enjeksiyon', duration: '40 dk', originalPrice: 800, salePrice: 650 },
    ],
  },
  {
    id: 'spa',
    name: 'Spa & Wellness',
    count: 4,
    icon: <Flower className="w-5 h-5" />,
    services: [
      { id: 's32', name: 'Klasik Masaj', duration: '60 dk', originalPrice: 400, salePrice: 320 },
      { id: 's33', name: 'Thai Masaj', duration: '90 dk', originalPrice: 600, salePrice: 480 },
      { id: 's34', name: 'Çişe Masaj', duration: '50 dk', originalPrice: 350, salePrice: 280 },
      { id: 's35', name: 'Aromaterapy', duration: '45 dk', originalPrice: 300, salePrice: 240 },
    ],
  },
  {
    id: 'profesyonelmakyaj',
    name: 'Profesyonel Makyaj',
    count: 3,
    icon: <Wand2 className="w-5 h-5" />,
    services: [
      { id: 's36', name: 'Gelin Makyajı', duration: '90 dk', originalPrice: 800, salePrice: 700 },
      { id: 's37', name: 'Parti Makyajı', duration: '60 dk', originalPrice: 600, salePrice: 500 },
      { id: 's38', name: 'Günlük Makyaj', duration: '45 dk', originalPrice: 400, salePrice: 320 },
    ],
  },
  {
    id: 'danismanlik',
    name: 'Danışmanlık',
    count: 3,
    icon: <MessageCircle className="w-5 h-5" />,
    services: [
      { id: 's39', name: 'Güzellik Danışmanlığı', duration: '30 dk', originalPrice: 100, salePrice: 0 },
      { id: 's40', name: 'Cilt Analizi', duration: '25 dk', originalPrice: 150, salePrice: 0 },
      { id: 's41', name: 'Stil Danışmanlığı', duration: '45 dk', originalPrice: 200, salePrice: 0 },
    ],
  },
]

export default function SalonDashboard() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState(false)
  const [expandedPackages, setExpandedPackages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [referralToggle, setReferralToggle] = useState(false)
  const [ratingModal, setRatingModal] = useState<PastAppointment | null>(null)
  const [serviceRating, setServiceRating] = useState(0)
  const [staffRating, setStaffRating] = useState(0)
  const [comment, setComment] = useState('')

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    })
  }

  const filteredCategories = SERVICE_CATEGORIES.map((cat) => ({
    ...cat,
    services: cat.services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.services.length > 0 || !searchQuery)

  const handleSubmitRating = () => {
    setRatingModal(null)
    setServiceRating(0)
    setStaffRating(0)
    setComment('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 animate-in fade-in slide-in-from-top duration-300">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                ✨
              </div>
              <span className="font-bold text-foreground text-lg">SalonAsistan</span>
            </div>
            <Bell className="w-6 h-6 text-primary cursor-pointer hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-muted-foreground">
            {CUSTOMER.greeting}, {CUSTOMER.name} ✨
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom duration-500">
          <button
            onClick={() => setExpandedHistory(!expandedHistory)}
            className="group text-left"
          >
            <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Son Randevular</span>
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  Geçmiş randevularınız
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedHistory ? 'rotate-180' : ''}`} />
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            onClick={() => setExpandedPackages(!expandedPackages)}
            className="group text-left"
          >
            <Card className="bg-card border-border hover:border-secondary/50 transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-semibold text-foreground">Paketlerim</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground group-hover:text-secondary transition-colors">
                    Aktif paketler
                  </span>
                  <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded">
                    {ACTIVE_PACKAGES.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        </div>

        {/* Past Appointments Section */}
        {expandedHistory && (
          <Card className="bg-card border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-foreground text-sm flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <span className="font-bold">Son Randevular</span>
              </h3>
              <div className="space-y-3">
                {PAST_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                    <div className="flex-1 mb-3">
                      <p className="font-medium text-foreground text-sm">{formatDate(apt.date)} • {apt.service}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hizmetler: {apt.specialists.join(', ')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs w-full">
                        Tekrarla
                      </Button>
                      {apt.isRated ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-secondary text-secondary rounded-full text-xs w-full bg-transparent"
                          disabled
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Değerlendirildi
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary rounded-full text-xs w-full bg-transparent"
                          onClick={() => setRatingModal(apt)}
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Değerlendir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Packages Section */}
        {expandedPackages && (
          <Card className="bg-card border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-foreground text-sm flex items-center gap-2">
                <Package className="w-5 h-5 text-secondary" />
                <span className="font-bold">Paketlerim</span>
              </h3>
              <div className="space-y-4">
                {ACTIVE_PACKAGES.map((pkg) => (
                  <Card key={pkg.id} className="bg-secondary/5 border-secondary/30 overflow-hidden rounded-2xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{pkg.totalSessions} seans paket</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pkg.badge === 'Aktif' ? 'bg-secondary text-secondary-foreground' : 'bg-yellow-100 text-yellow-800'}`}>
                          {pkg.badge}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-foreground">{pkg.remainingSessions} / {pkg.totalSessions} kullanım kaldı</p>
                          <p className="text-xs font-medium text-secondary">{Math.round((pkg.remainingSessions / pkg.totalSessions) * 100)}%</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-secondary h-full transition-all duration-500"
                            style={{ width: `${(pkg.remainingSessions / pkg.totalSessions) * 100}%` }}
                          />
                        </div>
                      </div>

                      {pkg.warning && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠️</span>
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">{pkg.warning}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Kullanılabilir Hizmetler:</p>
                        {pkg.availableServices.map((service) => (
                          <label key={service.id} className={`flex items-start gap-3 p-2 rounded-lg border-2 cursor-pointer transition-all duration-300 ${service.isFinished ? 'border-muted bg-muted/30 opacity-50' : 'border-secondary/30 hover:border-secondary/50 bg-white dark:bg-slate-900'}`}>
                            <input
                              type="checkbox"
                              disabled={service.isFinished}
                              className="w-4 h-4 mt-1 accent-secondary"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{service.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{service.duration}</span>
                                <span className={`text-xs font-semibold ${service.isFinished ? 'text-muted-foreground line-through' : 'text-secondary'}`}>
                                  {service.used}/{service.total} kaldı
                                </span>
                                {service.isFinished && <span className="text-xs text-muted-foreground">Tükendi</span>}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">Son geçerlilik: {pkg.expiryDate}</p>
                      <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Seçilenlerle Devam Et
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hizmet ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
          />
        </div>

        {/* Referral Banner */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-primary rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👥</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                Randevuna arkadaşını ekle,<br />
                <span className="text-primary">anında 100 TL</span> kazan!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                İşte hem de arkadaşın indirim kazanın
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={referralToggle}
                onChange={(e) => setReferralToggle(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
            </label>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <div className="space-y-3">
          {filteredCategories.map((category, index) => (
            <Card
              key={category.id}
              className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category.id ? null : category.id)
                }
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{category.icon}</div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">{category.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {category.count}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedCategory === category.id && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {category.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0 hover:bg-muted/20 rounded px-2 py-1 transition-all duration-300"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{service.duration}</span>
                          {service.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded animate-pulse"
                            >
                              ⚡ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline gap-2 justify-end">
                          {service.originalPrice > 0 && service.salePrice < service.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {service.originalPrice}
                            </span>
                          )}
                          {service.salePrice > 0 && (
                            <p className="text-sm font-bold text-secondary">
                              {service.salePrice}
                              <span className="text-xs">₺</span>
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 border-primary text-primary hover:bg-primary/10 rounded-lg text-xs gap-1 transition-all duration-300 hover:scale-105 bg-transparent"
                        >
                          <Plus className="w-3 h-3" />
                          Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Randevunu Değerlendir</h2>
              <button
                onClick={() => setRatingModal(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {formatDate(ratingModal.date)} • {ratingModal.service} ({ratingModal.specialists.join(', ')})
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Hizmet değerlendir <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => setServiceRating(i)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i <= serviceRating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Yorumun
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Deneyimin nasıldı? (istege bağlı)"
                    className="w-full p-3 border-2 border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">
                    Zeynep - Personel Değerlendirmesi
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() => setStaffRating(i)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i <= staffRating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitRating}
                className="w-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                Gönder
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
