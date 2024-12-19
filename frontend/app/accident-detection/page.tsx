"use client";

import axios from "axios";
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

interface DetectionResult {
  prediction: string;
  probabilities: { [key: string]: number };
}

const placeholderImages: string[] = [
  "/accident_prediction/accident1.webp",
  "/accident_prediction/accident3.jpg",
];

export default function AccidentDetection() {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<File | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For image/video preview

  // Handle file change and set preview
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setSelectedPlaceholder(null);
      const fileUrl = URL.createObjectURL(file); // Create preview URL
      setPreviewUrl(fileUrl);
    }
  };

  // Fetch the placeholder image as a Blob and convert it to a File
  const handlePlaceholderSelect = async (imageUrl: string) => {
    setSelectedPlaceholder(null); // Reset placeholder
    setSelectedFile(null); // Reset the selected file

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const placeholderFile = new File([blob], "placeholder.png", {
        type: blob.type,
      });

      setSelectedPlaceholder(placeholderFile);
      const fileUrl = URL.createObjectURL(placeholderFile); // Create a preview URL for the placeholder image
      setPreviewUrl(fileUrl);
    } catch (error) {
      console.error("Error fetching placeholder:", error);
    }
  };

  // Handle detection request
  const handleDetect = async () => {
    setLoading(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (selectedPlaceholder) {
      formData.append("file", selectedPlaceholder); // Add placeholder as a file
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/predict/accident`,
        formData
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error detecting accident:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format the probabilities, rounding to 2 decimal places
  const formatProbabilities = (probs: { [key: string]: number }) => {
    return Object.keys(probs).map((key) => ({
      label: key,
      probability: probs[key].toFixed(2), // Round to 2 decimals
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Accident Detection</h1>
      <Card>
        <CardHeader>
          <CardTitle>Detect Accident from Image or Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File upload */}
            <div>
              <Label htmlFor="file-upload">Upload Image or Video</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
            </div>

            {/* Preview the uploaded image or video */}
            {previewUrl && (
              <div className="mt-4">
                {selectedFile ? (
                  <div>
                    <h3>Preview:</h3>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <div>
                    <h3>Placeholder Preview:</h3>
                    <Image
                      src={previewUrl}
                      alt="Placeholder Preview"
                      width={300}
                      height={200}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Placeholder selection */}
            <div>
              <Label>Or select a placeholder image:</Label>
              <RadioGroup
                onValueChange={handlePlaceholderSelect}
                value={selectedPlaceholder?.name || ""}
              >
                <div className="flex space-x-2">
                  {placeholderImages.map((imageUrl, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={imageUrl}
                        id={`placeholder-${index}`}
                      />
                      <Label htmlFor={`placeholder-${index}`}>
                        <Image
                          src={imageUrl}
                          width={100}
                          height={100}
                          alt={`Placeholder ${index + 1}`}
                          className="w-[100px] h-[100px] object-cover"
                        />
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleDetect}
              disabled={loading || (!selectedFile && !selectedPlaceholder)}
            >
              {loading ? "Detecting..." : "Detect Accident"}
            </Button>
          </div>

          {/* Display result */}
          {result && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Detection Result:</h2>
              <p>
                <strong>Prediction:</strong> {result.prediction}
              </p>
              <div>
                <strong>Probabilities:</strong>
                <ul>
                  {formatProbabilities(result.probabilities).map(
                    (prob, index) => (
                      <li key={index}>
                        {prob.label}: {prob.probability}%
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
