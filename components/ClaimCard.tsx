'use client'

import { useState } from 'react'
import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'
import { isValidEmail } from '@/lib/validation'

interface ClaimCardProps {
  formData: Record<string, string | string[]>
  refParam: string
  sessionId: string
  recordId: string | null
  waitForRecordId?: () => Promise<string | null>
  currentQ: number
  totalQ: number
  onBack?: () => void
}

type ClaimStatus = 'idle' | 'submitting' | 'locked' | 'error'

export default function ClaimCard({
  formData,
  refParam,
  sessionId,
  recordId,
  waitForRecordId,
  currentQ,
  totalQ,
  onBack,
}: ClaimCardProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<ClaimStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const nameValid = name.trim().length > 0
  const emailValid = isValidEmail(email)
  const canSubmit = nameValid && emailValid && status !== 'submitting' && status !== 'locked'

  async function handleSubmit() {
    if (!canSubmit) return

    try {
      setStatus('submitting')
      setErrorMessage('')
      const resolvedRecordId = recordId ?? await waitForRecordId?.() ?? null

      const res = await fetch('/api/save', {
        method: resolvedRecordId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: name.trim(),
          email: email.trim(),
          ref: refParam,
          session_id: sessionId,
          record_id: resolvedRecordId ?? undefined,
          claimed: true,
        }),
      })
      const json = await res.json()

      if (!json.ok) {
        throw new Error(json.error ?? 'Save failed')
      }

      setStatus('locked')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="screen">
      <GlassStepCard
        title="Thank you for your input."
        hint="We appreciate your time. If you want 3 months free when we launch, just drop your name and email below."
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
        onBack={onBack}
      >
        <div className="claim-form">
          <input
            className="text-field"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            disabled={status === 'submitting' || status === 'locked'}
          />
          <input
            className="text-field"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            disabled={status === 'submitting' || status === 'locked'}
          />
          <button
            className="primary-action"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {status === 'locked' ? 'Locked' : 'Claim 3 Months Free'}
          </button>
          {errorMessage && (
            <p className="claim-error">{errorMessage}</p>
          )}
        </div>
      </GlassStepCard>
    </main>
  )
}
