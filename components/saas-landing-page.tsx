'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Users, BarChart3, Lock, Zap, Globe } from 'lucide-react'
import Link from 'next/link'

export function SaaSLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32 max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-purple-100 px-4 py-2 rounded-full">
              <p className="text-purple-700 text-sm font-medium">Multi-tenant booking platform</p>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Salon Booking Made Simple
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            KedyApp is the multi-tenant SaaS platform for beauty salons to manage appointments, services, and customers all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
            Everything you need
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Multi-Tenant Ready',
                description: 'Each salon operates independently with isolated data and customized branding.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Track bookings, revenue, and customer behavior in real-time dashboards.',
              },
              {
                icon: Zap,
                title: 'Real-time Availability',
                description: 'Automated slot management and instant appointment confirmations.',
              },
              {
                icon: Lock,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with customer data protection and compliance.',
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Support for multiple languages, currencies, and payment methods.',
              },
              {
                icon: Sparkles,
                title: 'Easy Integration',
                description: 'Simple API and webhooks to integrate with your existing systems.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
                <feature.icon className="w-8 h-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
            Simple, transparent pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$29', features: ['Up to 100 bookings/month', 'Basic analytics', '1 user account'] },
              { name: 'Professional', price: '$79', features: ['Unlimited bookings', 'Advanced analytics', '5 user accounts', 'Custom branding'] },
              { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
            ].map((plan, idx) => (
              <div key={idx} className={`p-8 rounded-lg border ${idx === 1 ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-300' : 'border-slate-200 bg-white'}`}>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold text-purple-600 mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">{idx === 2 ? 'Contact us' : 'Get started'}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to transform your salon?</h2>
          <p className="text-lg text-purple-100">
            Join hundreds of salons using KedyApp to manage their bookings and grow their business.
          </p>
          <Button size="lg" variant="secondary">
            Start your free trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 KedyApp. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
