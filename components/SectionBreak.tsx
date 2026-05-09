'use client'

import { useEffect } from 'react'
import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'

interface SectionBreakProps {
  heading: string
  subhead: string
  onContinue: () => void
  currentQ: number
  totalQ: number
}

export default function SectionBreak({ heading, subhead, onContinue, currentQ, totalQ }: SectionBreakProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 1800)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        clearTimeout(timer)
        onContinue()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onContinue])

  return (
    <main className="screen">
      <GlassStepCard
        meta="Next chapter"
        title={heading}
        hint={subhead}
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
      >
        <button
          onClick={onContinue}
          className="text-button"
        >
          Continue
        </button>
      </GlassStepCard>
    </main>
  )
}
