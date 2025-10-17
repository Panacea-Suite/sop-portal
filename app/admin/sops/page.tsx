'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import SopVersionHistory from '@/components/SopVersionHistory'
import { incrementVersion, formatVersion } from '@/lib/versionHelpers'

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
    questions: any[]
  }
  assignments: any[]
}

export default function SopsManagementPage() {
  const [sops, setSops] = useState<Sop[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [editingTestId, setEditingTestId] = useState<string | null>(null)
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null)
  const [selectedSopForTest, setSelectedSopForTest] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [changelog, setChangelog] = useState('')
  const [contentType, setContentType] = useState<'text' | 'pdf'>('text')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    pdfUrl: '',
    pdfFileName: '',
    category: '',
    version: '1.0',
  })
  
  const [testData, setTestData] = useState({
    title: '',
    passingScore: 100,
    questions: Array(9).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: '' })),
  })

  useEffect(() => {
    fetchSops()
  }, [])

  const fetchSops = async () => {
    try {
      const response = await fetch('/api/sops')
      const data = await response.json()
      setSops(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching SOPs:', error)
      setSops([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({
          ...formData,
          pdfUrl: data.url,
          pdfFileName: data.filename,
        })
        setUploadError('')
      } else {
        console.error('Upload failed:', data)
        setUploadError(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError('Network error: Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleAddSop = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate content based on selected type
    if (contentType === 'pdf' && !formData.pdfUrl) {
      alert('Please upload a PDF file')
      return
    }
    if (contentType === 'text' && !formData.content.trim()) {
      alert('Please enter text content')
      return
    }

    try {
      const response = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newSop = await response.json()
        setShowAddModal(false)
        setContentType('text')
        setFormData({
          title: '',
          description: '',
          content: '',
          pdfUrl: '',
          pdfFileName: '',
          category: '',
          version: '1.0',
        })
        fetchSops()
        
        if (confirm('SOP created! Would you like to add a competency test?')) {
          setSelectedSopForTest(newSop.id)
          setEditingTestId(null)
          setTestData({
            title: '',
            passingScore: 100,
            questions: Array(9).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: '' })),
          })
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

  const handleCreateNewVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSop) return

    if (!changelog.trim()) {
      alert('Please provide a changelog/reason for this update')
      return
    }

    // Validate content based on selected type
    if (contentType === 'pdf' && !formData.pdfUrl) {
      alert('Please upload a PDF file')
      return
    }
    if (contentType === 'text' && !formData.content.trim()) {
      alert('Please enter text content')
      return
    }

    try {
      const response = await fetch(`/api/sops/${selectedSop.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          changelog,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setShowEditModal(false)
        setSelectedSop(null)
        setChangelog('')
        setFormData({
          title: '',
          description: '',
          content: '',
          pdfUrl: '',
          pdfFileName: '',
          category: '',
          version: '1.0',
        })
        fetchSops()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create new version')
      }
    } catch (error) {
      console.error('Error creating new version:', error)
      alert('Failed to create new version')
    }
  }

  const openEditModal = (sop: Sop) => {
    setSelectedSop(sop)
    setUploadError('')
    setChangelog('')
    // Determine content type based on existing data
    setContentType(sop.pdfUrl ? 'pdf' : 'text')
    setFormData({
      title: sop.title,
      description: sop.description,
      content: sop.content,
      pdfUrl: sop.pdfUrl || '',
      pdfFileName: sop.pdfFileName || '',
      category: sop.category || '',
      version: incrementVersion(sop.version),
    })
    setShowEditModal(true)
  }


  const openEditTestModal = async (sop: Sop) => {
    if (!sop.test) return
    
    setSelectedSopForTest(sop.id)
    setEditingTestId(sop.test.id)
    
    // Fetch full test data
    try {
      const response = await fetch(`/api/tests/${sop.test.id}`)
      if (response.ok) {
        const testFullData = await response.json()
        setTestData({
          title: testFullData.title,
          passingScore: testFullData.passingScore,
          questions: testFullData.questions.map((q: any) => ({
            question: q.question,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctAnswer: q.correctAnswer,
          })),
        })
        setShowTestModal(true)
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      alert('Failed to load test data')
    }
  }

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate question count
    if (testData.questions.length < 9) {
      alert('Test must have at least 9 questions. Current: ' + testData.questions.length)
      return
    }

    if (testData.questions.length > 20) {
      alert('Test cannot have more than 20 questions. Current: ' + testData.questions.length)
      return
    }

    try {
      const url = editingTestId 
        ? `/api/tests/${editingTestId}`
        : '/api/tests'
      
      const method = editingTestId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sopId: selectedSopForTest,
          ...testData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.warning) {
          alert(`✅ Test saved successfully!\n\n⚠️ ${data.warning}`)
        }
        setShowTestModal(false)
        setSelectedSopForTest('')
        setEditingTestId(null)
        setTestData({
          title: '',
          passingScore: 100,
          questions: Array(9).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: '' })),
        })
        fetchSops()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${editingTestId ? 'update' : 'create'} test`)
      }
    } catch (error) {
      console.error('Error saving test:', error)
      alert('Failed to save test')
    }
  }

  const addQuestion = () => {
    if (testData.questions.length >= 20) {
      alert('Maximum 20 questions allowed per test')
      return
    }
    setTestData({
      ...testData,
      questions: [...testData.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }],
    })
  }

  const removeQuestion = (index: number) => {
    if (testData.questions.length <= 9) {
      alert('Test must have at least 9 questions')
      return
    }
    const newQuestions = testData.questions.filter((_, i) => i !== index)
    setTestData({ ...testData, questions: newQuestions })
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

  const handleDeleteSop = async (sopId: string, sopTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${sopTitle}"?\n\nThis will delete:\n- The SOP and all versions\n- All associated test questions\n- All assignments\n- All test results\n- All signatures\n\nThis action cannot be undone!`)) {
      return
    }

    try {
      const response = await fetch(`/api/sops/${sopId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        alert('✅ SOP deleted successfully')
        fetchSops()
      } else {
        const error = await response.json()
        console.error('Delete error:', error)
        alert(`Failed to delete SOP\n\n${error.details || error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting SOP:', error)
      alert('Failed to delete SOP. Check console for details.')
    }
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
            <p className="text-gray-600">Create, edit and manage standard operating procedures</p>
          </div>
          <button
            onClick={() => {
              setUploadError('')
              setContentType('text')
              setFormData({
                title: '',
                description: '',
                content: '',
                pdfUrl: '',
                pdfFileName: '',
                category: '',
                version: '1.0',
              })
              setShowAddModal(true)
            }}
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
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {sop.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {sop.category}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      v{sop.version}
                    </span>
                    {sop.pdfUrl && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        📄 PDF
                      </span>
                    )}
                    {sop.test ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        ✓ Has Test
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        ⚠️ No Test
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Assigned to {sop.assignments.length} staff
                    </div>
                    {!sop.test && (
                      <div className="mt-2 text-xs text-amber-700 italic">
                        ⚠️ Cannot be assigned until a test is created
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openEditModal(sop)}
                    className="btn-primary text-sm flex-1"
                  >
                    Edit SOP
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSop(sop)
                      setShowVersionHistory(true)
                    }}
                    className="btn-secondary text-sm flex-1"
                  >
                    Version History
                  </button>
                  {sop.test ? (
                    <button
                      onClick={() => openEditTestModal(sop)}
                      className="btn-secondary text-sm flex-1"
                    >
                      Edit Test
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSopForTest(sop.id)
                        setEditingTestId(null)
                        setTestData({
                          title: '',
                          passingScore: 100,
                          questions: Array(9).fill(null).map(() => ({ question: '', options: ['', '', '', ''], correctAnswer: '' })),
                        })
                        setShowTestModal(true)
                      }}
                      className="btn-small text-sm flex-1"
                    >
                      Add Test
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSop(sop.id, sop.title)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium mt-2 w-full text-center py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete SOP
                </button>
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
            <button 
              onClick={() => {
                setUploadError('')
                setFormData({
                  title: '',
                  description: '',
                  content: '',
                  pdfUrl: '',
                  pdfFileName: '',
                  category: '',
                  version: '1.0',
                })
                setShowAddModal(true)
              }} 
              className="btn-primary"
            >
              Create First SOP
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit SOP Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay overflow-y-auto" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <div className="modal-content max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {showEditModal ? 'Create New Version' : 'Create New SOP'}
            </h2>
            <form onSubmit={showEditModal ? handleCreateNewVersion : handleAddSop}>
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

                {/* Content Type Selection */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Choose Content Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={contentType === 'text'}
                        onChange={() => {
                          setContentType('text')
                          setFormData({ ...formData, pdfUrl: '', pdfFileName: '' })
                        }}
                        className="w-5 h-5 text-[#FF1E25] border-gray-300 focus:ring-[#FF1E25]"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        📝 Text Content
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={contentType === 'pdf'}
                        onChange={() => {
                          setContentType('pdf')
                          setFormData({ ...formData, content: '' })
                        }}
                        className="w-5 h-5 text-[#FF1E25] border-gray-300 focus:ring-[#FF1E25]"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        📄 PDF Upload
                      </span>
                    </label>
                  </div>
                </div>

                {/* PDF Upload Section - Only shown if PDF selected */}
                {contentType === 'pdf' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF Document Upload
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a PDF file that users can view and download.
                    </p>
                  
                  {uploadError && (
                    <div className="bg-rose-100 border-2 border-rose-300 rounded-xl p-4 mb-4">
                      <p className="text-sm font-semibold text-rose-700">{uploadError}</p>
                    </div>
                  )}
                  
                  {formData.pdfUrl ? (
                    <div className="bg-white rounded-xl p-4 border-2 border-emerald-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-semibold text-gray-900">{formData.pdfFileName}</p>
                            <p className="text-xs text-emerald-600">PDF uploaded successfully ✓</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, pdfUrl: '', pdfFileName: '' })
                            setUploadError('')
                          }}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className={`cursor-pointer inline-flex items-center px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 transition-colors bg-white ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm font-semibold text-blue-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">
                              Upload PDF (Max 10MB)
                            </span>
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Supported: PDF files only</p>
                    </div>
                  )}
                  </div>
                )}

                {/* Text Content Section - Only shown if Text selected */}
                {contentType === 'text' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Content
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
                )}
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
                    {showEditModal ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedSop?.version || ''}
                          className="input-field bg-gray-50"
                          disabled
                        />
                        <span className="text-gray-500">→</span>
                        <input
                          type="text"
                          value={formData.version}
                          className="input-field bg-emerald-50 font-bold text-emerald-700"
                          disabled
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="input-field"
                        placeholder="1.0"
                      />
                    )}
                  </div>
                </div>
                {showEditModal && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Changelog / Reason for Update <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={changelog}
                      onChange={(e) => setChangelog(e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Describe what changed in this version..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Explain what changes were made and why. This will be visible in version history.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-8">
                <button type="submit" className="btn-primary flex-1">
                  {showEditModal ? 'Save as New Version' : 'Create SOP'}
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setShowAddModal(false); 
                    setShowEditModal(false); 
                    setUploadError('');
                    setChangelog('');
                    setContentType('text');
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

      {/* Add/Edit Test Modal */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200 z-10">
              {editingTestId ? 'Edit Competency Test' : 'Create Competency Test'}
            </h2>
            <form onSubmit={handleSaveTest}>
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
                      <div key={qIndex} className="card bg-gray-50 relative">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Question {qIndex + 1}</h4>
                          {testData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-red-600 hover:text-red-700 text-sm font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
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
              <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-200 -mx-8 px-8 mt-8">
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingTestId ? 'Update Test' : 'Create Test'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestModal(false)
                      setSelectedSopForTest('')
                      setEditingTestId(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedSop && (
        <SopVersionHistory
          sopId={selectedSop.id}
          sopTitle={selectedSop.title}
          currentVersion={selectedSop.version}
          onClose={() => {
            setShowVersionHistory(false)
            setSelectedSop(null)
          }}
          onVersionRestored={() => {
            fetchSops()
          }}
        />
      )}
    </DashboardLayout>
  )
}
