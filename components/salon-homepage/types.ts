import type {
  HomepageBooking,
  HomepageCategory,
  HomepageExpert,
  HomepageGalleryItem,
  HomepageSalon,
  HomepageTestimonial,
} from '@/lib/types'
import type { ReactNode } from 'react'

export interface HomepageLabels {
  bookNow: string
  reserveAppointment: string
  aboutTitle: string
  galleryTitle: string
  instagramTitle: string
  contactTitle: string
  expertsTitle: string
  openWhatsapp: string
  workingSchedule: string
  categories: string
  servicesCount: (count: number) => string
  clientReviews: string
  getInTouch: string
}

export interface SalonHomepageProps {
  salon: HomepageSalon
  categories: HomepageCategory[]
  experts: HomepageExpert[]
  gallery: HomepageGalleryItem[]
  testimonials: HomepageTestimonial[]
  booking: HomepageBooking
  labels: HomepageLabels
  languageControl?: ReactNode
  locale?: string
}
