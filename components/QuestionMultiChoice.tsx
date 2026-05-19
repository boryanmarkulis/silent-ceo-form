'use client'

import { useEffect, useRef, useState } from 'react'
import type { Question } from '@/lib/sections'

interface QuestionMultiChoiceProps {
  question: Question
  initialValue?: string[]
  onDraft: (value: string[]) => void
  onAnswer: (value: string[]) => void
}

export default function QuestionMultiChoice({ question, initialValue = [], onDraft, onAnswer }: QuestionMultiChoiceProps) {
  const initialOther = initialValue.find(value => value === 'other' || value.startsWith('other:'))
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialValue.filter(value => value !== 'other' && !value.startsWith('other:')))
  )
  const [otherChecked, setOtherChecked] = useState(Boolean(initialOther))
  const [otherText, setOtherText] = useState(initialOther?.startsWith('other:') ? initialOther.slice(6) : '')
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
      onDraft(buildResult(next, otherChecked, otherText))
      return next
    })
  }

  function buildResult(selectedValues = selected, includeOther = otherChecked, otherValue = otherText) {
    const result = Array.from(selectedValues)
    if (includeOther && otherValue.trim()) {
      result.push(`other:${otherValue.trim()}`)
    } else if (includeOther) {
      result.push('other')
    }
    return result
  }

  function handleOtherCheckedChange() {
    setOtherChecked(prev => {
      const next = !prev
      onDraft(buildResult(selected, next, otherText))
      return next
    })
  }

  function handleOtherTextChange(value: string) {
    setOtherText(value)
    onDraft(buildResult(selected, otherChecked, value))
  }

  function handleContinue() {
    const result = buildResult()
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
            onChange={handleOtherCheckedChange}
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
            onChange={e => handleOtherTextChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (hasSelection) handleContinue() } }}
            placeholder="Please specify..."
          />
        )}
      </div>

      <p className="hint-line">
        {hasSelection ? 'Scroll ↓ to continue, ↑ to return' : 'Pick at least one option, then scroll ↓ to continue, ↑ to return'}
      </p>
    </div>
  )
}
