"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TrafficPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/predict-traffic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ time, date }),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error predicting traffic:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Traffic Prediction</h1>
      <Card>
        <CardHeader>
          <CardTitle>Predict Future Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Select date"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Select time"
            />
            <Button onClick={handlePredict} disabled={loading}>
              {loading ? "Predicting..." : "Predict Traffic"}
            </Button>
          </div>
          {prediction && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Prediction Result:</h2>
              <p>{prediction}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
