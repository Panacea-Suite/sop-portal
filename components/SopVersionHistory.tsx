'use client'

import { useState, useEffect } from 'react'
import { formatVersion } from '@/lib/versionHelpers'

interface Version {
  id: string
  version: string
  title: string
  changelog: string | null
  createdBy: string | null
  createdAt: string
}

interface SopVersionHistoryProps {
  sopId: string
  sopTitle: string
  currentVersion: string
  onClose: () => void
  onVersionRestored: () => void
}

export default function SopVersionHistory({
  sopId,
  sopTitle,
  currentVersion,
  onClose,
  onVersionRestored
}: SopVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [viewingVersion, setViewingVersion] = useState<any | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [sopId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/sops/${sopId}/versions`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data.versions)
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/sops/${sopId}/versions/${versionId}`)
      if (response.ok) {
        const data = await response.json()
        setViewingVersion(data)
      }
    } catch (error) {
      console.error('Failed to fetch version details:', error)
      alert('Failed to load version details')
    }
  }

  const handleRestoreVersion = async (versionId: string, versionNumber: string) => {
    if (!confirm(`Are you sure you want to restore version ${versionNumber}? This will create a new version and reassign all users.`)) {
      return
    }

    setRestoring(true)
    try {
      const response = await fetch(`/api/sops/${sopId}/versions/${versionId}`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        onVersionRestored()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to restore version')
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <>
      {/* Main Modal */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Version History</h2>
              <p className="text-gray-600 mt-1">{sopTitle}</p>
              <p className="text-sm text-gray-500 mt-1">
                Current Version: <span className="badge-current">{formatVersion(currentVersion)}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading version history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No version history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="table-header">Version</th>
                    <th className="table-header">Title</th>
                    <th className="table-header">Changelog</th>
                    <th className="table-header">Created By</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {versions.map((version) => (
                    <tr key={version.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <span className={version.version === currentVersion ? 'badge-current' : 'badge-version'}>
                          {formatVersion(version.version)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{version.title}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-600 italic">
                          {version.changelog || 'No changelog'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-600">{version.createdBy || 'Unknown'}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-600">
                          {new Date(version.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewVersion(version.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          {version.version !== currentVersion && (
                            <button
                              onClick={() => handleRestoreVersion(version.id, version.version)}
                              disabled={restoring}
                              className="text-sm text-[#FF1E25] hover:text-[#E01B22] font-medium disabled:opacity-50"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Version Modal */}
      {viewingVersion && (
        <div className="modal-overlay" onClick={() => setViewingVersion(null)} style={{ zIndex: 1001 }}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingVersion.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  Version: <span className="badge-version">{formatVersion(viewingVersion.version)}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingVersion(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{viewingVersion.description}</p>
              </div>

              {viewingVersion.changelog && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Changelog</h3>
                  <p className="text-gray-600 italic">{viewingVersion.changelog}</p>
                </div>
              )}

              {viewingVersion.pdfFileName && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">PDF Document</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">📄 {viewingVersion.pdfFileName}</span>
                    {viewingVersion.pdfUrl && (
                      <a
                        href={viewingVersion.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              )}

              {viewingVersion.content && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Content</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {viewingVersion.content}
                    </pre>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-4 border-t">
                Created by {viewingVersion.createdBy || 'Unknown'} on{' '}
                {new Date(viewingVersion.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

