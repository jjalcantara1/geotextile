from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from preprocessors.data_preprocessor import DataPreprocessor
from scalers.scaler import DataScaler
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
preprocessor = DataPreprocessor()
scaler = DataScaler()

# Preprocess data first to fit encoder
X_train, _, _, _, _, _ = preprocessor.preprocess()
scaler.fit(X_train)

num_classes = len(preprocessor.get_class_names())
ann_model = ANNModel(input_dim=9, num_classes=num_classes)
ann_model.load_model(MODEL_SAVE_PATH)

class_names = preprocessor.get_class_names()

# Brief descriptions for each type (you can expand these)
descriptions = {
    'Recycled PET Nonwoven': 'A nonwoven geotextile made from recycled PET, offering good filtration and cost-effectiveness.',
    'PET Woven': 'Woven geotextile from PET, known for high tensile strength and durability.',
    'Hybrid (PP+Coir)': 'Hybrid material combining polypropylene and coir, providing strength and biodegradability.',
    'PP Woven': 'Polypropylene woven geotextile, excellent for reinforcement and separation.',
    'Glass Fiber Composite': 'Composite with glass fibers, ideal for high-strength applications.',
    'PP Nonwoven': 'Nonwoven polypropylene geotextile, versatile for drainage and filtration.',
    'Coir Woven': 'Woven coir geotextile, biodegradable and eco-friendly.',
    'PLA Nonwoven': 'Nonwoven from PLA, a bio-based polymer with good environmental profile.',
    'HDPE Grid': 'HDPE geogrid, used for soil stabilization and reinforcement.'
}

class PredictionRequest(BaseModel):
    features: List[float]

@app.post("/predict")
def predict(request: PredictionRequest):
    print("Received prediction request with features:", request.features)
    if len(request.features) != 9:
        raise HTTPException(status_code=400, detail="Exactly 9 features required")

    # Convert to numpy array
    new_data = np.array(request.features).reshape(1, -1)

    # Scale the new data
    new_data_scaled = scaler.transform(new_data)

    # Predict
    predictions = ann_model.model.predict(new_data_scaled)
    predicted_class_idx = int(np.argmax(predictions, axis=1)[0])
    confidence = float(np.max(predictions, axis=1)[0] * 100)

    predicted_type = class_names[predicted_class_idx]
    description = descriptions.get(predicted_type, "No description available")

    print("Predicted:", predicted_type, "Confidence:", confidence)
    return {
        "predicted_type": str(predicted_type),
        "confidence": round(confidence, 2),
        "description": str(description)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
