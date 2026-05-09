'use client'

interface ProgressBarProps {
  currentQ: number
  totalQ: number
}

export default function ProgressBar({ currentQ, totalQ }: ProgressBarProps) {
  const pct = Math.min(100, (currentQ / totalQ) * 100)
  return (
    <div className="progress-wrap" aria-hidden="true">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-count">
        {currentQ}/{totalQ}
      </span>
    </div>
  )
}
