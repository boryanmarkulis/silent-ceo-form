'use client'

import { useEffect, useMemo, useRef } from 'react'

interface ForestVideoBackdropProps {
  currentStep: number
  totalSteps: number
  isTransitioning: boolean
}

export default function ForestVideoBackdrop({
  currentStep,
  totalSteps,
  isTransitioning,
}: ForestVideoBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion) return

    video.playbackRate = isTransitioning ? 1.85 : 0.42
    void video.play().catch(() => {
      // Browsers can still refuse autoplay in edge cases; the CSS fallback remains readable.
    })
  }, [isTransitioning, prefersReducedMotion])

  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion || !Number.isFinite(video.duration) || video.duration <= 0) return

    syncVideoToStep(video)
  }, [currentStep, totalSteps, prefersReducedMotion])

  function syncVideoToStep(video: HTMLVideoElement) {
    const usableDuration = Math.max(video.duration - 1.5, 1)
    const progress = totalSteps <= 1 ? 0 : currentStep / (totalSteps - 1)
    const targetTime = Math.min(usableDuration, Math.max(0, progress * usableDuration))

    if (Math.abs(video.currentTime - targetTime) > 5) {
      video.currentTime = targetTime
    }
  }

  const videoStyle = useMemo(
    () => ({ opacity: prefersReducedMotion ? 0 : 1 }),
    [prefersReducedMotion],
  )

  return (
    <div className="forest-video-backdrop" aria-hidden="true">
      <div className="forest-video-fallback" />
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className="forest-video"
          src="/media/forest-flight.mp4"
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          style={videoStyle}
          onLoadedMetadata={event => syncVideoToStep(event.currentTarget)}
        />
      )}
      <div className="forest-grade" />
      <div className="forest-vignette" />
    </div>
  )
}

function usePrefersReducedMotion() {
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return reducedMotion
}
