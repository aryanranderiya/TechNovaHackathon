'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function DriverAlertness() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const videoRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
    } else {
      alert('Please select a valid video file.')
      event.target.value = null
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select a video file first.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('video', selectedFile)

    try {
      const response = await fetch('/api/analyze-driver-drowsiness', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error analyzing driver drowsiness:', error)
      setResult({ error: 'An error occurred while analyzing the video.' })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Driver Drowsiness Detection</h1>
      <Card>
        <CardHeader>
          <CardTitle>Analyze Driver Drowsiness from Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-upload">Upload Video</Label>
              <Input 
                id="video-upload" 
                type="file" 
                onChange={handleFileChange} 
                accept="video/*" 
              />
            </div>
            {selectedFile && (
              <div>
                <video 
                  ref={videoRef} 
                  src={URL.createObjectURL(selectedFile)} 
                  controls 
                  className="w-full max-w-md mx-auto"
                />
              </div>
            )}
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !selectedFile}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Driver Drowsiness'}
            </Button>
          </div>
          {result && (
            <div className="mt-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold mb-2">Analysis Result:</h2>
              {result.error ? (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="mr-2" />
                  <span>{result.error}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    {result.isDrowsy ? (
                      <AlertCircle className="mr-2 text-red-500" />
                    ) : (
                      <CheckCircle2 className="mr-2 text-green-500" />
                    )}
                    <span className="text-lg font-medium">
                      Driver is {result.isDrowsy ? 'drowsy' : 'alert'}
                    </span>
                  </div>
                  {result.confidenceScore && (
                    <p className="mt-2">Confidence: {(result.confidenceScore * 100).toFixed(2)}%</p>
                  )}
                  {result.drowsyEvents && result.drowsyEvents.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold">Drowsy Events:</h3>
                      <ul className="list-disc pl-5">
                        {result.drowsyEvents.map((event, index) => (
                          <li key={index}>
                            {event.type} at {event.timestamp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations && (
                    <div className="mt-2">
                      <h3 className="text-lg font-semibold">Recommendations:</h3>
                      <p>{result.recommendations}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

