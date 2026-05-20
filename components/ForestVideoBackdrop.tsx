'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface ForestVideoBackdropProps {
  transitionDirection: 'forward' | 'backward' | null
}

export default function ForestVideoBackdrop({ transitionDirection }: ForestVideoBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobileLike = useIsMobileLike()
  const shouldLoadVideo = useDeferredMediaLoad(prefersReducedMotion)

  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion) return

    if (isMobileLike) {
      // On mobile: play continuously at normal speed — no rate changes that cause stutter.
      video.playbackRate = 1.0
      if (video.paused) {
        void video.play().catch(() => {})
      }
    } else {
      video.playbackRate = transitionDirection === 'forward' ? 1.85 : 1.0
      if (video.paused) {
        void video.play().catch(() => {
          // Browsers can still refuse autoplay in edge cases; the CSS fallback remains readable.
        })
      }
    }
  }, [transitionDirection, prefersReducedMotion, isMobileLike])

  function replayVideo(video: HTMLVideoElement) {
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
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className="forest-video"
          src="/media/forest-flight.mp4"
          muted
          playsInline
          autoPlay
          preload="metadata"
          style={videoStyle}
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

function useIsMobileLike() {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      window.matchMedia('(max-width: 768px)').matches
    )
  }, [])

  const [isMobile, setIsMobile] = useState(initial)

  useEffect(() => {
    const touch = window.matchMedia('(hover: none) and (pointer: coarse)')
    const narrow = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(touch.matches || narrow.matches)
    touch.addEventListener('change', update)
    narrow.addEventListener('change', update)
    return () => {
      touch.removeEventListener('change', update)
      narrow.removeEventListener('change', update)
    }
  }, [])

  return isMobile
}

function useDeferredMediaLoad(prefersReducedMotion: boolean) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return

    const load = () => setShouldLoad(true)
    const idleCallback = window.requestIdleCallback?.(load, { timeout: 1400 })
    const timer = window.setTimeout(load, 1800)

    return () => {
      window.clearTimeout(timer)
      if (idleCallback !== undefined) {
        window.cancelIdleCallback?.(idleCallback)
      }
    }
  }, [prefersReducedMotion])

  return shouldLoad
}
