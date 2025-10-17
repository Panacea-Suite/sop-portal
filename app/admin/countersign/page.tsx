'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import SignatureModal from '@/components/SignatureModal'
import { formatVersion } from '@/lib/versionHelpers'

interface PendingSignature {
  id: string
  status: string
  user: {
    id: string
    name: string
    email: string
  }
  sop: {
    id: string
    title: string
    version: string
    category?: string
  }
  signature: {
    id: string
    userSignature: string
    userSignedAt: string
    sopVersion: string
  }
  testResult?: {
    id: string
    score: number
    passed: boolean
  }
  assignedByUser?: {
    id: string
    name: string
  }
}

export default function CounterSignPage() {
  const { data: session } = useSession()
  const [pendingSignatures, setPendingSignatures] = useState<PendingSignature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSignature, setSelectedSignature] = useState<PendingSignature | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  useEffect(() => {
    fetchPendingSignatures()
  }, [])

  const fetchPendingSignatures = async () => {
    try {
      const response = await fetch('/api/signatures/pending-countersign')
      if (response.ok) {
        const data = await response.json()
        setPendingSignatures(data)
      } else {
        const error = await response.json()
        console.error('Failed to fetch pending signatures:', error)
      }
    } catch (error) {
      console.error('Error fetching pending signatures:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCounterSign = async (signature: string) => {
    if (!selectedSignature) return

    try {
      const response = await fetch(`/api/signatures/${selectedSignature.signature.id}/countersign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          agreedToDeclaration: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        setShowSignatureModal(false)
        setSelectedSignature(null)
        fetchPendingSignatures()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to counter-sign')
      }
    } catch (error: any) {
      throw error // Re-throw to be handled by SignatureModal
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading pending counter-signatures...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Counter-Sign Completions ✍️
          </h1>
          <p className="text-gray-600">
            Review and verify staff training completions with your counter-signature
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        {pendingSignatures.length > 0 ? (
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pending Counter-Signatures ({pendingSignatures.length})
              </h2>
              <p className="text-gray-600">
                These staff members have completed their training and are awaiting your verification
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="table-header">Staff Member</th>
                    <th className="table-header">SOP Title</th>
                    <th className="table-header">Version</th>
                    <th className="table-header">Test Score</th>
                    <th className="table-header">User Signature</th>
                    <th className="table-header">Signed At</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingSignatures.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="font-semibold text-gray-900">
                          {item.user.name}
                        </div>
                        <div className="text-xs text-gray-500">{item.user.email}</div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{item.sop.title}</div>
                        {item.sop.category && (
                          <div className="text-xs text-gray-500 mt-1">{item.sop.category}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="badge-version">
                          {formatVersion(item.signature.sopVersion)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-xl font-bold text-emerald-600">
                          {item.testResult?.score || 0}%
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="signature-display text-xl">
                          {item.signature.userSignature}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-600">
                          {new Date(item.signature.userSignedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => {
                            setSelectedSignature(item)
                            setShowSignatureModal(true)
                          }}
                          className="btn-primary text-sm"
                        >
                          Counter-Sign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              All Caught Up! ✓
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no pending counter-signatures at this time. You'll receive an email notification when a staff member completes their training and requires your verification.
            </p>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && selectedSignature && session?.user && (
        <SignatureModal
          type="admin"
          userName={session.user.name}
          sopTitle={selectedSignature.sop.title}
          sopVersion={selectedSignature.signature.sopVersion}
          testScore={selectedSignature.testResult?.score}
          onSign={handleCounterSign}
          onCancel={() => {
            setShowSignatureModal(false)
            setSelectedSignature(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}

