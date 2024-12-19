from fastapi import FastAPI

# from Accident_Detection.route import router as accident_detection_router
from Traffic_Prediction.route import router as traffic_prediction_router

app = FastAPI()

# app.include_router(accident_detection_router, prefix="/api/accident", tags=["items"])
app.include_router(traffic_prediction_router, prefix="/api/traffic", tags=["items"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
