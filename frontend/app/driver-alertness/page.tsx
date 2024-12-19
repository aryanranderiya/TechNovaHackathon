"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios"; // Ensure axios is available for API requests
import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useState, useEffect } from "react";

// Define TypeScript types for the result
interface DrowsinessResult {
  prediction?: "Drowsy" | "Alert";
  probabilities?: { [key: string]: number };
  confidenceScore?: number;
  drowsyEvents?: Array<{ type: string; timestamp: string }>;
  recommendations?: string;
  error?: string;
}

export default function DriverAlertness() {
  const [result, setResult] = useState<DrowsinessResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For previewing images
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(
    null
  ); // For placeholder image selection

  // Convert image URL to base64 (using fetch)
  const getBase64Image = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Convert to base64
    });
  };

  // Handle file change (image only)
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setResult(null);

    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview image
    } else {
      alert("Please select a valid image file.");
    }
  };

  // Handle placeholder image selection using radio buttons
  const handlePlaceholderSelect = async (imageUrl: string): Promise<void> => {
    setResult(null);
    setSelectedPlaceholder(imageUrl);
    setSelectedFile(null); // Reset the file
    setPreviewUrl(imageUrl); // Preview the selected placeholder image
  };

  // Handle analyze button click
  const handleAnalyze = async (): Promise<void> => {
    if (!selectedFile && !selectedPlaceholder) {
      alert("Please select an image file or placeholder.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    let fileToAnalyze: File | string | Blob;

    // If a placeholder image is selected, convert it to a base64-encoded Blob
    if (selectedPlaceholder) {
      const base64Image = await getBase64Image(selectedPlaceholder);
      const byteString = atob(base64Image.split(",")[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      // Create a Blob from the Uint8Array (base64 image)
      fileToAnalyze = new Blob([uint8Array], { type: "image/jpeg" }); // Assuming JPEG, change the MIME type if needed
    } else {
      // Use selected file if no placeholder is selected
      fileToAnalyze = selectedFile!;
    }

    formData.append("file", fileToAnalyze);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/drowsiness/predict`,
        formData
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error detecting drowsiness:", error);
      setResult({
        error: "Failed to analyze the image. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup function for preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Free up memory after component unmount
      }
    };
  }, [previewUrl]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-10">
        <Link href={"/"}>
          <Button variant={"secondary"}>
            <ChevronLeft />
            Back Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-6">Driver Drowsiness Detection</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analyze Driver Drowsiness from Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File upload */}
            <div>
              <Label htmlFor="file-upload">Upload Image</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*" // Only accept image files
              />
            </div>

            {/* Image preview */}
            {previewUrl && selectedFile?.type.startsWith("image/") && (
              <div>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div>
              <Label>Or select a placeholder image:</Label>
              <div className="space-y-2 flex justify-between gap-2">
                {[
                  "/drowsiness/drowsiness1.jpg",
                  "/drowsiness/drowsiness2.png",
                  "/drowsiness/drowsiness3.png",
                ].map((imageUrl, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`placeholder-${index}`}
                      name="placeholder"
                      value={imageUrl}
                      checked={selectedPlaceholder === imageUrl}
                      onChange={() => handlePlaceholderSelect(imageUrl)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor={`placeholder-${index}`}
                      className="cursor-pointer"
                    >
                      <Image
                        src={imageUrl}
                        width={150}
                        height={150}
                        alt={`Placeholder ${index + 1}`}
                        className="object-cover size-[150]"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || (!selectedFile && !selectedPlaceholder)}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Analyze Driver Drowsiness"}
            </Button>
          </div>

          {/* Display result */}
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
                    {result.prediction === "Drowsy" ? (
                      <AlertCircle className="mr-2 text-red-500" />
                    ) : (
                      <CheckCircle2 className="mr-2 text-green-500" />
                    )}
                    <span className="text-lg font-medium">
                      Driver is {result.prediction}
                    </span>
                  </div>

                  {result?.probabilities && (
                    <div className="mt-2">
                      <strong>Probabilities:</strong>
                      <ul>
                        {Object.entries(result.probabilities).map(
                          ([key, value], index) => (
                            <li key={index}>
                              {key}: {(value * 100).toFixed(2)}%
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Optional metrics */}
                  {result.confidenceScore && (
                    <p className="mt-2">
                      Confidence: {(result.confidenceScore * 100).toFixed(2)}%
                    </p>
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
                      <h3 className="text-lg font-semibold">
                        Recommendations:
                      </h3>
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
  );
}
