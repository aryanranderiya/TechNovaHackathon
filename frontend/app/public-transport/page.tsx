'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from 'react'

export default function PublicTransportation() {
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [route, setRoute] = useState('')

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/optimize-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ route }),
      })
      const data = await response.json()
      setSchedule(data.schedule)
    } catch (error) {
      console.error('Error optimizing schedule:', error)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Public Transportation Optimization</h1>
      <Card>
        <CardHeader>
          <CardTitle>Optimize Bus Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Enter bus route"
            />
            <Button onClick={handleOptimize} disabled={loading}>
              {loading ? 'Optimizing...' : 'Optimize Schedule'}
            </Button>
          </div>
          {schedule && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Optimized Schedule:</h2>
              <pre>{JSON.stringify(schedule, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

