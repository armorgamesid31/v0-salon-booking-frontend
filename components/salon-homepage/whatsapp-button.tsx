import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  whatsappPhone?: string
  label: string
}

export function WhatsAppButton({ whatsappPhone, label }: WhatsAppButtonProps) {
  if (!whatsappPhone) return null

  return (
    <a
      href={`https://wa.me/${whatsappPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-lg hover:opacity-90"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  )
}
