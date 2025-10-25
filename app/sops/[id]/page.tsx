'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import PdfViewer from '@/components/PdfViewer'
import SignatureModal from '@/components/SignatureModal'
import { formatVersion } from '@/lib/versionHelpers'

interface Question {
  id: string
  question: string
  options: string
  correctAnswer: string
  order: number
}

interface Sop {
  id: string
  title: string
  description: string
  content: string
  pdfUrl?: string
  pdfFileName?: string
  category?: string
  version: string
  test?: {
    id: string
    title: string
    passingScore: number
    questions: Question[]
  }
}

export default function SopViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [sop, setSop] = useState<Sop | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTest, setShowTest] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text')
  const [userCompletedVersion, setUserCompletedVersion] = useState<string | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)

  useEffect(() => {
    fetchSop()
    fetchUserResults()
    markAsInProgress()
  }, [params.id])

  useEffect(() => {
    if (sop?.pdfUrl && !sop.content) {
      setActiveTab('pdf')
    }
  }, [sop])

  const fetchSop = async () => {
    try {
      const response = await fetch(`/api/sops/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSop(data)
      }
    } catch (error) {
      console.error('Error fetching SOP:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserResults = async () => {
    try {
      const response = await fetch('/api/results')
      if (response.ok) {
        const results = await response.json()
        // Find if user has completed this SOP before
        const completedResult = results.find(
          (r: any) => r.test?.sop?.id === params.id && r.passed
        )
        if (completedResult && completedResult.sopVersion) {
          setUserCompletedVersion(completedResult.sopVersion)
        }
      }
    } catch (error) {
      console.error('Error fetching user results:', error)
    }
  }

  const markAsInProgress = async () => {
    try {
      const assignmentsRes = await fetch('/api/sops')
      const assignments = await assignmentsRes.json()
      const assignment = assignments.find((a: any) => a.sop.id === params.id)
      
      if (assignment && assignment.status === 'PENDING') {
        await fetch(`/api/assignments/${assignment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'IN_PROGRESS' }),
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleStartTest = () => {
    setShowTest(true)
    setTestResult(null)
    setAnswers({})
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmitTest = async () => {
    if (!sop?.test) return

    const allAnswered = sop.test.questions.every((q) => answers[q.id])
    if (!allAnswered) {
      alert('Please answer all questions before submitting')
      return
    }

    setSubmitting(true)

    try {
      // Get the IDs of questions shown to the user
      const questionsShown = sop.test.questions.map(q => q.id)

      const response = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: sop.test.id,
          answers,
          questionsShown,
        }),
      })

      const result = await response.json()
      setTestResult(result)
      
      // If passed and requires signature, show signature modal
      if (result.passed && result.requiresSignature) {
        setAssignmentId(result.assignmentId)
        setShowSignatureModal(true)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSign = async (signature: string) => {
    try {
      const response = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          signature,
          agreedToDeclaration: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setShowSignatureModal(false)
        router.push('/dashboard')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit signature')
      }
    } catch (error: any) {
      throw error // Re-throw to be handled by SignatureModal
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading SOP...</p>
          </div>
        </div>
      </>
    )
  }

  if (!sop) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center card py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">SOP not found</h1>
            <button onClick={() => router.back()} className="btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </>
    )
  }

  const hasBothContentTypes = sop.content && sop.pdfUrl

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!showTest ? (
            /* SOP Content View */
            <div className="fade-in">
              <button
                onClick={() => router.back()}
                className="text-[#FF1E25] hover:text-[#E01B22] flex items-center mb-6 font-semibold transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              <div className="card-elevated mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{sop.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">{sop.description}</p>
                    <div className="flex items-center gap-3">
                      {sop.category && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                          📁 {sop.category}
                        </span>
                      )}
                      <span className="badge-current">
                        Current: {formatVersion(sop.version)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version Warning Banner */}
              {userCompletedVersion && userCompletedVersion !== sop.version && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-amber-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-2">New Version Available!</h3>
                      <p className="text-amber-800 mb-3">
                        You completed <span className="font-bold">{formatVersion(userCompletedVersion)}</span> of this SOP. 
                        This is the updated <span className="font-bold">{formatVersion(sop.version)}</span> - please review the changes and retake the competency test.
                      </p>
                      <p className="text-sm text-amber-700 italic">
                        All users are required to complete the latest version of each SOP for compliance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs for Text/PDF if both exist */}
              {hasBothContentTypes && (
                <div className="mb-6">
                  <div className="flex gap-2 bg-white rounded-2xl p-2 inline-flex">
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'text'
                          ? 'bg-[#FF1E25] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      📝 Text Content
                    </button>
                    <button
                      onClick={() => setActiveTab('pdf')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === 'pdf'
                          ? 'bg-[#FF1E25] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      📄 PDF Document
                    </button>
                  </div>
                </div>
              )}

              {/* Content Display */}
              {activeTab === 'pdf' && sop.pdfUrl ? (
                <PdfViewer sopId={sop.id} title={sop.pdfFileName || 'SOP Document'} />
              ) : (
                <div className="card mb-8">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {sop.content}
                    </div>
                  </div>
                </div>
              )}

              {sop.test && (
                <div className="card-elevated bg-gradient-to-br from-[#FF1E25] to-[#E01B22] text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-3">
                        Ready to test your knowledge? 🎯
                      </h3>
                      <p className="text-red-100 mb-2 text-lg">
                        Complete the competency test to demonstrate your understanding of this SOP.
                      </p>
                      <p className="text-red-100 text-sm">
                        Passing score: <span className="font-bold">{sop.test.passingScore}%</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={handleStartTest} className="bg-white text-[#FF1E25] px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 font-bold text-lg mt-6 shadow-lg">
                    Start Competency Test →
                  </button>
                </div>
              )}
            </div>
          ) : testResult ? (
            /* Test Results */
            <div className="card-elevated fade-in text-center">
              {testResult.passed ? (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {testResult.passed ? 'Congratulations! You Passed! 🎉' : 'Test Not Passed'}
              </h2>
              <div className="mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {testResult.score}%
                </div>
                <p className="text-lg text-gray-600">
                  Passing score: {testResult.passingScore}%
                </p>
              </div>
              <div className="inline-block bg-gray-50 rounded-2xl px-8 py-4 mb-8">
                <p className="text-2xl font-semibold text-gray-900">
                  {testResult.correctAnswers} <span className="text-gray-500">out of</span> {testResult.totalQuestions}
                </p>
                <p className="text-sm text-gray-600 mt-1">questions correct</p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                >
                  Back to Dashboard
                </button>
                {!testResult.passed && (
                  <button
                    onClick={() => {
                      setShowTest(false)
                      setTestResult(null)
                      setAnswers({})
                    }}
                    className="btn-secondary"
                  >
                    Review SOP Again
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Test Questions */
            <div className="fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{sop.test?.title}</h2>
                <p className="text-lg text-gray-600">
                  {sop.test && sop.test.passingScore === 100 
                    ? 'You must answer all questions correctly to pass (100% required)'
                    : `Answer all questions to complete the test. Passing score: ${sop.test?.passingScore}%`
                  }
                </p>
              </div>

              <div className="space-y-6">
                {sop.test?.questions.map((question, index) => {
                  const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options
                  const totalQuestions = sop.test?.questions.length || 0
                  return (
                    <div key={question.id} className="card-elevated">
                      <h3 className="text-xl font-bold text-gray-900 mb-5">
                        Question {index + 1} of {totalQuestions}
                      </h3>
                      <p className="text-lg text-gray-700 mb-6">{question.question}</p>
                      <div className="space-y-3">
                        {options.map((option: string, optionIndex: number) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                              answers[question.id] === option
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="mr-4 h-5 w-5 text-blue-600"
                            />
                            <span className="text-gray-800 font-medium">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-4 mt-8 sticky bottom-6">
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Test'
                  )}
                </button>
                <button
                  onClick={() => setShowTest(false)}
                  className="btn-secondary"
                >
                  Back to SOP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && sop && session?.user && (
        <SignatureModal
          type="user"
          userName={session.user.name}
          sopTitle={sop.title}
          sopVersion={sop.version}
          testScore={testResult?.score}
          onSign={handleSign}
          onCancel={() => {
            setShowSignatureModal(false)
            router.push('/dashboard')
          }}
        />
      )}
    </>
  )
}
