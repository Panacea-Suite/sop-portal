'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import { formatVersion } from '@/lib/versionHelpers'

interface User {
  id: string
  name: string
  email: string
  role: string
  assignments: any[]
  testResults: any[]
}

export default function StaffDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sops, setSops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedSopIds, setSelectedSopIds] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [usersRes, sopsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/sops')
      ])

      const users = await usersRes.json()
      const sopsData = await sopsRes.json()

      const currentUser = users.find((u: User) => u.id === params.id)
      setUser(currentUser)
      setSops(sopsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignatureStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_USER_SIGNATURE':
        return <span className="badge-awaiting-signature">Awaiting User</span>
      case 'AWAITING_ADMIN_SIGNATURE':
        return <span className="badge-awaiting-signature">Awaiting Admin</span>
      case 'COMPLETED':
        return <span className="badge-fully-signed">Fully Signed</span>
      default:
        return <span className="text-xs text-gray-500">Not Required</span>
    }
  }

  const handleAssignSops = async () => {
    if (selectedSopIds.length === 0) return

    setAssigning(true)

    try {
      const response = await fetch('/api/assignments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: params.id,
          sopIds: selectedSopIds,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.successCount > 0) {
          alert(`✅ Successfully assigned ${data.successCount} SOP(s)${data.failedCount > 0 ? `\n\n⚠️ ${data.failedCount} failed:\n${data.errors.join('\n')}` : ''}\n\n📧 Assignment notification email sent to user.`)
        } else {
          alert(`Failed to assign SOPs:\n${data.errors.join('\n')}`)
        }

        setShowAssignModal(false)
        setSelectedSopIds([])
        fetchData()
      } else {
        alert(data.error || 'Failed to assign SOPs')
      }
    } catch (error) {
      console.error('Error assigning SOPs:', error)
      alert('Failed to assign SOPs')
    } finally {
      setAssigning(false)
    }
  }

  const toggleSopSelection = (sopId: string) => {
    setSelectedSopIds(prev =>
      prev.includes(sopId)
        ? prev.filter(id => id !== sopId)
        : [...prev, sopId]
    )
  }

  const selectAllSops = () => {
    setSelectedSopIds(availableSops.map(sop => sop.id))
  }

  const deselectAllSops = () => {
    setSelectedSopIds([])
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="px-8 py-12">
          <div className="text-center card py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
            <button onClick={() => router.back()} className="btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const assignedSopIds = user.assignments.map(a => a.sop.id)
  // Only show SOPs that have a competency test with at least 9 questions and are not already assigned
  const availableSops = sops.filter(sop => 
    !assignedSopIds.includes(sop.id) && 
    sop.test && 
    sop.test.questions && 
    sop.test.questions.length >= 9
  )

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
            Back to Staff List
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-3">{user.email}</p>
              <span className={`${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Assign SOP
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Assignments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned SOPs</h2>
          {user.assignments.length > 0 ? (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="table-header">SOP Title</th>
                      <th className="table-header">Version</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Signature Status</th>
                      <th className="table-header">Assigned Date</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.assignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="font-semibold text-gray-900">
                            {assignment.sop.title}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="badge-version">
                            {formatVersion(assignment.sop.version)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge-${assignment.status.toLowerCase().replace('_', '-')}`}>
                            {assignment.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="table-cell">
                          {getSignatureStatusBadge(assignment.status)}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600 text-sm">
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600 text-sm">
                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {assignment.status === 'COMPLETED' ? (
                            <Link
                              href={`/admin/signatures/${assignment.id}`}
                              className="link-primary inline-flex items-center text-sm"
                            >
                              View Signatures
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          ) : assignment.status === 'AWAITING_ADMIN_SIGNATURE' ? (
                            <Link
                              href="/admin/countersign"
                              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                            >
                              Counter-Sign →
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600">No SOPs assigned yet</p>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h2>
          {user.testResults.length > 0 ? (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="table-header">SOP Title</th>
                      <th className="table-header">Version</th>
                      <th className="table-header">Test Name</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Result</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.testResults.map((result: any) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="font-semibold text-gray-900">
                            {result.test?.sop?.title || 'N/A'}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="badge-version-completed">
                            {formatVersion(result.sopVersion || '1.0')}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="text-gray-900">{result.test?.title || 'N/A'}</div>
                        </td>
                        <td className="table-cell">
                          <div className="text-2xl font-bold text-gray-900">
                            {result.score}%
                          </div>
                        </td>
                        <td className="table-cell">
                          {result.passed ? (
                            <span className="badge-passed">Passed</span>
                          ) : (
                            <span className="badge-failed">Failed</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600 text-sm">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="table-cell">
                          <Link
                            href={`/admin/results/${result.id}`}
                            className="link-primary inline-flex items-center"
                          >
                            View Details
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600">No test results yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign SOP Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign SOPs to {user?.name}</h2>
            
            {availableSops.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select SOPs to Assign ({selectedSopIds.length} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllSops}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAllSops}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-xl max-h-96 overflow-y-auto">
                    {availableSops.map((sop) => (
                      <label
                        key={sop.id}
                        className={`flex items-start p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          selectedSopIds.includes(sop.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSopIds.includes(sop.id)}
                          onChange={() => toggleSopSelection(sop.id)}
                          className="mt-1 w-5 h-5 text-[#FF1E25] border-gray-300 rounded focus:ring-[#FF1E25] cursor-pointer"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-semibold text-gray-900">{sop.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{sop.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {sop.category && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {sop.category}
                              </span>
                            )}
                            <span className="badge-version text-xs">
                              {formatVersion(sop.version)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              ✓ Has Test
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {selectedSopIds.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedSopIds.length} SOP{selectedSopIds.length > 1 ? 's' : ''} will be assigned as PENDING
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleAssignSops}
                    disabled={selectedSopIds.length === 0 || assigning}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : `Assign ${selectedSopIds.length} SOP${selectedSopIds.length > 1 ? 's' : ''}`}
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignModal(false)
                      setSelectedSopIds([])
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">No SOPs Available</p>
                      <p className="text-sm text-amber-700">
                        All SOPs are either already assigned or don't have a competency test yet.
                        Please create tests for your SOPs before assigning them.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                  }}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
