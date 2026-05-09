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
        meta="Private founder research"
        title="We're building something quiet for people running real businesses."
        hint="For founders who feel one step removed from their own. A few questions, if you have five minutes."
        tone="hero"
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
      >
        <button
          onClick={onBegin}
          className="primary-action"
        >
          Begin
        </button>
      </GlassStepCard>
    </main>
  )
}
