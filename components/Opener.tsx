'use client'

import { useEffect } from 'react'
import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'

interface OpenerProps {
  onBegin: () => void
  currentQ: number
  totalQ: number
}

export default function Opener({ onBegin, currentQ, totalQ }: OpenerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onBegin()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onBegin])

  return (
    <main className="screen">
      <GlassStepCard
        title="We're building something silent for people running real businesses."
        hint="If you're a founder feeling overwhelmed by data and dashboards, we'd love your input."
        tone="hero"
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
      >
        <button
          onClick={onBegin}
          className="text-button scroll-cta"
        >
          Scroll to continue <span aria-hidden="true" className="scroll-cta-arrow">↓</span>
        </button>
      </GlassStepCard>
    </main>
  )
}
