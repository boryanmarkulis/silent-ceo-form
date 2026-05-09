'use client'

import type { Question as QuestionType } from '@/lib/sections'
import QuestionText from './QuestionText'
import QuestionSingleChoice from './QuestionSingleChoice'
import QuestionMultiChoice from './QuestionMultiChoice'
import GlassStepCard from './GlassStepCard'
import ProgressBar from './ProgressBar'

interface QuestionProps {
  question: QuestionType
  questionNumber: number
  onAnswer: (value: string | string[]) => void
  onBack: () => void
  showBack: boolean
  totalQ: number
}

export default function Question({ question, questionNumber, onAnswer, onBack, showBack, totalQ }: QuestionProps) {
  function handleTextAnswer(value: string) {
    onAnswer(value)
  }

  function handleChoiceAnswer(value: string) {
    onAnswer(value)
  }

  function handleMultiAnswer(value: string[]) {
    onAnswer(value)
  }

  return (
    <main className="screen">
      {showBack && (
        <button
          onClick={onBack}
          className="back-button"
          aria-label="Go back"
        >
          ←
        </button>
      )}

      <GlassStepCard
        meta={`Question ${questionNumber.toString().padStart(2, '0')}`}
        title={question.text}
        hint={question.hint}
        footer={<ProgressBar currentQ={questionNumber - 1} totalQ={totalQ} />}
      >
        <section aria-label="Answer">
          {(question.type === 'text' || question.type === 'email' || question.type === 'url') && (
            <QuestionText question={question} onAnswer={handleTextAnswer} />
          )}
          {question.type === 'singleChoice' && (
            <QuestionSingleChoice question={question} onAnswer={handleChoiceAnswer} />
          )}
          {(question.type === 'multiChoice' || question.type === 'multiChoiceWithOther') && (
            <QuestionMultiChoice question={question} onAnswer={handleMultiAnswer} />
          )}
        </section>
      </GlassStepCard>
    </main>
  )
}
