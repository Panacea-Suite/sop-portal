'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { formatVersion } from '@/lib/versionHelpers'

interface Question {
  id: string
  question: string
  options: string | string[]  // Can be JSON string or array
  correctAnswer: string
  order: number
}

interface TestResult {
  id: string
  score: number
  passed: boolean
  answers: string | Record<string, string>  // Can be JSON string or object
  sopVersion?: string
  questionsShown?: string[]
  attemptNumber?: number
  completedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  test: {
    id: string
    title: string
    passingScore: number
    sop: {
      id: string
      title: string
      category?: string
    }
    questions: Question[]
  }
}

export default function TestResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [params.id])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error fetching result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading test results...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!result) {
    return (
      <DashboardLayout>
        <div className="px-8 py-12">
          <div className="text-center card py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Result not found</h1>
            <button onClick={() => router.back()} className="btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // PostgreSQL returns JSON fields as objects, not strings
  const userAnswers = typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers
  
  // Filter to only show questions that were actually asked
  const questionsShownIds = result.questionsShown || result.test.questions.map(q => q.id)
  const questionsAsked = result.test.questions.filter(q => questionsShownIds.includes(q.id))
  const totalQuestionsInPool = result.test.questions.length
  
  const correctCount = questionsAsked.filter(q => userAnswers[q.id] === q.correctAnswer).length

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-8">
          <button
            onClick={() => router.back()}
            className="text-[#FF1E25] hover:text-[#E01B22] flex items-center mb-4 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Test Results</h1>
              <p className="text-gray-600">{result.user.name} - {result.test.sop.title}</p>
            </div>
            {result.passed ? (
              <span className="badge-passed text-base px-6 py-2">Passed ✓</span>
            ) : (
              <span className="badge-failed text-base px-6 py-2">Failed ✗</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Summary Card */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Staff Member</p>
              <p className="text-lg font-bold text-gray-900">{result.user.name}</p>
              <p className="text-sm text-gray-500">{result.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">SOP Version</p>
              <p className="text-lg font-bold text-gray-900">
                <span className="badge-version-completed">
                  {formatVersion(result.sopVersion || '1.0')}
                </span>
              </p>
              <p className="text-sm text-gray-500">Test completed on version {result.sopVersion || '1.0'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Score</p>
              <p className="text-4xl font-bold text-gray-900">{result.score}%</p>
              <p className="text-sm text-gray-500">Required: {result.test.passingScore}%</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Correct Answers</p>
              <p className="text-4xl font-bold text-emerald-600">{correctCount}</p>
              <p className="text-sm text-gray-500">Out of {questionsAsked.length}</p>
              {totalQuestionsInPool > questionsAsked.length && (
                <p className="text-xs text-blue-600 mt-1">({questionsAsked.length} of {totalQuestionsInPool} questions asked)</p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Completed</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(result.completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(result.completedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Questions Asked ({questionsAsked.length} of {totalQuestionsInPool} total)
          </h2>
          {totalQuestionsInPool > questionsAsked.length && (
            <p className="text-sm text-gray-600 mb-4 italic">
              This user was shown {questionsAsked.length} randomly selected questions from the question pool.
            </p>
          )}
          <div className="space-y-6">
            {questionsAsked.map((question, index) => {
              const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options
              const userAnswer = userAnswers[question.id]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <div 
                  key={question.id} 
                  className={`card ${isCorrect ? 'border-2 border-emerald-200 bg-emerald-50' : 'border-2 border-rose-200 bg-rose-50'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      Question {index + 1} of {questionsAsked.length}
                    </h3>
                    {isCorrect ? (
                      <div className="flex items-center space-x-2 text-emerald-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-bold">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-rose-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="font-bold">Incorrect</span>
                      </div>
                    )}
                  </div>

                  <p className="text-lg text-gray-800 mb-6 font-medium">{question.question}</p>

                  <div className="space-y-3">
                    {options.map((option: string, optionIndex: number) => {
                      const isUserAnswer = option === userAnswer
                      const isCorrectAnswer = option === question.correctAnswer
                      
                      let bgColor = 'bg-white border-gray-200'
                      let textColor = 'text-gray-700'
                      let borderWidth = 'border-2'
                      
                      if (isCorrectAnswer && isUserAnswer) {
                        // User's correct answer
                        bgColor = 'bg-emerald-100 border-emerald-500'
                        textColor = 'text-emerald-900'
                      } else if (isCorrectAnswer) {
                        // Correct answer (not selected)
                        bgColor = 'bg-emerald-50 border-emerald-300'
                        textColor = 'text-emerald-800'
                      } else if (isUserAnswer) {
                        // User's incorrect answer
                        bgColor = 'bg-rose-100 border-rose-500'
                        textColor = 'text-rose-900'
                      }

                      return (
                        <div
                          key={optionIndex}
                          className={`flex items-center p-4 ${borderWidth} ${bgColor} rounded-xl transition-all`}
                        >
                          <div className="flex items-center flex-1">
                            {isUserAnswer && (
                              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className={`font-medium ${textColor} ${isUserAnswer ? 'ml-0' : 'ml-8'}`}>
                              {option}
                            </span>
                          </div>
                          {isCorrectAnswer && (
                            <span className="ml-3 flex items-center text-emerald-700 font-bold text-sm">
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-3 text-rose-700 font-bold text-sm">
                              Selected by user
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="card mt-8 bg-gray-50">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Test Summary</h3>
            <div className="flex items-center justify-center space-x-8">
              <div>
                <p className="text-3xl font-bold text-emerald-600">{correctCount}</p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-600">{questionsAsked.length - correctCount}</p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{result.score}%</p>
                <p className="text-sm text-gray-600">Final Score</p>
              </div>
            </div>
            {result.attemptNumber && result.attemptNumber > 1 && (
              <p className="text-xs text-gray-500 mt-4">Attempt #{result.attemptNumber}</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}




