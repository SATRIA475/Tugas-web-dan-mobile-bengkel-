'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function FloatingClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-foreground text-background border-4 border-primary px-4 py-2 flex items-center gap-3 shadow-[8px_8px_0px_rgba(220,38,38,1)] skew-x-[-10deg] hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(220,38,38,1)] transition-all cursor-default group">
        <div className="skew-x-[10deg] flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary group-hover:animate-spin" />
          <span className="font-black italic text-xl tracking-widest uppercase">
            {time.toLocaleTimeString('en-GB')}
          </span>
        </div>
      </div>
    </div>
  )
}
