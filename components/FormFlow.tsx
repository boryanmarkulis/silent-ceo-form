'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Opener from './Opener'
import SectionBreak from './SectionBreak'
import Question from './Question'
import ClaimCard from './ClaimCard'
import ForestVideoBackdrop from './ForestVideoBackdrop'
import AmbientMusic from './AmbientMusic'
import { section1Questions, section2, section3, section4, allQuestions } from '@/lib/sections'
import type { Question as QuestionType } from '@/lib/sections'
import { isValidEmail } from '@/lib/validation'

type Step =
  | { kind: 'opener' }
  | { kind: 'question'; question: QuestionType }
  | { kind: 'break'; heading: string; subhead: string }
  | { kind: 'claim' }

function buildSteps(): Step[] {
  return [
    { kind: 'opener' },
    ...section1Questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'break', heading: section2.breakHeading, subhead: section2.breakSubhead },
    ...section2.questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'break', heading: section3.breakHeading, subhead: section3.breakSubhead },
    ...section3.questions.map(q => ({ kind: 'question' as const, question: q })),
    ...section4.questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'claim' },
  ]
}

const STEPS = buildSteps()
const TOTAL_QUESTIONS = allQuestions.length
const TYPING_QUESTION_TYPES = new Set<QuestionType['type']>(['text', 'email', 'url'])

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function hasQuestionAnswer(question: QuestionType, value: string | string[] | undefined): boolean {
  if (question.optional && (value === undefined || (typeof value === 'string' && value.trim() === ''))) {
    return true
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim()
  if (!question.optional && question.validation === 'required' && trimmed === '') {
    return false
  }

  if (question.validation === 'email' && trimmed !== '') {
    return isValidEmail(trimmed)
  }

  return trimmed !== '' || Boolean(question.optional)
}

function countAnsweredQuestions(stepIndex: number): number {
  let count = 0
  for (let i = 0; i < stepIndex && i < STEPS.length; i++) {
    const step = STEPS[i]
    if (step.kind === 'question') count++
  }
  return count
}

export default function FormFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const currentStepRef = useRef(0)
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [refParam, setRefParam] = useState('')
  const [sessionId, setSessionId] = useState('')
  const sessionIdRef = useRef('')
  const [recordId, setRecordId] = useState<string | null>(null)
  const recordIdRef = useRef<string | null>(null)
  const savePromiseRef = useRef<Promise<string | null> | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | null>(null)
  const [completed, setCompleted] = useState(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRefParam(params.get('ref') ?? '')
    const nextSessionId = createSessionId()
    sessionIdRef.current = nextSessionId
    setSessionId(nextSessionId)
  }, [])

  currentStepRef.current = currentStep
  const safeCurrentStep = Math.min(currentStep, STEPS.length - 1)
  const step = STEPS[safeCurrentStep]
  const completedQ = countAnsweredQuestions(safeCurrentStep)

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      setCurrentStep(STEPS.length - 1)
    }
  }, [currentStep])

  useEffect(() => {
    if (!isTransitioning) return
    const timer = setTimeout(() => {
      setIsTransitioning(false)
      setTransitionDirection(null)
    }, 720)
    return () => clearTimeout(timer)
  }, [isTransitioning])

  useEffect(() => {
    const activeStep = STEPS[safeCurrentStep]
    const acceptsTyping = activeStep.kind === 'question' && TYPING_QUESTION_TYPES.has(activeStep.question.type)

    if (!acceptsTyping && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }, [safeCurrentStep])

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const visualViewport = viewport

    function syncKeyboardViewport() {
      const activeElement = document.activeElement
      const typingElement = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement
      const keyboardOpen = typingElement && visualViewport.height < window.innerHeight - 80

      document.documentElement.style.setProperty(
        '--visual-viewport-height',
        `${visualViewport.height}px`,
      )
      document.documentElement.style.setProperty(
        '--visual-viewport-offset-top',
        `${visualViewport.offsetTop}px`,
      )
      document.documentElement.classList.toggle('keyboard-open', keyboardOpen)
    }

    syncKeyboardViewport()
    visualViewport.addEventListener('resize', syncKeyboardViewport)
    visualViewport.addEventListener('scroll', syncKeyboardViewport)
    window.addEventListener('focusin', syncKeyboardViewport)
    window.addEventListener('focusout', syncKeyboardViewport)

    return () => {
      visualViewport.removeEventListener('resize', syncKeyboardViewport)
      visualViewport.removeEventListener('scroll', syncKeyboardViewport)
      window.removeEventListener('focusin', syncKeyboardViewport)
      window.removeEventListener('focusout', syncKeyboardViewport)
      document.documentElement.classList.remove('keyboard-open')
      document.documentElement.style.removeProperty('--visual-viewport-height')
      document.documentElement.style.removeProperty('--visual-viewport-offset-top')
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const inTextField = document.activeElement instanceof HTMLInputElement
        || document.activeElement instanceof HTMLTextAreaElement

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        if (inTextField && event.key === 'ArrowLeft') return
        event.preventDefault()
        handleBack()
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (inTextField && event.key === 'ArrowRight') return
        event.preventDefault()
        const activeStep = STEPS[Math.min(currentStep, STEPS.length - 1)]
        if (activeStep.kind === 'question') {
          const q = activeStep.question
          if (!hasQuestionAnswer(q, formData[q.id])) return
        }
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData])

  useEffect(() => {
    function canScrollInsideCard(target: EventTarget | null, deltaY: number) {
      if (!(target instanceof Element)) return false
      const scrollable = target.closest('.glass-card-body')
      if (!(scrollable instanceof HTMLElement)) return false
      const hasOverflow = scrollable.scrollHeight > scrollable.clientHeight + 1
      if (!hasOverflow) return false
      if (deltaY > 0) {
        return scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1
      }
      return scrollable.scrollTop > 1
    }

    function advanceFromScroll(deltaY: number, target: EventTarget | null) {
      if (Math.abs(deltaY) < 36 || isTransitioning || canScrollInsideCard(target, deltaY)) {
        return
      }

      if (deltaY < 0) {
        if (!completedRef.current) handleBack()
        return
      }

      const activeStep = STEPS[safeCurrentStep]
      if (activeStep.kind === 'question') {
        const q = activeStep.question
        if (!hasQuestionAnswer(q, formData[q.id])) return
        handleNext()
      } else {
        handleNext()
      }
    }

    function handleWheel(event: WheelEvent) {
      advanceFromScroll(event.deltaY, event.target)
    }

    let touchStartY = 0
    let touchStartX = 0
    let touchTarget: EventTarget | null = null

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0]
      if (!touch) return

      touchStartY = touch.clientY
      touchStartX = touch.clientX
      touchTarget = event.target
    }

    function handleTouchEnd(event: TouchEvent) {
      const touch = event.changedTouches[0]
      if (!touch) return

      const deltaY = touchStartY - touch.clientY
      const deltaX = touchStartX - touch.clientX
      if (Math.abs(deltaY) < 48 || Math.abs(deltaY) < Math.abs(deltaX) * 1.2) {
        return
      }

      advanceFromScroll(deltaY, touchTarget)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCurrentStep, isTransitioning, formData])

  function handleNext(value?: string | string[]) {
    const currentStepData = STEPS[safeCurrentStep]
    const updatedData = currentStepData.kind === 'question' && value !== undefined
      ? { ...formData, [currentStepData.question.id]: value }
      : formData

    if (currentStepData.kind === 'question') {
      const answer = value ?? formData[currentStepData.question.id]
      if (!hasQuestionAnswer(currentStepData.question, answer)) return
      if (value !== undefined) {
        setFormData(updatedData)
      }
    }

    const nextIndex = safeCurrentStep + 1
    if (nextIndex >= STEPS.length) return

    if (currentStepData.kind === 'question') {
      void saveProgress(updatedData)
    }

    setTransitionDirection('forward')
    setIsTransitioning(true)
    setCurrentStep(nextIndex)
  }

  function handleBack() {
    if (completedRef.current || currentStepRef.current <= 0) return
    setTransitionDirection('backward')
    setIsTransitioning(true)
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  function handleComplete() {
    completedRef.current = true
    setCompleted(true)
  }

  function handleDraft(questionId: string, value: string | string[]) {
    setFormData(prev => ({ ...prev, [questionId]: value }))
  }

  function ensureSessionId() {
    if (!sessionIdRef.current) {
      const nextSessionId = createSessionId()
      sessionIdRef.current = nextSessionId
      setSessionId(nextSessionId)
    }
    return sessionIdRef.current
  }

  async function saveProgress(data: Record<string, string | string[]>) {
    const previousSave = savePromiseRef.current
    const savePromise = (async () => {
      if (previousSave) {
        await previousSave.catch(() => null)
      }

      const payload = {
        ...data,
        ref: refParam,
        session_id: ensureSessionId(),
        claimed: false,
      }

      if (!recordIdRef.current) {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!json.ok) {
          throw new Error(json.error ?? 'Save failed')
        }
        const nextRecordId = typeof json.record_id === 'string' ? json.record_id : null
        recordIdRef.current = nextRecordId
        setRecordId(nextRecordId)
        return nextRecordId
      }

      const currentRecordId = recordIdRef.current
      const res = await fetch('/api/save', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          record_id: currentRecordId,
        }),
      })
      const json = await res.json()
      if (!json.ok) {
        throw new Error(json.error ?? 'Save failed')
      }
      return currentRecordId
    })()

    savePromiseRef.current = savePromise

    try {
      return await savePromise
    } catch (err) {
      console.error(err)
      return recordIdRef.current
    } finally {
      if (savePromiseRef.current === savePromise) {
        savePromiseRef.current = null
      }
    }
  }

  async function waitForRecordId() {
    if (savePromiseRef.current) {
      return savePromiseRef.current.catch(err => {
        console.error(err)
        return recordIdRef.current
      })
    }
    return recordIdRef.current
  }

  const currentQuestionStep = step.kind === 'question'
  const questionIndex = currentQuestionStep
    ? allQuestions.findIndex(q => q.id === (step as { kind: 'question'; question: QuestionType }).question.id)
    : -1

  return (
    <div className="forest-shell">
      <ForestVideoBackdrop
        transitionDirection={transitionDirection}
      />
      <AmbientMusic />

      <AnimatePresence mode="wait">
        <motion.div
          key={safeCurrentStep}
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          {step.kind === 'opener' && (
            <Opener
              onBegin={() => handleNext()}
              currentQ={completedQ}
              totalQ={TOTAL_QUESTIONS}
            />
          )}

          {step.kind === 'break' && (
            <SectionBreak
              heading={step.heading}
              subhead={step.subhead}
              onContinue={() => handleNext()}
              currentQ={completedQ}
              totalQ={TOTAL_QUESTIONS}
            />
          )}

          {step.kind === 'question' && (
            <Question
              question={step.question}
              questionNumber={questionIndex + 1}
              answer={formData[step.question.id]}
              onDraft={value => handleDraft(step.question.id, value)}
              onAnswer={value => handleNext(value)}
              totalQ={TOTAL_QUESTIONS}
              onBack={safeCurrentStep > 0 ? handleBack : undefined}
            />
          )}

          {step.kind === 'claim' && (
            <ClaimCard
              formData={formData}
              refParam={refParam}
              sessionId={sessionId || sessionIdRef.current}
              recordId={recordId}
              waitForRecordId={waitForRecordId}
              onBack={safeCurrentStep > 0 ? handleBack : undefined}
              onComplete={handleComplete}
              currentQ={TOTAL_QUESTIONS}
              totalQ={TOTAL_QUESTIONS}
            />
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
