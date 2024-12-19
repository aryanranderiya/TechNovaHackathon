import os
import io
import cv2
import numpy as np
from fastai.vision.all import PILImage, load_learner
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
from fastapi.responses import StreamingResponse

router = APIRouter()

model = load_learner("Accident_Detection/model.pkl")


def extract_frames(video_path, output_dir, frame_interval=3):
    """
    Extracts frames from a video file and saves every `frame_interval` frame.

    Args:
        video_path (str): Path to the input video file.
        output_dir (str): Directory to save the extracted frames.
        frame_interval (int): Interval between frames to save (e.g., 2 means save every 2nd frame).

    Returns:
        int: The total number of frames saved.
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Open video file
    vidObj = cv2.VideoCapture(video_path)
    count = 0  # Total frames counter
    saved_count = 0  # Saved frames counter
    success = True

    while success:
        success, frame = vidObj.read()
        if success:
            # Save the frame only if it's at the specified interval
            if count % frame_interval == 0:
                frame_path = os.path.join(output_dir, f"frame{count}.png")
                cv2.imwrite(frame_path, frame, [cv2.IMWRITE_PNG_COMPRESSION, 0])
                saved_count += 1
                print("Processing", saved_count)
            count += 1

    return saved_count


@router.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image = PILImage.create(io.BytesIO(image_data))
        pred, pred_idx, probs = model.predict(image)
        return JSONResponse(
            content={
                "prediction": pred,
                "probabilities": {
                    model.dls.vocab[i]: float(probs[i]) for i in range(len(probs))
                },
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in prediction: {str(e)}")


@router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        with NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(await file.read())
            temp_video_path = temp_video.name

        # Directory to save extracted frames
        output_dir = "extracted_frames"

        # Extract frames
        frame_count = extract_frames(temp_video_path, output_dir)

        # Cleanup temporary file
        os.remove(temp_video_path)

        return JSONResponse(
            content={
                "message": f"Video processed successfully. {frame_count} frames extracted.",
                "output_directory": output_dir,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")




@router.post("/predict/video")
async def process_video(file: UploadFile = File(...), frame_interval: int = 3):
    """
    Processes a video file, extracts frames, makes predictions on each frame,
    stops if an accident is detected, and returns the accident frame details along with the image.

    Args:
        file (UploadFile): Video file uploaded by the user.
        frame_interval (int): Interval between frames to extract and predict.

    Returns:
        JSONResponse: Details of the accident frame if detected, or all predictions if no accident is found.
    """
    try:
        # Save the uploaded video file temporarily
        with NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(await file.read())
            temp_video_path = temp_video.name

        # Directory to save extracted frames
        output_dir = "extracted_frames"
        os.makedirs(output_dir, exist_ok=True)

        # Extract frames at the specified interval
        frame_count = extract_frames(temp_video_path, output_dir, frame_interval)

        # Make predictions on each extracted frame
        for frame_file in sorted(os.listdir(output_dir)):
            frame_path = os.path.join(output_dir, frame_file)
            try:
                # Load the frame as a PIL image
                image = PILImage.create(frame_path)

                # Predict the class and probabilities
                pred, pred_idx, probs = model.predict(image)

                # Check if the prediction indicates an accident
                if pred.lower() == "accident":
                    # Read the image file and send it as a byte stream
                    with open(frame_path, "rb") as img_file:
                        image_bytes = img_file.read()

                    # Cleanup: delete temporary video file and unprocessed frames
                    os.remove(temp_video_path)
                    for remaining_file in os.listdir(output_dir):
                        os.remove(os.path.join(output_dir, remaining_file))
                    os.rmdir(output_dir)

                    # Return the accident frame details along with the image
                    return StreamingResponse(
                        io.BytesIO(image_bytes),
                        media_type="image/jpeg",
                        headers={
                            "Content-Disposition": f"attachment; filename={frame_file}"
                        },
                        background=JSONResponse(
                            content={
                                "message": "Accident detected in the video.",
                                "accident_frame": {
                                    "filename": frame_file,
                                    "prediction": pred,
                                    "probabilities": {
                                        model.dls.vocab[i]: float(probs[i])
                                        for i in range(len(probs))
                                    },
                                },
                            }
                        ).background,
                    )

            except Exception as e:
                print(f"Error processing frame {frame_file}: {e}")

        # Cleanup: delete temporary video file and extracted frames if no accident is found
        os.remove(temp_video_path)
        for remaining_file in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, remaining_file))
        os.rmdir(output_dir)

        return JSONResponse(
            content={
                "message": "No accident detected in the video.",
                "frame_count": frame_count,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")
