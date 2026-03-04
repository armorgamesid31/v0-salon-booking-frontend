'use client'

import type { Salon } from '@/lib/types'

interface FooterProps {
  salon: Salon
}

export function Footer({ salon }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-4">{salon.name}</h3>
            <p className="text-sm text-slate-400">
              Premium beauty and wellness services for discerning clients.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2 text-slate-400">
              <li><a href="#services" className="hover:text-white transition">Services</a></li>
              <li><a href="#about" className="hover:text-white transition">About</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex gap-4 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 {salon.name}. All rights reserved. Powered by KedyApp</p>
        </div>
      </div>
    </footer>
  )
}
