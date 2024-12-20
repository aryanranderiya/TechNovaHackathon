from math import floor

import joblib
import pandas as pd
import torch
import torch.nn as nn
from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse

# Load the min-max scaler
scaler = joblib.load("Traffic_Prediction/scaler.pkl")

# Load stations data
stations = pd.read_csv("Traffic_Prediction/processed_stations.csv")


class GRUTrafficPredictor(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, num_layers, dropout=0.2):
        super(GRUTrafficPredictor, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        # GRU Layer
        self.gru = nn.GRU(
            input_dim, hidden_dim, num_layers, batch_first=True, dropout=dropout
        )

        # Fully Connected Layer
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        # x: [batch_size, seq_len, input_dim]
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(
            x.device
        )  # Initialize hidden state
        out, _ = self.gru(x, h0)  # out: [batch_size, seq_len, hidden_dim]
        out = self.fc(out[:, -1, :])  # Get the output for the last time step
        return out


# Load the trained PyTorch model
model = GRUTrafficPredictor(
    input_dim=10, hidden_dim=128, output_dim=1, num_layers=2, dropout=0.2
)  # Adjust parameters
model.load_state_dict(
    torch.load("Traffic_Prediction/gru_traffic_model.pth", map_location="cpu")
)
model.eval()

# Initialize router
router = APIRouter()


@router.post("/predict/")
async def predict(
    station_id: int = Body(..., description="ID of the station", ge=1),
    datetime: str = Body(..., description="Datetime in the format YYYY-MM-DD HH:MM:SS"),
):
    """
    Predict endpoint that takes a station_id and datetime.
    Validates the inputs and returns predictions.
    """
    try:
        # Validate station_id
        if station_id not in stations["station_id"].values:
            raise HTTPException(
                status_code=404,
                detail=f"Station ID {station_id} not found in the dataset.",
            )

        # Validate datetime format
        try:
            pd.to_datetime(datetime, format="%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'.",
            )

        # Extract relevant features
        hour = pd.to_datetime(datetime).hour
        is_weekend = 1 if pd.to_datetime(datetime).dayofweek >= 5 else 0
        year = pd.to_datetime(datetime).year
        month = pd.to_datetime(datetime).month
        day = pd.to_datetime(datetime).day

        station_info = stations[stations["station_id"] == station_id].iloc[0]

        is_nation_highway = station_info["national_highway_system"] == "Y"
        number_of_lanes = station_info["number_of_lanes_monitored_for_traffic_volume"]
        functional_classification = station_info["functional_classification"]

        print(
            f"hour: {hour}, is_weekend: {is_weekend}, year: {year}, month: {month}, day: {day}, is_nation_highway: {is_nation_highway}, number_of_lanes: {number_of_lanes}, functional_classification: {functional_classification}"
        )

        # Encode functional classification
        functional_classification_1R = 1 if functional_classification == "1R" else 0
        functional_classification_1U = 1 if functional_classification == "1U" else 0
        functional_classification_2U = 1 if functional_classification == "2U" else 0

        input_data = [
            hour,
            is_weekend,
            is_nation_highway,
            number_of_lanes,
            0,  # target
            year,
            month,
            day,
            functional_classification_1R,
            functional_classification_1U,
            functional_classification_2U,
        ]

        # Normalize input data
        normalized_input = scaler.transform([input_data])[0].tolist()

        normalized_input = normalized_input[:5] + normalized_input[6:]

        # Create input tensor
        features = torch.tensor(
            [
                normalized_input,
            ],
            dtype=torch.float32,
        )

        # Make prediction
        with torch.no_grad():
            prediction = model(features.unsqueeze(0))

        # Extract predicted value
        predicted_value = prediction.item()

        # Inverse transform the predicted value
        predicted_value = scaler.inverse_transform(
            [[0] * 4 + [predicted_value] + [0] * 6]
        )[0][4]

        return JSONResponse(
            content={
                "station_id": station_id,
                "datetime": datetime,
                "prediction": floor(predicted_value / 10),
            }
        )

    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=f"Error in prediction: {str(e)}")
