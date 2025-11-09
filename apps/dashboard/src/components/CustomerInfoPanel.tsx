// src/components/CustomerInfoPanel.tsx
"use client"

import React from 'react'
import { CustomerInfo } from '@/app/page'

interface CustomerInfoPanelProps {
  customerInfo: CustomerInfo | null
}

const CustomerInfoPanel: React.FC<CustomerInfoPanelProps> = ({ customerInfo }) => {
  if (!customerInfo) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm">No customer selected</p>
          <p className="text-xs mt-1">Select a call to view customer information</p>
        </div>
      </div>
    )
  }

  const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null
    return (
      <div className="py-3 border-b border-gray-100">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </dt>
        <dd className="text-sm text-gray-900">{value}</dd>
      </div>
    )
  }

  const getIntentBadge = (intent: string) => {
    const styles = {
      buy: 'bg-green-100 text-green-800',
      rent: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[intent as keyof typeof styles]}`}>
        {intent === 'buy' ? '🏠 Buying' : intent === 'rent' ? '🔑 Renting' : '❓ Unknown'}
      </span>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 w-full">
        <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
      </div>

      {/* Customer Details */}
      <div className="flex-1 p-6 w-full">
        {/* Customer Name & Intent */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{customerInfo.name}</h3>
            {getIntentBadge(customerInfo.intent)}
          </div>
          <p className="text-sm text-gray-500">Customer ID: {customerInfo.id}</p>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Details
          </h4>
          <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
            {customerInfo.email && (
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 font-medium">{customerInfo.email}</dd>
              </div>
            )}
            {customerInfo.phone && (
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900 font-medium">{customerInfo.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Property Preferences */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Property Preferences
          </h4>
          <dl className="bg-gray-50 rounded-lg p-4">
            <InfoRow label="Location" value={customerInfo.location} />
            <InfoRow label="Zip Code" value={customerInfo.zipCode} />
            <InfoRow label="Timeline" value={customerInfo.timeline} />
            <InfoRow label="Budget" value={customerInfo.budget} />
            <InfoRow label="Bedrooms" value={customerInfo.bedrooms} />
          </dl>
        </div>

        {/* Additional Notes */}
        {customerInfo.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notes
            </h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{customerInfo.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Send Follow-up
          </button>
          <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfoPanel