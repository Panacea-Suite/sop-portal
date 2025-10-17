'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Link from 'next/link'
import { formatVersion, isNewerVersion } from '@/lib/versionHelpers'

interface Assignment {
  id: string
  status: string
  assignedAt: string
  dueDate?: string
  sop: {
    id: string
    title: string
    description: string
    category?: string
    version: string
  }
}

interface TestResult {
  id: string
  testId: string
  sopVersion?: string
  score: number
  passed: boolean
  test: {
    sop: {
      id: string
    }
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [assignmentsRes, statsRes, resultsRes] = await Promise.all([
        fetch('/api/sops'),
        fetch('/api/stats'),
        fetch('/api/results')
      ])

      const assignmentsData = await assignmentsRes.json()
      const statsData = await statsRes.json()
      const resultsData = await resultsRes.json()

      setAssignments(assignmentsData)
      setStats(statsData)
      setTestResults(resultsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to check if user completed an older version
  const getVersionStatus = (sopId: string, currentVersion: string) => {
    const userResult = testResults.find(
      (result) => result.test.sop.id === sopId && result.passed
    )
    
    if (!userResult || !userResult.sopVersion) {
      return null
    }

    // Compare versions
    if (userResult.sopVersion !== currentVersion) {
      return {
        hasOlderVersion: true,
        completedVersion: userResult.sopVersion,
        score: userResult.score
      }
    }

    return {
      hasOlderVersion: false,
      completedVersion: userResult.sopVersion,
      score: userResult.score
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your training portal...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'PENDING')
  const inProgressAssignments = assignments.filter((a) => a.status === 'IN_PROGRESS')
  const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED')

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Continue your training journey and track your progress towards competency certification.
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Assigned"
            value={stats.totalAssignments || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.pendingAssignments || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amber"
          />
          <StatCard
            title="Completed"
            value={stats.completedAssignments || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore || 0}%`}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="red"
          />
        </div>

        {/* Pending SOPs */}
        {pendingAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingAssignments.map((assignment) => {
                const versionStatus = getVersionStatus(assignment.sop.id, assignment.sop.version)
                
                return (
                  <div key={assignment.id} className="card group hover:scale-105 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF1E25] transition-colors">
                        {assignment.sop.title}
                      </h3>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="badge-pending flex-shrink-0">Pending</span>
                        <span className="badge-version">{formatVersion(assignment.sop.version)}</span>
                      </div>
                    </div>
                    
                    {versionStatus?.hasOlderVersion && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-amber-800 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          New version available!
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          You completed {formatVersion(versionStatus.completedVersion)} ({versionStatus.score}%). Please review the updated version.
                        </p>
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {assignment.sop.description}
                    </p>
                    {assignment.sop.category && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {assignment.sop.category}
                        </span>
                      </div>
                    )}
                    <Link
                      href={`/sops/${assignment.sop.id}`}
                      className="btn-primary inline-block text-center w-full"
                    >
                      {versionStatus?.hasOlderVersion ? 'Review New Version & Retake Test' : 'Start Learning'} →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* In Progress SOPs */}
        {inProgressAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAssignments.map((assignment) => {
                const versionStatus = getVersionStatus(assignment.sop.id, assignment.sop.version)
                
                return (
                  <div key={assignment.id} className="card group hover:scale-105 transition-all duration-300 border-2 border-blue-100">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF1E25] transition-colors">
                        {assignment.sop.title}
                      </h3>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="badge-in-progress flex-shrink-0">In Progress</span>
                        <span className="badge-version">{formatVersion(assignment.sop.version)}</span>
                      </div>
                    </div>
                    
                    {versionStatus?.hasOlderVersion && (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-amber-800 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          New version available!
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          You completed {formatVersion(versionStatus.completedVersion)}. This is an updated version.
                        </p>
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {assignment.sop.description}
                    </p>
                    <Link
                      href={`/sops/${assignment.sop.id}`}
                      className="btn-primary inline-block text-center w-full"
                    >
                      Continue →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed SOPs */}
        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Training</h2>
            <div className="card">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="table-header">SOP Title</th>
                      <th className="table-header">Version</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Completed Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {completedAssignments.map((assignment) => {
                      const versionStatus = getVersionStatus(assignment.sop.id, assignment.sop.version)
                      
                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="table-cell">
                            <div className="font-semibold text-gray-900">
                              {assignment.sop.title}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col gap-1">
                              <span className="badge-version-completed">
                                Completed: {formatVersion(versionStatus?.completedVersion || assignment.sop.version)}
                              </span>
                              {versionStatus?.hasOlderVersion && (
                                <span className="badge-outdated text-xs">
                                  Current: {formatVersion(assignment.sop.version)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-600 text-sm">
                              {assignment.sop.category || 'General'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-600 text-sm">
                              {new Date(assignment.assignedAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="badge-completed">Completed</span>
                          </td>
                          <td className="table-cell">
                            <Link
                              href={`/sops/${assignment.sop.id}`}
                              className="link-primary text-sm"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {assignments.length === 0 && (
          <div className="text-center py-20 card">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No SOPs assigned yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Your training materials will appear here once they're assigned by your administrator
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
