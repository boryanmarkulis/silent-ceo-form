'use client'

import { useEffect, useState } from 'react'
import type { Question } from '@/lib/sections'

interface QuestionSingleChoiceProps {
  question: Question
  initialValue?: string
  onAnswer: (value: string) => void
}

export default function QuestionSingleChoice({ question, initialValue = '', onAnswer }: QuestionSingleChoiceProps) {
  const options = question.options ?? []
  const initialSelected = options.findIndex(option => option.value === initialValue)
  const [selected, setSelected] = useState<number>(initialSelected)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const idx = parseInt(e.key) - 1
      if (!isNaN(idx) && idx >= 0 && idx < options.length) {
        onAnswer(options[idx].value)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(s => Math.min(s + 1, options.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(s => Math.max(s - 1, 0))
      } else if (e.key === 'Enter' && selected >= 0) {
        onAnswer(options[selected].value)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [options, selected, onAnswer])

  return (
    <div className="choice-list">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onAnswer(opt.value)}
          onMouseEnter={() => setSelected(i)}
          className={`choice-card ${selected === i ? 'is-active' : ''}`}
        >
          <span className="choice-index">{i + 1}</span>
          <span className="choice-label">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
