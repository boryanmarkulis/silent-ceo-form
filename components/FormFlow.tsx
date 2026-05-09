'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Opener from './Opener'
import SectionBreak from './SectionBreak'
import Question from './Question'
import Closing from './Closing'
import ForestVideoBackdrop from './ForestVideoBackdrop'
import { section1Questions, section2, section3, section4, allQuestions } from '@/lib/sections'
import type { Question as QuestionType } from '@/lib/sections'

type Step =
  | { kind: 'opener' }
  | { kind: 'question'; question: QuestionType }
  | { kind: 'break'; heading: string; subhead: string }
  | { kind: 'closing' }

function buildSteps(): Step[] {
  return [
    { kind: 'opener' },
    ...section1Questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'break', heading: section2.breakHeading, subhead: section2.breakSubhead },
    ...section2.questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'break', heading: section3.breakHeading, subhead: section3.breakSubhead },
    ...section3.questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'break', heading: section4.breakHeading, subhead: section4.breakSubhead },
    ...section4.questions.map(q => ({ kind: 'question' as const, question: q })),
    { kind: 'closing' },
  ]
}

const STEPS = buildSteps()
const TOTAL_QUESTIONS = allQuestions.length // 15

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
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [refParam, setRefParam] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRefParam(params.get('ref') ?? '')
  }, [])

  const step = STEPS[currentStep]
  const completedQ = countAnsweredQuestions(currentStep)

  useEffect(() => {
    if (!isTransitioning) return
    const timer = setTimeout(() => setIsTransitioning(false), 720)
    return () => clearTimeout(timer)
  }, [isTransitioning])

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

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < 36 || isTransitioning || canScrollInsideCard(event.target, event.deltaY)) {
        return
      }

      const activeStep = STEPS[currentStep]
      if (activeStep.kind === 'question') return

      if (event.deltaY > 0) {
        handleNext()
      } else {
        handleBack()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, isTransitioning])

  function handleNext(value?: string | string[]) {
    const currentStepData = STEPS[currentStep]
    if (currentStepData.kind === 'question' && value !== undefined) {
      setFormData(prev => ({ ...prev, [currentStepData.question.id]: value }))
    }

    const nextIndex = currentStep + 1
    if (nextIndex >= STEPS.length) return

    // When advancing past the last question (email) to closing, trigger submit
    if (STEPS[nextIndex].kind === 'closing') {
      const updatedData = currentStepData.kind === 'question' && value !== undefined
        ? { ...formData, [currentStepData.question.id]: value }
        : formData
      triggerSubmit(updatedData)
    }

    setIsTransitioning(true)
    setCurrentStep(nextIndex)
  }

  function handleBack() {
    if (currentStep <= 0) return
    setIsTransitioning(true)
    setCurrentStep(prev => prev - 1)
  }

  async function triggerSubmit(data: Record<string, string | string[]>) {
    try {
      setSubmitError('')
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ref: refParam }),
      })
      const json = await res.json()
      if (!json.ok) {
        setSubmitError(json.error ?? 'Submission failed')
      }
    } catch {
      setSubmitError('Submission failed')
    }
  }

  function handleRetry() {
    triggerSubmit({ ...formData, ref: refParam })
  }

  const currentQuestionStep = step.kind === 'question'
  const questionIndex = currentQuestionStep
    ? allQuestions.findIndex(q => q.id === (step as { kind: 'question'; question: QuestionType }).question.id)
    : -1

  return (
    <div className="forest-shell">
      <ForestVideoBackdrop
        currentStep={currentStep}
        totalSteps={STEPS.length}
        isTransitioning={isTransitioning}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
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
              onAnswer={value => handleNext(value)}
              onBack={handleBack}
              showBack={currentStep > 0}
              totalQ={TOTAL_QUESTIONS}
            />
          )}

          {step.kind === 'closing' && (
            <Closing
              email={typeof formData.email === 'string' ? formData.email : ''}
              submitError={submitError}
              onRetry={handleRetry}
              currentQ={TOTAL_QUESTIONS}
              totalQ={TOTAL_QUESTIONS}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
