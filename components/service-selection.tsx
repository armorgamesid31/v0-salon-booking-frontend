'use client'

import { Service } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ServiceSelectionProps {
  services: Service[]
  selectedServiceId: string | null
  onSelectService: (serviceId: string) => void
  isLoading?: boolean
}

export function ServiceSelection({
  services,
  selectedServiceId,
  onSelectService,
  isLoading = false,
}: ServiceSelectionProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Select a Service
        </h2>
        <p className="text-muted-foreground">
          Choose the service you would like to book
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              selectedServiceId === service.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => !isLoading && onSelectService(service.id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="font-semibold text-foreground">
                    {service.duration} min
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-xl font-bold text-primary">
                    ${service.price}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedServiceId && (
        <div className="mt-8 p-4 bg-secondary rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Selected service:{' '}
            <span className="font-semibold text-foreground">
              {services.find((s) => s.id === selectedServiceId)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
