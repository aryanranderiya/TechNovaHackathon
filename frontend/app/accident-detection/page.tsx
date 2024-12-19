'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AccidentDetection() {
  const [accidents, setAccidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccidents()
  }, [])

  const fetchAccidents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/accidents')
      const data = await response.json()
      setAccidents(data.accidents)
    } catch (error) {
      console.error('Error fetching accidents:', error)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Accident Detection</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Accidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAccidents} disabled={loading} className="mb-4">
            {loading ? 'Refreshing...' : 'Refresh Accidents'}
          </Button>
          {accidents.length > 0 ? (
            <ul className="space-y-2">
              {accidents.map((accident, index) => (
                <li key={index} className="border p-2 rounded">
                  <p><strong>Location:</strong> {accident.location}</p>
                  <p><strong>Time:</strong> {accident.time}</p>
                  <p><strong>Severity:</strong> {accident.severity}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No accidents detected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

