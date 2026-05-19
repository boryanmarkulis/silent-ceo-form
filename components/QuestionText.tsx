'use client'

import { useEffect, useRef, useState } from 'react'
import type { Question } from '@/lib/sections'
import { isValidEmail } from '@/lib/validation'

interface QuestionTextProps {
  question: Question
  initialValue?: string
  onDraft: (value: string) => void
  onAnswer: (value: string) => void
}

const TEXTAREA_IDS = ['numbers_where', 'ai_coo_first']

export default function QuestionText({ question, initialValue = '', onDraft, onAnswer }: QuestionTextProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isTextarea = TEXTAREA_IDS.includes(question.id)

  useEffect(() => {
    const textarea = textareaRef.current
    const input = inputRef.current
    const timer = setTimeout(() => {
      const field = isTextarea ? textarea : input
      field?.focus()
      field?.scrollIntoView({ block: 'nearest' })
    }, 500)
    return () => {
      clearTimeout(timer)
      textarea?.blur()
      input?.blur()
    }
  }, [isTextarea])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    const lineHeight = 24
    const maxHeight = lineHeight * 4 + 24
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  function validate(val: string): string {
    if (!question.optional && question.validation === 'required' && val.trim() === '') {
      return 'Please enter a value'
    }
    if (question.validation === 'email' && val.trim() !== '') {
      if (!isValidEmail(val)) return 'Please enter a valid email address'
    }
    return ''
  }

  function handleSubmit() {
    const err = validate(value)
    if (err) { setError(err); return }
    setError('')
    onAnswer(value.trim())
  }

  function handleChange(nextValue: string) {
    setValue(nextValue)
    setError('')
    onDraft(nextValue)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (isTextarea && e.shiftKey) return
      e.preventDefault()
      handleSubmit()
    }
  }

  const hintText = 'Scroll ↓ to continue, ↑ to return'

  return (
    <div>
      {isTextarea ? (
        <textarea
          className="text-field"
          ref={textareaRef}
          value={value}
          onChange={e => { handleChange(e.target.value); autoResize(e.target) }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          rows={2}
          aria-invalid={Boolean(error)}
          style={{ overflowY: 'auto' }}
        />
      ) : (
        <input
          className="text-field"
          ref={inputRef}
          type={question.type === 'email' ? 'email' : question.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          aria-invalid={Boolean(error)}
        />
      )}
      {error && (
        <p className="hint-line" style={{ color: 'var(--error)' }}>{error}</p>
      )}
      <p className="hint-line">{hintText}</p>
    </div>
  )
}
