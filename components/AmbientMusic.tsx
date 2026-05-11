'use client'

import { useEffect, useRef } from 'react'

const MUSIC_SRC = '/media/wind-walkers.mp3'

export default function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.72

    const removeFallbackListeners = () => {
      window.removeEventListener('pointerdown', play)
      window.removeEventListener('keydown', play)
      window.removeEventListener('touchstart', play)
    }

    const play = () => {
      void audio.play()
        .then(removeFallbackListeners)
        .catch(() => {
          window.addEventListener('pointerdown', play, { once: true })
          window.addEventListener('keydown', play, { once: true })
          window.addEventListener('touchstart', play, { once: true })
        })
    }

    play()

    return removeFallbackListeners
  }, [])

  return (
    <audio
      ref={audioRef}
      className="ambient-music"
      src={MUSIC_SRC}
      autoPlay
      loop
      preload="auto"
      aria-hidden="true"
    />
  )
}
