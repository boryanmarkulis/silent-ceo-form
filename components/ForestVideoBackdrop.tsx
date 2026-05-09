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
  const previousStepRef = useRef(currentStep)
  const reverseAnimationRef = useRef<number | null>(null)
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

    const previousStep = previousStepRef.current
    if (currentStep > previousStep) {
      cancelReverseAnimation()
      syncVideoToStep(video, 'forward')
    } else if (currentStep < previousStep) {
      scrubVideoBackward(video)
    }
    previousStepRef.current = currentStep
  }, [currentStep, totalSteps, prefersReducedMotion])

  useEffect(() => {
    return () => cancelReverseAnimation()
  }, [])

  function syncVideoToStep(video: HTMLVideoElement, direction: 'forward' | 'backward') {
    const targetTime = getStepTargetTime(video)

    if (direction === 'backward') {
      video.currentTime = targetTime
    } else if (video.currentTime + 5 < targetTime) {
      video.currentTime = targetTime
    }
  }

  function getStepTargetTime(video: HTMLVideoElement) {
    const usableDuration = Math.max(video.duration - 1.5, 1)
    const progress = totalSteps <= 1 ? 0 : currentStep / (totalSteps - 1)
    return Math.min(usableDuration, Math.max(0, progress * usableDuration))
  }

  function scrubVideoBackward(video: HTMLVideoElement) {
    cancelReverseAnimation()

    const startTime = video.currentTime
    const targetTime = getStepTargetTime(video)
    if (startTime <= targetTime) {
      video.currentTime = targetTime
      return
    }

    const duration = 620
    const startedAt = performance.now()
    video.pause()

    function tick(now: number) {
      const elapsed = now - startedAt
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)

      video.currentTime = startTime + (targetTime - startTime) * eased

      if (progress < 1) {
        reverseAnimationRef.current = requestAnimationFrame(tick)
        return
      }

      video.currentTime = targetTime
      reverseAnimationRef.current = null
      video.playbackRate = 0.42
      void video.play().catch(() => {
        // The static fallback remains in place if the browser refuses playback.
      })
    }

    reverseAnimationRef.current = requestAnimationFrame(tick)
  }

  function cancelReverseAnimation() {
    if (reverseAnimationRef.current === null) return
    cancelAnimationFrame(reverseAnimationRef.current)
    reverseAnimationRef.current = null
  }

  function replayVideo(video: HTMLVideoElement) {
    cancelReverseAnimation()
    video.currentTime = 0
    void video.play().catch(() => {
      // The static fallback remains in place if the browser refuses playback.
    })
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
          preload="auto"
          style={videoStyle}
          onLoadedMetadata={event => syncVideoToStep(event.currentTarget, 'forward')}
          onEnded={event => replayVideo(event.currentTarget)}
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
