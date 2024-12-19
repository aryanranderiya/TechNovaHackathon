'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'

export default function DriverSafety() {
  const [status, setStatus] = useState('Normal')
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/driver-status')
        const data = await response.json()
        setStatus(data.status)
        setEvents(data.events)
      } catch (error) {
        console.error('Error fetching driver status:', error)
      }
    }

    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Driver Safety Monitoring</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Driver Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4">Status: {status}</p>
          <h2 className="text-xl font-semibold mb-2">Recent Events:</h2>
          <ul className="list-disc pl-5">
            {events.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

