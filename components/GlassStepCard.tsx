'use client'

import type { ReactNode } from 'react'

interface GlassStepCardProps {
  meta?: string
  title: ReactNode
  hint?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  tone?: 'default' | 'hero'
  onBack?: () => void
}

export default function GlassStepCard({
  meta,
  title,
  hint,
  children,
  footer,
  tone = 'default',
  onBack,
}: GlassStepCardProps) {
  return (
    <section className={`glass-card ${tone === 'hero' ? 'glass-card-hero' : ''}`}>
      <div className="glass-card-header">
        {meta && <p className="glass-meta">{meta}</p>}
        <div className="glass-title-row">
          <h1 className="glass-title">{title}</h1>
        </div>
        {hint && <p className="glass-hint">{hint}</p>}
      </div>

      {children && (
        <div className="glass-card-body">
          {children}
        </div>
      )}

      {footer && (
        <div className="glass-card-footer">
          {footer}
        </div>
      )}
    </section>
  )
}
