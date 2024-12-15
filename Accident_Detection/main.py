from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from fastai.vision.all import load_learner, PILImage
import io

app = FastAPI()

model = load_learner("model.pkl")


@app.post("/predict/")
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
