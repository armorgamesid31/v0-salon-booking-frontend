'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Star, Gift, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoyaltyStampCardProps {
  campaignName: string
  completedCount: number
  threshold: number
  rewardValue: number
  rewardType?: string
  className?: string
}

export default function LoyaltyStampCard({
  campaignName,
  completedCount,
  threshold,
  rewardValue,
  rewardType = 'FIXED',
  className,
}: LoyaltyStampCardProps) {
  // Current progress towards the next reward
  // If they have completed exactly the threshold (e.g. 10/10), show it as 10/10 until they use it
  const progress = completedCount > 0 && completedCount % threshold === 0 ? threshold : completedCount % threshold
  const stamps = Array.from({ length: threshold })
  
  // Calculate reward description
  const isFreeService = rewardType === 'free_service'
  const rewardLabel = isFreeService 
    ? 'HEDİYE' 
    : (rewardType === 'PERCENT' ? `%${rewardValue} İndirim` : `${rewardValue}₺ İndirim`)
  
  const remaining = threshold - progress
  
  return (
    <Card className={cn("overflow-hidden border-none bg-gradient-to-br from-[#0c2d1c] via-[#0f3d2a] to-[#1a4d3a] text-white shadow-2xl relative", className)}>
      {/* Subtle decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="p-6 space-y-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-400/80">{campaignName}</h3>
            <div className="text-lg font-bold tracking-tight leading-tight">
              {remaining === 0 ? (
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Ödülünüz Hazır!</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span>Sıradaki hediyeye</span>
                  <span className="text-2xl font-black text-emerald-400">{remaining} <span className="text-sm font-medium tracking-normal text-white/70">randevu kaldı</span></span>
                </div>
              )}
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
            <Gift className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {stamps.map((_, i) => {
            const isCompleted = i < progress
            const isNext = i === progress
            const isLast = i === threshold - 1

            return (
              <div
                key={i}
                className={cn(
                  "relative h-14 w-14 rounded-2xl border flex items-center justify-center transition-all duration-700",
                  isCompleted 
                    ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] rotate-2" 
                    : isNext
                      ? "bg-emerald-500/5 border-emerald-400/60 border-dashed animate-pulse ring-4 ring-emerald-400/10"
                      : "bg-black/20 border-white/5 shadow-inner",
                  isLast && !isCompleted && "border-amber-400/30"
                )}
              >
                {isCompleted ? (
                  <Check className="w-7 h-7 text-emerald-300 animate-in zoom-in spin-in-12 duration-500" />
                ) : isLast ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <Star className={cn("w-6 h-6", isNext ? "text-amber-400" : "text-white/10")} />
                    <span className="text-[7px] font-bold text-amber-200/40 uppercase tracking-tighter">FİNAL</span>
                  </div>
                ) : (
                  <div className={cn("font-black text-lg select-none transition-colors duration-500", isNext ? "text-emerald-400/60" : "text-white/5")}>
                    {i + 1}
                  </div>
                )}
                
                {isLast && (
                  <div className="absolute -top-2 -right-2">
                    <div className="flex px-2 py-0.5 items-center justify-center rounded-lg bg-amber-500 text-[9px] font-black text-amber-950 shadow-lg border border-amber-300/50">
                      {rewardLabel}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400/50">
            <span>İlerleme Durumu</span>
            <span>{progress} / {threshold}</span>
          </div>
          <div className="bg-black/40 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(52,211,153,0.6)]" 
              style={{ width: `${(progress / threshold) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-center text-emerald-200/30 font-medium italic">
          Harika görünüyorsunuz! Her randevu sizi bir hediyeye yaklaştırır.
        </p>
      </CardContent>
    </Card>
  )
}
