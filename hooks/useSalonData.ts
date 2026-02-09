import useSWR from 'swr'
import type { Salon, ServiceCategory, Employee, Package, Appointment } from '@/lib/types'
import { getSalon, getServices, getEmployees, getPackages, getAppointments } from '@/lib/api'

/**
 * Multi-tenant salon bilgilerini çeker
 */
export function useSalonData(salonId: string) {
  const { data: salon, error: salonError, isLoading: salonLoading } = useSWR(
    salonId ? `salon-${salonId}` : null,
    () => getSalon(salonId),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const { data: services, error: servicesError, isLoading: servicesLoading } = useSWR(
    salonId ? `services-${salonId}` : null,
    () => getServices(salonId),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const { data: employees, error: employeesError, isLoading: employeesLoading } = useSWR(
    salonId ? `employees-${salonId}` : null,
    () => getEmployees(salonId),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const { data: packages, error: packagesError, isLoading: packagesLoading } = useSWR(
    salonId ? `packages-${salonId}` : null,
    () => getPackages(salonId),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return {
    salon: salon || null,
    services: services || [],
    employees: employees || [],
    packages: packages || [],
    loading: salonLoading || servicesLoading || employeesLoading || packagesLoading,
    error: salonError || servicesError || employeesError || packagesError,
  }
}

/**
 * Müşterinin randevu geçmişini çeker
 */
export function useCustomerAppointments(salonId: string, customerId: string) {
  const { data: appointments, error, isLoading, mutate } = useSWR(
    salonId && customerId ? `appointments-${salonId}-${customerId}` : null,
    () => getAppointments(salonId, customerId),
    { revalidateOnFocus: false }
  )

  return {
    appointments: appointments || [],
    loading: isLoading,
    error,
    mutate,
  }
}
