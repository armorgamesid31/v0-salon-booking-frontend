'use client'

import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'
import type { Salon } from '@/lib/types'

interface ContactProps {
  salon: Salon
}

export function Contact({ salon }: ContactProps) {
  return (
    <section className="py-16 md:py-24 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
          Get In Touch
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {salon.phone && (
              <div className="flex gap-4 items-start">
                <Phone className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Call us</p>
                  <p className="text-slate-600">{salon.phone}</p>
                </div>
              </div>
            )}

            {salon.address && (
              <div className="flex gap-4 items-start">
                <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">Visit us</p>
                  <p className="text-slate-600">{salon.address}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-start">
              <Mail className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-slate-900">Email us</p>
                <p className="text-slate-600">info@salon.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <textarea
              placeholder="Your message"
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            ></textarea>
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </section>
  )
}
