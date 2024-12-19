from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from Accident_Detection.route import router as accident_detection_router
from Traffic_Prediction.route import router as traffic_router
from Accident_Detection.route import router as accident_router
from Driver_Drowsiness.route import router as driver_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vigilant-broccoli-g64rw5j9v47fp94w-3000.app.github.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(traffic_router, prefix="/api/traffic", tags=["Traffic Prediction"])
app.include_router(accident_router, prefix="/api/accident", tags=["Accident Detection"])
app.include_router(driver_router, prefix="/api/drowsiness", tags=["Driver Drowsiness"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
