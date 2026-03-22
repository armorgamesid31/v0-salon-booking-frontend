import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KedyApp Randevu',
  description: 'Salon randevunuzu online olusturun',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <footer className="flex justify-center pb-5 pt-4">
            <img
              src="https://cdn.kedyapp.com/kedylogo_turuncu.png"
              alt="Kedy Logo"
              className="h-[42px] w-auto"
              loading="eager"
            />
          </footer>
        </div>
      </body>
    </html>
  )
}
