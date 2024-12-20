import os
import io
import cv2
from fastai.vision.all import PILImage, load_learner
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from tempfile import NamedTemporaryFile
from fastapi.responses import StreamingResponse
from PIL import Image

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


@router.post("/predict/video")
async def process_video(file: UploadFile = File(...), frame_interval: int = 3):
    try:
        # Save the uploaded video file temporarily
        with NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            temp_video.write(await file.read())
            temp_video_path = temp_video.name

        # Directory to save extracted frames
        output_dir = "extracted_frames"
        os.makedirs(output_dir, exist_ok=True)

        # Extract frames at the specified interval
        frame_count = extract_frames(
            temp_video_path, output_dir, frame_interval
        )  # Fixed: added output_dir parameter

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
                    # Return just the prediction result and filename
                    accident_info = {
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

                    # Don't delete the frames yet since we need to serve the image
                    # Just delete the temp video file
                    os.remove(temp_video_path)
                    return JSONResponse(content=accident_info)

            except Exception as e:
                print(f"Error processing frame {frame_file}: {e}")

        # Cleanup if no accident found
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
        # Cleanup in case of error
        if "temp_video_path" in locals():
            os.remove(temp_video_path)
        if os.path.exists(output_dir):
            for file in os.listdir(output_dir):
                os.remove(os.path.join(output_dir, file))
            os.rmdir(output_dir)
        raise HTTPException(status_code=400, detail=f"Error processing video: {str(e)}")


@router.get("/frames/{filename}")
async def get_frame(filename: str):
    try:
        frame_path = os.path.join("extracted_frames", filename)
        if not os.path.exists(frame_path):
            raise HTTPException(status_code=404, detail="Frame not found")

        # Open the image and compress it
        with Image.open(frame_path) as img:
            # Compress the image (you can adjust the quality parameter)
            img_io = io.BytesIO()
            img.save(img_io, format="JPEG", quality=75)  # Adjust quality as needed
            img_io.seek(0)

        return StreamingResponse(
            img_io,
            media_type="image/jpeg",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving frame: {str(e)}")
