'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Sop {
  id: string
  title: string
  description: string
  content: string
  category?: string
  version: string
  test?: {
    id: string
    title: string
  }
  assignments: any[]
}

export default function SopsManagementPage() {
  const router = useRouter()
  const [sops, setSops] = useState<Sop[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedSopForTest, setSelectedSopForTest] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    version: '1.0',
  })
  const [testData, setTestData] = useState({
    title: '',
    passingScore: 80,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }],
  })

  useEffect(() => {
    fetchSops()
  }, [])

  const fetchSops = async () => {
    try {
      const response = await fetch('/api/sops')
      const data = await response.json()
      setSops(data)
    } catch (error) {
      console.error('Error fetching SOPs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSop = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newSop = await response.json()
        setShowAddModal(false)
        setFormData({
          title: '',
          description: '',
          content: '',
          category: '',
          version: '1.0',
        })
        fetchSops()
        
        if (confirm('SOP created! Would you like to add a competency test?')) {
          setSelectedSopForTest(newSop.id)
          setShowTestModal(true)
        }
      } else {
        alert('Failed to create SOP')
      }
    } catch (error) {
      console.error('Error creating SOP:', error)
      alert('Failed to create SOP')
    }
  }

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sopId: selectedSopForTest,
          ...testData,
        }),
      })

      if (response.ok) {
        setShowTestModal(false)
        setSelectedSopForTest('')
        setTestData({
          title: '',
          passingScore: 80,
          questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }],
        })
        fetchSops()
      } else {
        alert('Failed to create test')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Failed to create test')
    }
  }

  const addQuestion = () => {
    setTestData({
      ...testData,
      questions: [...testData.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }],
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...testData.questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setTestData({ ...testData, questions: newQuestions })
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...testData.questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setTestData({ ...testData, questions: newQuestions })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading SOPs...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SOP Management</h1>
            <p className="text-gray-600">Create and manage standard operating procedures</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New SOP
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        {sops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sops.map((sop) => (
              <div key={sop.id} className="card group hover:scale-105 transition-all duration-300">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF1E25] transition-colors">
                    {sop.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sop.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sop.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {sop.category}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      v{sop.version}
                    </span>
                    {sop.test && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        ✓ Has Test
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Assigned to {sop.assignments.length} staff
                </div>
                <div className="flex gap-2">
                  {!sop.test && (
                    <button
                      onClick={() => {
                        setSelectedSopForTest(sop.id)
                        setShowTestModal(true)
                      }}
                      className="btn-secondary text-sm flex-1"
                    >
                      Add Test
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No SOPs yet</h3>
            <p className="text-gray-600 mb-6">Create your first SOP to get started</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Create First SOP
            </button>
          </div>
        )}
      </div>

      {/* Add SOP Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New SOP</h2>
            <form onSubmit={handleAddSop}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Workplace Safety Procedures"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Brief overview of the SOP"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={10}
                    required
                    placeholder="Enter the detailed SOP content here..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Safety, Operations"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="input-field"
                      placeholder="1.0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="submit" className="btn-primary flex-1">
                  Create SOP
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {showTestModal && (
        <div className="modal-overlay overflow-y-auto" onClick={() => setShowTestModal(false)}>
          <div className="modal-content max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Competency Test</h2>
            <form onSubmit={handleAddTest}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Test Title
                    </label>
                    <input
                      type="text"
                      value={testData.title}
                      onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Safety Knowledge Test"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={testData.passingScore}
                      onChange={(e) => setTestData({ ...testData, passingScore: parseInt(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Questions</h3>
                  <div className="space-y-4">
                    {testData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="card bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-3">Question {qIndex + 1}</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="input-field"
                            placeholder="Enter question"
                            required
                          />
                          {question.options.map((option, oIndex) => (
                            <input
                              key={oIndex}
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="input-field"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          ))}
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            className="input-field"
                            required
                          >
                            <option value="">Select correct answer...</option>
                            {question.options.map((option, oIndex) => (
                              option && <option key={oIndex} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-secondary w-full mt-4"
                  >
                    + Add Question
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="submit" className="btn-primary flex-1">
                  Create Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false)
                    setSelectedSopForTest('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}




