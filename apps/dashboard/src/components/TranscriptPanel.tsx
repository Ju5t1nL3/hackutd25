// src/components/TranscriptPanel.tsx
"use client"

import React, { useEffect, useRef } from 'react'
import { TranscriptMessage } from '@/app/page'

interface TranscriptPanelProps {
  transcript: TranscriptMessage[]
  callStatus: 'active' | 'completed' | 'missed'
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, callStatus }) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadge = () => {
    switch (callStatus) {
      case 'active':
        return (
          <span className="flex items-center text-green-600 text-sm font-medium">
            <span className="flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Call
          </span>
        )
      case 'completed':
        return <span className="text-gray-600 text-sm font-medium">Call Ended</span>
      case 'missed':
        return <span className="text-red-600 text-sm font-medium">Missed Call</span>
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Live Transcript</h2>
          {getStatusBadge()}
        </div>
      </div>

      {/* Transcript Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 w-full">
        {transcript.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Transcript will appear here when the call starts</p>
            </div>
          </div>
        ) : (
          <>
            {transcript.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${message.speaker === 'agent' ? 'order-1' : 'order-2'}`}>
                  {/* Speaker Label */}
                  <div className={`text-xs font-medium mb-1 ${
                    message.speaker === 'agent' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {message.speaker === 'agent' ? '🤖 AI Agent' : '👤 Customer'}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.speaker === 'agent'
                        ? 'bg-blue-100 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-xs text-gray-400 mt-1 ${
                    message.speaker === 'customer' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </>
        )}
      </div>

      {/* Footer */}
      {callStatus === 'active' && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Transcript is updating in real-time
          </p>
        </div>
      )}
    </div>
  )
}

export default TranscriptPanel