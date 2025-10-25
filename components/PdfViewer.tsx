'use client'

import { useEffect, useState } from 'react'

interface PdfViewerProps {
  sopId: string
  title: string
}

export default function PdfViewer({ sopId, title }: PdfViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSignedUrl()
    
    // Refresh URL every 10 minutes (before it expires at 15 minutes)
    const interval = setInterval(() => {
      fetchSignedUrl()
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [sopId])

  const fetchSignedUrl = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/sops/${sopId}/pdf-url`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF URL')
      }
      
      const data = await response.json()
      setSignedUrl(data.url)
    } catch (err) {
      console.error('Error fetching signed URL:', err)
      setError('Failed to load PDF')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !signedUrl) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-[800px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-[800px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-900 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchSignedUrl}
              className="btn-small"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!signedUrl) {
    return null
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">📄 {title}</h3>
        <a
          href={signedUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-small inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </a>
      </div>
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
        <iframe
          src={`${signedUrl}#toolbar=1&navpanes=0`}
          className="w-full h-[800px]"
          title={title}
        />
      </div>
    </div>
  )
}
