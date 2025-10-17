'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatCard from '@/components/StatCard'
import Link from 'next/link'
import { formatVersion } from '@/lib/versionHelpers'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({})
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [pendingCounterSignCount, setPendingCounterSignCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, resultsRes, pendingRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/results'),
        fetch('/api/signatures/pending-countersign')
      ])

      const statsData = await statsRes.json()
      const resultsData = await resultsRes.json()
      const pendingData = await pendingRes.json()

      setStats(statsData)
      setRecentResults(resultsData.slice(0, 10))
      setPendingCounterSignCount(Array.isArray(pendingData) ? pendingData.length : 0)
    } catch (error) {
      console.error('Error fetching data:', error)
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
            <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage staff, SOPs, and monitor training progress across your organization</p>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Staff"
            value={stats.totalUsers || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Total SOPs"
            value={stats.totalSOPs || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Total Assignments"
            value={stats.totalAssignments || 0}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            color="amber"
          />
          <StatCard
            title="Average Pass Rate"
            value={`${stats.averagePassRate || 0}%`}
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
          />
        </div>

        {/* Pending Counter-Signatures Alert */}
        {pendingCounterSignCount > 0 && (
          <div className="mb-8">
            <Link href="/admin/countersign" className="block">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 bg-blue-500 text-white rounded-2xl mr-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {pendingCounterSignCount} Counter-Signature{pendingCounterSignCount > 1 ? 's' : ''} Pending
                      </h3>
                      <p className="text-blue-700 font-medium">
                        Staff members are awaiting your verification signature
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 hover:text-blue-800">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/staff" className="card group hover:scale-105 transition-all duration-300 hover:shadow-strong">
              <div className="flex items-center mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF1E25] transition-colors">
                    Manage Staff
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Add and manage staff members</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/sops" className="card group hover:scale-105 transition-all duration-300 hover:shadow-strong">
              <div className="flex items-center mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF1E25] transition-colors">
                    Manage SOPs
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Create and edit SOPs</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/staff" className="card group hover:scale-105 transition-all duration-300 hover:shadow-strong">
              <div className="flex items-center mb-4">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl mr-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF1E25] transition-colors">
                    Assign SOPs
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Assign training to staff</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Test Results */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Test Results</h2>
          
          {recentResults.length > 0 ? (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th className="table-header">Staff Member</th>
                      <th className="table-header">SOP Title</th>
                      <th className="table-header">Version</th>
                      <th className="table-header">Score</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentResults.map((result: any) => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="font-semibold text-gray-900">
                            {result.user.name}
                          </div>
                          <div className="text-xs text-gray-500">{result.user.email}</div>
                        </td>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">{result.test.sop.title}</div>
                        </td>
                        <td className="table-cell">
                          <span className="badge-version-completed">
                            {formatVersion(result.sopVersion || '1.0')}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="text-xl font-bold text-gray-900">{result.score}%</div>
                        </td>
                        <td className="table-cell">
                          {result.passed ? (
                            <span className="badge-passed">Passed</span>
                          ) : (
                            <span className="badge-failed">Failed</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className="text-gray-600">
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
            <div className="card text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No test results yet</h3>
              <p className="text-gray-600">
                Test results will appear here once staff complete competency tests
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
