import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'

interface ClosingProps {
  submitError?: string
  onRetry?: () => void
  currentQ: number
  totalQ: number
}

export default function Closing({ submitError, onRetry, currentQ, totalQ }: ClosingProps) {
  return (
    <main className="screen">
      <GlassStepCard
        title="Thank you for your input."
        hint="We're keeping this low key for now. If what you wrote sparks some inspiration, I'll reach out personally."
        footer={<ProgressBar currentQ={currentQ} totalQ={totalQ} />}
      >
        <p className="closing-signoff">- Miguel</p>
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
