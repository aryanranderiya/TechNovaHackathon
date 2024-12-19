import io

from fastai.vision.all import PILImage, load_learner
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

router = APIRouter()

model = load_learner("Accident_Detection/model.pkl")


@router.post("/predict/")
async def predict(file: UploadFile = File(...)):
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
