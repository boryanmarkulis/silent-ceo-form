import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'

interface ClosingProps {
  email?: string
  submitError?: string
  onRetry?: () => void
  currentQ: number
  totalQ: number
}

export default function Closing({ email, submitError, onRetry, currentQ, totalQ }: ClosingProps) {
  return (
    <main className="screen">
      <GlassStepCard
        meta="Received"
        title="Thank you."
        hint="We're keeping this small for now. If what you wrote sparks something, Miguel or Boryan will reach out personally."
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
      >
        <p className="closing-signoff">- B &amp; M</p>
        {email && email.length > 0 && (
          <p className="closing-update">
            We&apos;ll send rare updates as we build.
          </p>
        )}
        {submitError && (
          <button
            onClick={onRetry}
            className="text-button"
            style={{ color: 'var(--error)', marginTop: '1.75rem' }}
          >
            Something went wrong - tap here to retry.
          </button>
        )}
      </GlassStepCard>
    </main>
  )
}
