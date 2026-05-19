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
  answer?: string | string[]
  onDraft: (value: string | string[]) => void
  onAnswer: (value: string | string[]) => void
  totalQ: number
  onBack?: () => void
}

export default function Question({ question, questionNumber, answer, onDraft, onAnswer, totalQ, onBack }: QuestionProps) {
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
      <GlassStepCard
        title={question.text}
        hint={question.hint}
        footer={<ProgressBar currentQ={questionNumber} totalQ={totalQ} />}
        onBack={onBack}
      >
        <section aria-label="Answer">
          {(question.type === 'text' || question.type === 'email' || question.type === 'url') && (
            <QuestionText
              question={question}
              initialValue={typeof answer === 'string' ? answer : ''}
              onDraft={value => onDraft(value)}
              onAnswer={handleTextAnswer}
            />
          )}
          {question.type === 'singleChoice' && (
            <QuestionSingleChoice
              question={question}
              initialValue={typeof answer === 'string' ? answer : ''}
              onAnswer={handleChoiceAnswer}
            />
          )}
          {(question.type === 'multiChoice' || question.type === 'multiChoiceWithOther') && (
            <QuestionMultiChoice
              question={question}
              initialValue={Array.isArray(answer) ? answer : []}
              onDraft={value => onDraft(value)}
              onAnswer={handleMultiAnswer}
            />
          )}
        </section>
      </GlassStepCard>
    </main>
  )
}
