// src/pages/Calls.tsx
"use client"

import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { services } from '../../services' // Import services

interface CallLog {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  startTime: string
  endTime: string
  duration: string
  outcome: 'scheduled' | 'interested' | 'not_interested' | 'follow_up' | 'no_answer'
  transcript: string
  notes: string
  meetingScheduled?: {
    date: string
    time: string
  }
}

function Calls() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]) // New state for fetched logs
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
  const [filterOutcome, setFilterOutcome] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch data from the local BFF route /api/calls
    const fetchLogs = async () => {
      try {
        // NOTE: In the BFF pattern, the fetch call here would be: 
        // const response = await fetch('/api/calls'); 
        // For simplicity and showing the service layer, we will assume the service is called directly here 
        // but in a real Next.js setup, you'd use getServerSideProps or a local fetch().
        const data = await services.callLogs.getCallLogs() as unknown as CallLog[] // Type assertion for mockup data
        setCallLogs(data);
      } catch (err) {
        setError("Could not load call logs from the BFF route.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [])
  

  const filteredLogs = callLogs.filter(log => {
    const outcomeMatch = filterOutcome === 'all' || log.outcome === filterOutcome
    const searchMatch = log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.transcript.toLowerCase().includes(searchQuery.toLowerCase())
    return outcomeMatch && searchMatch
  })

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading call logs...</div>
  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>


  return (
    <div className="p-4 sm:p-8 space-y-8">
      <Header title="Call Logs" />

      {/* ... (Rest of the UI logic from the snippet to display logs and modal) ... */}
      
      <p className="text-gray-500 mt-4">Displaying {filteredLogs.length} of {callLogs.length} call logs.</p>

      {/* Log list would be rendered here, using filteredLogs and setSelectedCall() */}
    </div>
  )
}

export default Calls