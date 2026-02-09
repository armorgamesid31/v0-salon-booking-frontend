'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { Salon, Customer } from '@/lib/types'

interface SalonContextType {
  salonId: string
  salon: Salon | null
  customerId: string
  customer: Customer | null
  loading: boolean
}

const SalonContext = createContext<SalonContextType | undefined>(undefined)

export function SalonProvider({
  children,
  salonId,
  customerId,
  salon,
}: {
  children: ReactNode
  salonId: string
  customerId: string
  salon?: Salon | null
}) {
  return (
    <SalonContext.Provider
      value={{
        salonId,
        salon: salon || null,
        customerId,
        customer: null,
        loading: false,
      }}
    >
      {children}
    </SalonContext.Provider>
  )
}

export function useSalon() {
  const context = useContext(SalonContext)
  if (!context) {
    throw new Error('useSalon must be used within SalonProvider')
  }
  return context
}
