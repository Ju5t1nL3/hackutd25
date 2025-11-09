// src/components/Sidebar.tsx

import React from 'react'
import Link from 'next/link' // Assuming you're using react-router-dom for navigation

const navItems = [
  { name: 'Dashboard', path: '/', icon: '🏠' },
  { name: 'Call Logs', path: '/calls', icon: '📞' },
  { name: 'Property Search', path: '/search', icon: '🔍' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
]

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-full fixed flex flex-col p-4 shadow-2xl">
      <div className="text-2xl font-bold mb-8 text-blue-400">Broker AI</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className="flex items-center p-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition duration-150"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
        Veronica's Dashboard
      </div>
    </div>
  )
}

export default Sidebar