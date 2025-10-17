'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  assignments: any[]
  testResults: any[]
}

export default function StaffManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    sendEmail: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setShowAddModal(false)
        setFormData({ name: '', email: '', password: '', role: 'USER', sendEmail: true })
        fetchUsers()
        
        // Show success message
        if (data.emailSent) {
          alert(`✅ Staff member added successfully!\n\nWelcome email sent to ${formData.email}`)
        } else {
          alert(`✅ Staff member added successfully!\n\n⚠️ Note: Welcome email could not be sent. Please provide login details manually.`)
        }
      } else {
        alert(data.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Failed to add user')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading staff...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
            <p className="text-gray-600">Manage staff members and monitor their training progress</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Staff Member
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="table-header">Name & Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Assigned SOPs</th>
                  <th className="table-header">Completed</th>
                  <th className="table-header">Awaiting Counter Signature</th>
                  <th className="table-header">Pass Rate</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const completedCount = user.assignments.filter(a => a.status === 'COMPLETED').length
                  const awaitingAdminSigCount = user.assignments.filter(a => a.status === 'AWAITING_ADMIN_SIGNATURE').length
                  const passedTests = user.testResults.filter(r => r.passed).length
                  const passRate = user.testResults.length > 0
                    ? Math.round((passedTests / user.testResults.length) * 100)
                    : 0

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="table-cell">
                        <span className={user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}>
                          {user.role}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-2xl font-bold text-gray-900">{user.assignments.length}</div>
                      </td>
                      <td className="table-cell">
                        <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
                      </td>
                      <td className="table-cell">
                        {awaitingAdminSigCount > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-amber-600">{awaitingAdminSigCount}</div>
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gray-300">0</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-gray-900">{passRate}%</div>
                          {passRate >= 80 && (
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <Link
                          href={`/admin/staff/${user.id}`}
                          className="link-primary"
                        >
                          View Details →
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Add Staff Member</h2>
            <form onSubmit={handleAddUser}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="john@example.com"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be sent to the user via email
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    disabled={submitting}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Send Email Toggle */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="mt-1 h-5 w-5 text-[#FF1E25] rounded"
                      disabled={submitting}
                    />
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">
                        Send welcome email with login details
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        An email will be sent to {formData.email || 'the user'} with their username and password
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="submit" 
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Staff Member...
                    </span>
                  ) : (
                    'Add Staff Member'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
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
