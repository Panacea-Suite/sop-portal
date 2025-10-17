'use client'

import { useState } from 'react'

interface SignatureModalProps {
  type: 'user' | 'admin'
  userName: string
  sopTitle: string
  sopVersion: string
  testScore?: number
  onSign: (signature: string) => Promise<void>
  onCancel: () => void
}

export default function SignatureModal({
  type,
  userName,
  sopTitle,
  sopVersion,
  testScore,
  onSign,
  onCancel
}: SignatureModalProps) {
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  const userDeclaration = "I confirm that I have thoroughly read the documentation and answered all questions honestly and to the best of my ability"
  const adminDeclaration = "I confirm that the assignee has read the documentation and answered all questions honestly and to the best of their ability"

  const declaration = type === 'user' ? userDeclaration : adminDeclaration

  const handleSign = async () => {
    setError('')
    
    if (!signature.trim()) {
      setError('Please type your full name')
      return
    }

    if (signature.trim().toLowerCase() !== userName.trim().toLowerCase()) {
      setError('Signature must match your full name exactly')
      return
    }

    if (!agreed) {
      setError('You must agree to the declaration')
      return
    }

    setSigning(true)
    try {
      await onSign(signature.trim())
    } catch (err) {
      setError('Failed to submit signature. Please try again.')
      setSigning(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1002 }}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {type === 'user' ? 'Sign to Complete Training' : 'Counter-Sign Completion'}
            </h2>
            <p className="text-gray-600">
              {sopTitle} - Version {sopVersion}
            </p>
          </div>
          {!signing && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Success Message for User */}
        {type === 'user' && testScore !== undefined && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-emerald-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 mb-2">
                  Congratulations! You Passed! 🎉
                </h3>
                <p className="text-emerald-800">
                  Your score: <span className="font-bold">{testScore}%</span>
                </p>
                <p className="text-sm text-emerald-700 mt-2">
                  Complete your signature below to finalize your training certification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Declaration */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Declaration</h3>
          <p className="text-gray-700 leading-relaxed italic">
            "{declaration}"
          </p>
        </div>

        {/* Signature Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Type your full name to sign
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="input-field text-lg"
            placeholder={userName}
            disabled={signing}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            Your full name: <span className="font-semibold">{userName}</span>
          </p>
        </div>

        {/* Signature Preview */}
        {signature && (
          <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl">
            <p className="text-sm font-semibold text-gray-700 mb-3">Signature Preview:</p>
            <p className="signature-display text-center py-4">
              {signature}
            </p>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={signing}
              className="mt-1 w-5 h-5 text-[#FF1E25] border-gray-300 rounded focus:ring-[#FF1E25] cursor-pointer"
            />
            <span className="ml-3 text-sm text-gray-700">
              <strong>I agree</strong> to the declaration above and confirm this is my legal signature
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-rose-50 border-2 border-rose-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSign}
            disabled={!signature || !agreed || signing}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signing ? 'Submitting Signature...' : `${type === 'user' ? 'Sign & Submit' : 'Counter-Sign & Complete'}`}
          </button>
          {!signing && (
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Legal Note */}
        <p className="text-xs text-gray-500 text-center mt-6 italic">
          By signing, you acknowledge that this constitutes a legal electronic signature and will be permanently recorded with timestamp and IP address for compliance purposes.
        </p>
      </div>
    </div>
  )
}

