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
  onComplete?: () => void
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
  onComplete,
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
      onComplete?.()
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (status === 'locked') {
    return (
      <main className="screen">
        <section className="glass-card">
          <div className="glass-card-header">
            <div className="glass-title-row">
              <h1 className="glass-title">Completed ✓</h1>
            </div>
            <p className="glass-hint" style={{ marginBottom: 0 }}>
              We&apos;re keeping things low key for now. If what you wrote sparks something, I&apos;ll reach out personally. Thank you for your time.
            </p>
          </div>
          <div style={{
            position: 'relative',
            zIndex: 1,
            flex: '0 0 auto',
            padding: 'clamp(1rem, 2.5vh, 1.4rem) clamp(1.25rem, 4vw, 2.4rem)',
            color: 'var(--ink-muted)',
            fontSize: '1rem',
            lineHeight: '1.62',
          }}>
            — Miguel
          </div>
          <div className="glass-card-footer" style={{ paddingTop: 0 }}>
            <ProgressBar currentQ={currentQ} totalQ={totalQ} />
          </div>
        </section>
      </main>
    )
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
            disabled={status === 'submitting'}
          />
          <input
            className="text-field"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            disabled={status === 'submitting'}
          />
          <button
            className="primary-action"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Claim 3 Months Free
          </button>
          {errorMessage && (
            <p className="claim-error">{errorMessage}</p>
          )}
        </div>
      </GlassStepCard>
    </main>
  )
}
