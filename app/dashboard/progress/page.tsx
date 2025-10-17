'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatVersion } from '@/lib/versionHelpers'

interface TestResult {
  id: string
  score: number
  passed: boolean
  sopVersion?: string
  completedAt: string
  test: {
    title: string
    passingScore: number
    sop: {
      title: string
      category?: string
      version: string
    }
  }
}

export default function ProgressPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (results.length === 0) return { avgScore: 0, passRate: 0, totalTests: 0 }
    
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    )
    const passedCount = results.filter(r => r.passed).length
    const passRate = Math.round((passedCount / results.length) * 100)
    
    return { avgScore, passRate, totalTests: results.length }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your progress...</p>
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
            Your Progress & Achievements 🎯
          </h1>
          <p className="text-gray-600">
            Track your training journey and celebrate your competency milestones
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="mb-2 text-blue-100 text-sm font-semibold uppercase tracking-wide">
              Total Tests Completed
            </div>
            <div className="text-5xl font-bold mb-2">{stats.totalTests}</div>
            <div className="text-blue-100 text-sm">Competency assessments</div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="mb-2 text-emerald-100 text-sm font-semibold uppercase tracking-wide">
              Average Score
            </div>
            <div className="text-5xl font-bold mb-2">{stats.avgScore}%</div>
            <div className="text-emerald-100 text-sm">Across all tests</div>
          </div>
          
          <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="mb-2 text-purple-100 text-sm font-semibold uppercase tracking-wide">
              Pass Rate
            </div>
            <div className="text-5xl font-bold mb-2">{stats.passRate}%</div>
            <div className="text-purple-100 text-sm">Success rate</div>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 ? (
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Test History</h2>
              <p className="text-gray-600">Detailed results from all your competency assessments</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="table-header">SOP Title</th>
                    <th className="table-header">Test Name</th>
                    <th className="table-header">SOP Version</th>
                    <th className="table-header">Score</th>
                    <th className="table-header">Result</th>
                    <th className="table-header">Completed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((result) => {
                    const isOldVersion = result.sopVersion && result.test.sop.version !== result.sopVersion
                    
                    return (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="font-semibold text-gray-900">
                            {result.test.sop.title}
                          </div>
                          {result.test.sop.category && (
                            <div className="text-xs text-gray-500 mt-1">
                              {result.test.sop.category}
                            </div>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="text-gray-900">{result.test.title}</div>
                        </td>
                        <td className="table-cell">
                          <div className="flex flex-col gap-1">
                            <span className="badge-version-completed">
                              {formatVersion(result.sopVersion || '1.0')}
                            </span>
                            {isOldVersion && (
                              <span className="text-xs text-amber-600 font-medium">
                                (Previous Version)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.score}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Required: {result.test.passingScore}%
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          {result.passed ? (
                            <span className="badge-passed inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Passed
                            </span>
                          ) : (
                            <span className="badge-failed inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600">
                            {new Date(result.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 card">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No test results yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Complete your first competency test to see your results and track your progress here
            </p>
            <a href="/dashboard" className="btn-primary inline-flex items-center">
              View Available SOPs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
