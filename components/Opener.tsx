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
        hint={<>
          <span>If you&apos;re feeling overwhelmed by data and dashboards, we&apos;d love your input.</span>
          <span style={{ display: 'block', marginTop: '0.4em' }}>We&apos;re a small team helping CEOs run with less noise and more clarity. Two minutes of your time helps us build something better.</span>
          <span style={{ display: 'block', marginTop: '0.4em' }}>As a thank you, we&apos;ll give you three  months free when we launch.</span>
        </>}
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
