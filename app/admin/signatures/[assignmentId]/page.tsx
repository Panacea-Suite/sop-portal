'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { formatVersion } from '@/lib/versionHelpers'

interface SignatureDetails {
  id: string
  sopVersion: string
  userSignature: string
  userSignedAt: string
  userIpAddress: string
  adminSignature: string | null
  adminSignedAt: string | null
  adminIpAddress: string | null
  user: {
    name: string
    email: string
  }
  sop: {
    title: string
    category?: string
  }
  assignment: {
    status: string
    assignedAt: string
  }
}

export default function SignatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [signature, setSignature] = useState<SignatureDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSignature()
  }, [params.assignmentId])

  const fetchSignature = async () => {
    try {
      const response = await fetch(`/api/signatures/${params.assignmentId}/details`)
      if (response.ok) {
        const data = await response.json()
        setSignature(data)
      }
    } catch (error) {
      console.error('Error fetching signature:', error)
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
            <p className="text-gray-600 font-medium">Loading signature details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!signature) {
    return (
      <DashboardLayout>
        <div className="px-8 py-12">
          <div className="text-center card py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Signature not found</h1>
            <button onClick={() => router.back()} className="btn-primary">
              Go Back
            </button>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Signature Details</h1>
              <p className="text-gray-600">{signature.sop.title} - {formatVersion(signature.sopVersion)}</p>
            </div>
            <span className="badge-fully-signed text-base px-6 py-2">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fully Signed
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* User Signature Section */}
        <div className="card mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Signature</h2>
            <p className="text-gray-600">Staff member's electronic signature</p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-emerald-800 mb-4">Declaration Signed:</p>
              <p className="text-sm text-emerald-700 italic leading-relaxed">
                "I confirm that I have thoroughly read the documentation and answered all questions honestly and to the best of my ability"
              </p>
            </div>

            <div className="border-t-2 border-emerald-200 pt-6 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Signature:</p>
              <p className="signature-display text-center py-6">
                {signature.userSignature}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl p-6">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Signed By</p>
                <p className="text-lg font-bold text-gray-900">{signature.user.name}</p>
                <p className="text-sm text-gray-500">{signature.user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Signed At</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(signature.userSignedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(signature.userSignedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">IP Address</p>
                <p className="text-lg font-mono text-gray-900">{signature.userIpAddress}</p>
                <p className="text-sm text-gray-500">Audit Trail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Counter-Signature Section */}
        {signature.adminSignature && signature.adminSignedAt && (
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Counter-Signature</h2>
              <p className="text-gray-600">Administrator's verification signature</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-blue-800 mb-4">Declaration Signed:</p>
                <p className="text-sm text-blue-700 italic leading-relaxed">
                  "I confirm that the assignee has read the documentation and answered all questions honestly and to the best of their ability"
                </p>
              </div>

              <div className="border-t-2 border-blue-200 pt-6 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-4">Signature:</p>
                <p className="signature-display text-center py-6">
                  {signature.adminSignature}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Signed At</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(signature.adminSignedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(signature.adminSignedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">IP Address</p>
                  <p className="text-lg font-mono text-gray-900">{signature.adminIpAddress}</p>
                  <p className="text-sm text-gray-500">Audit Trail</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOP & Assignment Info */}
        <div className="card mt-8 bg-gray-50">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Training Record Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">SOP Title</p>
                <p className="text-lg font-bold text-gray-900">{signature.sop.title}</p>
                {signature.sop.category && (
                  <p className="text-sm text-gray-500 mt-1">{signature.sop.category}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Version Completed</p>
                <span className="badge-version-completed text-base">
                  {formatVersion(signature.sopVersion)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Assigned Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(signature.assignment.assignedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</p>
                <span className="badge-completed">
                  {signature.assignment.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

