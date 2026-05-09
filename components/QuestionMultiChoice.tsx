'use client'

import { useEffect, useRef, useState } from 'react'
import type { Question } from '@/lib/sections'

interface QuestionMultiChoiceProps {
  question: Question
  onAnswer: (value: string[]) => void
}

export default function QuestionMultiChoice({ question, onAnswer }: QuestionMultiChoiceProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [otherChecked, setOtherChecked] = useState(false)
  const [otherText, setOtherText] = useState('')
  const otherInputRef = useRef<HTMLInputElement>(null)
  const options = question.options ?? []

  useEffect(() => {
    if (otherChecked) {
      setTimeout(() => otherInputRef.current?.focus(), 50)
    }
  }, [otherChecked])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement)) {
        if (selected.size > 0 || otherChecked) {
          handleContinue()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, otherChecked, otherText])

  function toggleOption(value: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function handleContinue() {
    const result = Array.from(selected)
    if (otherChecked && otherText.trim()) {
      result.push(`other:${otherText.trim()}`)
    } else if (otherChecked) {
      result.push('other')
    }
    if (result.length === 0) return
    onAnswer(result)
  }

  const hasSelection = selected.size > 0 || otherChecked

  return (
    <div>
      <div className="choice-list">
        {options.map(opt => {
          const checked = selected.has(opt.value)
          return (
            <label key={opt.value} className={`choice-card ${checked ? 'is-active' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOption(opt.value)}
                className="native-check"
              />
              <span className="choice-label">{opt.label}</span>
            </label>
          )
        })}

        <label className={`choice-card ${otherChecked ? 'is-active' : ''}`}>
          <input
            type="checkbox"
            checked={otherChecked}
            onChange={() => setOtherChecked(v => !v)}
            className="native-check"
          />
          <span className="choice-label">Other</span>
        </label>

        {otherChecked && (
          <input
            className="text-field"
            ref={otherInputRef}
            type="text"
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (hasSelection) handleContinue() } }}
            placeholder="Please specify..."
          />
        )}
      </div>

      {hasSelection && (
        <button
          onClick={handleContinue}
          className="text-button"
          style={{ marginTop: '1.6rem' }}
        >
          Continue
        </button>
      )}

      {!hasSelection && (
        <p className="hint-line">
          Pick at least one option, then press Enter or click Continue
        </p>
      )}
    </div>
  )
}
