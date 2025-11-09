// src/components/CallSelector.tsx
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { CallSummary } from '@/app/page'

interface CallSelectorProps {
  calls: CallSummary[]
  selectedCallId: string | null
  onSelectCall: (callId: string) => void
}

const CallSelector: React.FC<CallSelectorProps> = ({ calls, selectedCallId, onSelectCall }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCall = calls.find(call => call.id === selectedCallId)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
      case 'completed':
        return <span className="flex h-2 w-2 rounded-full bg-gray-400"></span>
      case 'missed':
        return <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'missed':
        return 'Missed'
      default:
        return status
    }
  }

  if (calls.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No active calls
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors min-w-[280px]"
      >
        <div className="flex-1 text-left">
          {selectedCall ? (
            <>
              <div className="flex items-center space-x-2">
                {getStatusDot(selectedCall.status)}
                <span className="text-sm font-medium text-gray-900">
                  {selectedCall.customerName}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {getStatusText(selectedCall.status)} • {formatTime(selectedCall.startTime)}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500">Select a call</span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Recent Calls</h3>
            <p className="text-xs text-gray-500 mt-0.5">{calls.length} total calls</p>
          </div>

          {/* Call List */}
          <div className="py-2">
            {calls.map((call) => (
              <button
                key={call.id}
                onClick={() => {
                  onSelectCall(call.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  call.id === selectedCallId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusDot(call.status)}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {call.customerName}
                      </span>
                      {call.id === selectedCallId && (
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="capitalize">{getStatusText(call.status)}</span>
                      <span>•</span>
                      <span>{formatTime(call.startTime)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {call.customerId}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all calls →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CallSelector