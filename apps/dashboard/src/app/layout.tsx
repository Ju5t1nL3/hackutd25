// apps/dashboard/src/app/layout.tsx

import React from 'react'
import Sidebar from '@/components/Sidebar' // Use alias for clean import
import '../index.css' // Import global styles from src/index.css

// Metadata is optional but good practice in Next.js
export const metadata = {
  title: 'Broker AI Dashboard',
  description: 'AI Agent Platform for Real Estate Brokers',
}

/**
 * RootLayout replaces App.tsx and main.tsx by defining the shell structure
 * that wraps all pages in the Next.js App Router.
 */
export default function RootLayout({
  children, // This prop represents the current page component (e.g., page.tsx for Home, calls/page.tsx)
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* The body tag now contains the entire application structure. 
        The content within the body matches the structure previously in App.tsx.
      */}
      <body>
        <div className="flex h-screen w-full bg-white">
          
          {/* 1. Persistent UI: Sidebar */}
          <Sidebar />

          {/* 2. Main Content Area - Full height, no padding */}
          <main className="flex-1 overflow-hidden ml-64 h-screen">
            {/* Page Content: {children} is where Next.js injects the 
              content of the current route (e.g., Home page.tsx, or Calls page.tsx)
            */}
            {children}
            
            {/* NOTE: 404 handling is now managed by Next.js's built-in not-found.tsx file, 
               so the <Route path="*" ...> is no longer needed here.
            */}
          </main>
        </div>
      </body>
    </html>
  )
}