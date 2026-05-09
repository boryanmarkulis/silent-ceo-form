'use client'

import { useEffect, useRef, useState } from 'react'
import type { Question } from '@/lib/sections'

interface QuestionTextProps {
  question: Question
  onAnswer: (value: string) => void
}

const TEXTAREA_IDS = ['numbers_where', 'ai_coo_first']

export default function QuestionText({ question, onAnswer }: QuestionTextProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isTextarea = TEXTAREA_IDS.includes(question.id)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTextarea) textareaRef.current?.focus()
      else inputRef.current?.focus()
    }, 500)
    return () => clearTimeout(timer)
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
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(val)) return 'Please enter a valid email address'
    }
    return ''
  }

  function handleSubmit() {
    const err = validate(value)
    if (err) { setError(err); return }
    setError('')
    onAnswer(value.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (isTextarea && e.shiftKey) return
      e.preventDefault()
      handleSubmit()
    }
  }

  const hintText = question.optional
    ? 'Optional - press Enter to skip'
    : 'Press Enter ↵ to continue'

  return (
    <div>
      {isTextarea ? (
        <textarea
          className="text-field"
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); autoResize(e.target) }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          rows={2}
          style={{ overflow: 'hidden' }}
        />
      ) : (
        <input
          className="text-field"
          ref={inputRef}
          type={question.type === 'email' ? 'email' : question.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
        />
      )}
      {error && (
        <p className="hint-line" style={{ color: 'var(--error)' }}>{error}</p>
      )}
      <p className="hint-line">{hintText}</p>
    </div>
  )
}
