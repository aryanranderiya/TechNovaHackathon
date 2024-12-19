import io

from fastai.vision.all import PILImage, load_learner
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

accident_model = load_learner("model.pkl")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://vigilant-broccoli-g64rw5j9v47fp94w-3000.app.github.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict/accident")
async def predict(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image = PILImage.create(io.BytesIO(image_data))
        pred, pred_idx, probs = accident_model.predict(image)
        return JSONResponse(
            content={
                "prediction": pred,
                "probabilities": {
                    accident_model.dls.vocab[i]: float(probs[i])
                    for i in range(len(probs))
                },
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in prediction: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
