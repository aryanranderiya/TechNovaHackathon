'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [modules] = useState([
    {
      title: "Traffic Prediction",
      description: "Predict future traffic patterns to help plan trips and avoid delays.",
      path: "/traffic-prediction"
    },
    {
      title: "Public Transportation Optimization",
      description: "Optimize bus schedules based on predicted traffic patterns.",
      path: "/public-transport"
    },
    {
      title: "Driver Safety Monitoring",
      description: "Monitor driver behavior to prevent accidents caused by fatigue or distractions.",
      path: "/driver-safety"
    },
    {
      title: "Accident Detection",
      description: "Automatically detect traffic accidents using camera feeds for quick response.",
      path: "/accident-detection"
    }
  ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI-based Transportation System Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={module.path}>
                <Button>Go to {module.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

