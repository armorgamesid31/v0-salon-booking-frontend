import { Sparkles, Wand2, Zap, Droplet, Heart, Hand, Scissors, Lightbulb, Flower } from 'lucide-react'
import React from 'react'

export function getIconComponent(categoryKey: string): React.ReactNode {
  switch (categoryKey) {
    case 'FACIAL': return <Sparkles className="w-5 h-5" />
    case 'MEDICAL': return <Wand2 className="w-5 h-5" />
    case 'LASER': return <Zap className="w-5 h-5" />
    case 'WAX': return <Droplet className="w-5 h-5" />
    case 'BODY': return <Heart className="w-5 h-5" />
    case 'NAIL': return <Hand className="w-5 h-5" />
    case 'HAIR': return <Scissors className="w-5 h-5" />
    case 'CONSULTATION': return <Lightbulb className="w-5 h-5" />
    case 'OTHER': return <Flower className="w-5 h-5" />
    default: return <Sparkles className="w-5 h-5" />
  }
}
