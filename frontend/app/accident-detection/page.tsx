"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ImageIcon,
  Loader2,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

interface DetectionResult {
  prediction: string;
  probabilities: { [key: string]: number };
}

interface VideoDetectionResult {
  message: string;
  accident_frame?: {
    filename: string;
    prediction: string;
    probabilities: { [key: string]: number };
  };
}

const placeholderImages: string[] = [
  "/accident_prediction/accident1.webp",
  "/accident_prediction/accident3.png",
  "/accident_prediction/accident3.jpg",
  "/accident_prediction/nonaccident1.jpg",
];

const placeholderVideos: string[] = ["/accident_prediction/accident.mp4"];

export default function AccidentDetection() {
  // Image states
  const [imageResult, setImageResult] = useState<DetectionResult | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePlaceholder, setSelectedImagePlaceholder] = useState<
    string | null
  >(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Video states
  const [videoResult, setVideoResult] = useState<VideoDetectionResult | null>(
    null
  );
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedVideoPlaceholder, setSelectedVideoPlaceholder] = useState<
    string | null
  >(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [accidentFrameUrl, setAccidentFrameUrl] = useState<string | null>(null);

  // Handle image file change
  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageResult(null);

    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setSelectedImageFile(file);
      setSelectedImagePlaceholder(null);
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);
    }
  };

  // Handle video file change
  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVideoResult(null);
    setAccidentFrameUrl(null);

    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setSelectedVideoFile(file);
      setSelectedVideoPlaceholder(null);
      const fileUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(fileUrl);
    }
  };

  // Handle image placeholder selection
  const handleImagePlaceholderSelect = async (imageUrl: string) => {
    setImageResult(null);
    setSelectedImagePlaceholder(imageUrl);
    setSelectedImageFile(null);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      setImagePreviewUrl(fileUrl);
    } catch (error) {
      console.error("Error fetching image placeholder:", error);
    }
  };

  // Handle video placeholder selection
  const handleVideoPlaceholderSelect = async (videoUrl: string) => {
    setVideoResult(null);
    setAccidentFrameUrl(null);
    setSelectedVideoPlaceholder(videoUrl);
    setSelectedVideoFile(null);

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      setVideoPreviewUrl(fileUrl);
    } catch (error) {
      console.error("Error fetching video placeholder:", error);
    }
  };

  // Handle image detection
  const handleImageDetect = async () => {
    setImageLoading(true);
    const formData = new FormData();

    if (selectedImageFile) {
      formData.append("file", selectedImageFile);
    } else if (selectedImagePlaceholder) {
      const response = await fetch(selectedImagePlaceholder);
      const blob = await response.blob();
      const placeholderFile = new File([blob], "placeholder.png", {
        type: blob.type,
      });
      formData.append("file", placeholderFile);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/accident/predict/image`,
        formData
      );
      setImageResult(response.data);
    } catch (error) {
      console.error("Error detecting accident in image:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleVideoDetect = async () => {
    setVideoLoading(true);
    setVideoResult(null);
    setAccidentFrameUrl(null);

    const formData = new FormData();

    if (selectedVideoFile) {
      formData.append("file", selectedVideoFile);
    } else if (selectedVideoPlaceholder) {
      const response = await fetch(selectedVideoPlaceholder);
      const blob = await response.blob();
      const placeholderFile = new File([blob], "placeholder.mp4", {
        type: blob.type,
      });
      formData.append("file", placeholderFile);
    }

    try {
      // Get prediction results
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/accident/predict/video`,
        formData
      );

      setVideoResult(response.data);

      // If accident detected, fetch the frame image
      if (response.data.accident_frame) {
        const imageResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/accident/frames/${response.data.accident_frame.filename}`,
          {
            responseType: "blob",
          }
        );
        const frameUrl = URL.createObjectURL(imageResponse.data);
        setAccidentFrameUrl(frameUrl);
      }
    } catch (error) {
      console.error("Error detecting accident in video:", error);
      setVideoResult({
        message: "Error processing video. Please try again.",
      });
    } finally {
      setVideoLoading(false);
    }
  };
  // Format probabilities
  const formatProbabilities = (probs: { [key: string]: number }) => {
    return Object.entries(probs).map(([label, probability]) => ({
      label,
      probability: (probability * 100).toFixed(2),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-10">
        <Link href="/">
          <Button variant="secondary">
            <ChevronLeft />
            Back Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-6">Accident Detection</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Image Detection Card */}
        <Card className="bg-zinc-100">
          <CardHeader>
            <CardTitle className="flex gap-3">
              <ImageIcon />
              Image Accident Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  onChange={handleImageFileChange}
                  accept="image/*"
                />
              </div>

              {imagePreviewUrl && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Preview:</h3>
                  <Image
                    width={256}
                    height={256}
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}

              <div>
                <Label>Or select a placeholder image:</Label>
                <RadioGroup
                  onValueChange={handleImagePlaceholderSelect}
                  value={selectedImagePlaceholder || ""}
                >
                  <div className="flex gap-4">
                    {placeholderImages.map((imageUrl, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={imageUrl}
                          id={`image-${index}`}
                        />
                        <Label htmlFor={`image-${index}`}>
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
                onClick={handleImageDetect}
                disabled={
                  imageLoading ||
                  (!selectedImageFile && !selectedImagePlaceholder)
                }
              >
                {imageLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  "Detect Accident"
                )}
              </Button>

              {imageResult && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                  <h2 className="text-xl font-semibold mb-2">
                    Detection Result:
                  </h2>
                  <div className="flex items-center mb-2">
                    {imageResult.prediction === "Accident" ? (
                      <AlertCircle className="mr-2 text-red-500" />
                    ) : (
                      <CheckCircle2 className="mr-2 text-green-500" />
                    )}
                    <span className="text-lg">
                      <strong>Prediction:</strong> {imageResult.prediction}
                    </span>
                  </div>

                  <ul>
                    {formatProbabilities(imageResult.probabilities).map(
                      (prob, index) => (
                        <li key={index}>
                          {prob.label}: {prob.probability}%
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Detection Card */}
        <Card className="bg-zinc-100">
          <CardHeader>
            <CardTitle className="flex gap-3">
              <Video />
              Video Accident Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-upload">Upload Video</Label>
                <Input
                  id="video-upload"
                  type="file"
                  onChange={handleVideoFileChange}
                  accept="video/*"
                />
              </div>

              {videoPreviewUrl && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Preview:</h3>
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-auto max-h-64"
                  />
                </div>
              )}

              <div>
                <Label>Or select a placeholder video:</Label>
                <RadioGroup
                  onValueChange={handleVideoPlaceholderSelect}
                  value={selectedVideoPlaceholder || ""}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {placeholderVideos.map((videoUrl, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={videoUrl}
                          id={`video-${index}`}
                        />
                        <Label htmlFor={`video-${index}`}>
                          Video {index + 1}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleVideoDetect}
                disabled={
                  videoLoading ||
                  (!selectedVideoFile && !selectedVideoPlaceholder)
                }
              >
                {videoLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Video...
                  </>
                ) : (
                  "Detect Accident"
                )}
              </Button>

              {videoResult && (
                <div className="mt-4 p-4 border rounded-lg bg-white">
                  <h2 className="text-xl font-semibold mb-2">
                    Detection Result:
                  </h2>
                  <p className="mb-4">{videoResult.message}</p>

                  {accidentFrameUrl && videoResult.accident_frame && (
                    <>
                      <h3 className="font-medium mb-2">Accident Frame:</h3>
                      <Image
                        width={500}
                        height={300}
                        src={accidentFrameUrl}
                        alt="Accident Frame"
                        className="w-full h-[300px] mb-4 object-contain"
                      />
                      <div className="flex items-center mb-2">
                        <AlertCircle className="mr-2 text-red-500" />
                        <span className="text-lg">
                          <strong>Prediction:</strong>{" "}
                          {videoResult.accident_frame.prediction}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
