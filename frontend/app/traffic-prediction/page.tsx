"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Type definitions
interface TrafficPredictionResponse {
  station_id: number;
  datetime: string;
  prediction: number;
}

interface PredictionData {
  hour: string;
  prediction: number;
}

const stations: number[] = [
  86090, 116210, 116610, 116770, 116820, 116830, 116840, 116850, 118240, 118250,
  118260, 119030, 119100, 119120, 119740, 119780,
];

export default function TrafficPrediction() {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [stationId, setStationId] = useState<number>(86090); // Default station_id

  // List of station IDs

  const handlePredict = async (): Promise<void> => {
    setLoading(true);
    setPredictions([]); // Clear previous predictions
    const newPredictions: PredictionData[] = [];

    try {
      for (let hour = 0; hour < 24; hour++) {
        const formattedHour = hour.toString().padStart(2, "0");
        const datetime = `${date} ${formattedHour}:00:00`;

        const response = await axios.post<TrafficPredictionResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/traffic/predict/`,
          {
            station_id: stationId,
            datetime: datetime,
          }
        );

        newPredictions.push({
          hour: `${formattedHour}:00`,
          prediction: response.data.prediction,
        });
      }

      setPredictions(newPredictions);
    } catch (error) {
      console.error("Error predicting traffic:", error);
    }

    setLoading(false);
  };

  const handleStationChange = (value: string) => {
    setStationId(Number(value));
    setPredictions([]); // Clear predictions when station changes
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setPredictions([]); // Clear predictions when date changes
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-10">
        <Link href={"/"}>
          <Button className="" variant={"secondary"}>
            <ChevronLeft />
            Back Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-6">Traffic Prediction</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Predict Daily Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Station ID Select Dropdown */}
            <div>
              <label htmlFor="station-id" className="block text-sm font-medium">
                Select Station
              </label>
              <Select
                value={stationId.toString()}
                onValueChange={handleStationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Station" />
                </SelectTrigger>
                <SelectContent>
                  <div className="space-y-2">
                    {stations.map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        Station {id}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Select Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                min="2015-01-01" // Minimum date: January 1, 2015
                max="2015-12-31" // Maximum date: December 31, 2015
                placeholder="Select date"
              />
            </div>

            {/* Predict Button */}
            <Button onClick={handlePredict} disabled={loading || !date}>
              {loading ? "Predicting..." : "Predict Traffic"}
            </Button>
          </div>

          {/* Prediction Chart */}
          {loading ? (
            <div className="mt-8 flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            predictions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  Traffic Predictions for Station {stationId} on {date}
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="prediction" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
