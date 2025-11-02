# Geotextile Recommendation

An AI-powered web application for recommending geotextile materials based on their physical properties using an Artificial Neural Network (ANN) model. The system predicts the most suitable geotextile type from 9 different categories with calibrated confidence scores.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Model Architecture](#model-architecture)
- [Dataset](#dataset)
- [Preprocessing](#preprocessing)
- [Training](#training)
- [Calibration](#calibration)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Frontend](#frontend)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project implements a machine learning solution for geotextile material classification. Geotextiles are synthetic materials used in civil engineering for applications like soil stabilization, drainage, and erosion control. The system takes 9 key physical properties as input and predicts the appropriate geotextile type with high accuracy.

The application consists of:
- **Backend**: FastAPI server with TensorFlow/Keras ANN model
- **Frontend**: React-based web interface with real-time prediction
- **Model**: Calibrated ANN classifier with Platt scaling for reliable confidence scores

## Features

- **9 Geotextile Types Classification**:
  - Recycled PET Nonwoven
  - PET Woven
  - Hybrid (PP+Coir)
  - PP Woven
  - Glass Fiber Composite
  - PP Nonwoven
  - Coir Woven
  - PLA Nonwoven
  - HDPE Grid

- **9 Input Features**:
  - Tensile Strength (kN/m)
  - Puncture Resistance (N)
  - Permittivity (s⁻¹)
  - Filtration Efficiency (%)
  - Recycled Content (%)
  - Biobased Content (%)
  - UV Strength Retained (% after 500h)
  - Material Cost (PHP/m²)
  - Installation Cost (PHP/m²)

- **Advanced ML Techniques**:
  - Expert-defined clustering (C1-C5) for feature discretization
  - One-hot encoding for categorical features
  - ANN with dropout regularization
  - Platt scaling for probability calibration
  - Early stopping and learning rate scheduling

## Model Architecture

### Neural Network Structure

```
Input Layer (42 features) → Dense(64) → LeakyReLU → Dropout(0.3)
                       ↓
Dense(32) → LeakyReLU → Dropout(0.2)
                       ↓
Dense(9) → Softmax Output
```

### Key Specifications

- **Input Dimension**: 42 (9 features × 5 clusters each, one-hot encoded)
- **Hidden Layers**: 2 fully connected layers
- **Activation Functions**: LeakyReLU (negative_slope=0.1) for hidden layers
- **Regularization**: Dropout (0.3, 0.2) to prevent overfitting
- **Output**: 9-class softmax classification
- **Loss Function**: Categorical Cross-Entropy
- **Optimizer**: Adam (learning_rate=1e-3)
- **Early Stopping**: Monitor validation loss, patience=10
- **Learning Rate Scheduler**: Reduce on plateau, factor=0.5, patience=6

### Training Configuration

- **Epochs**: Up to 150 (early stopping enabled)
- **Batch Size**: 16
- **Validation Split**: 15%
- **Test Split**: 15%
- **Reproducibility**: Fixed seeds (42) for TensorFlow, NumPy, and Python random

## Dataset

### Source
The dataset (`geotextile.csv`) contains real-world geotextile material specifications with 9 physical properties and corresponding material types.

### Statistics
- **Total Samples**: ~100 entries
- **Features**: 9 continuous numerical properties
- **Target Classes**: 9 geotextile types
- **Data Split**: 70% train, 15% validation, 15% test

### Feature Distribution
Each feature is discretized into 5 expert-defined clusters (C1-C5) representing performance ranges:

- **Tensile Strength**: C1 (≤30) → C5 (>200) kN/m
- **Puncture Resistance**: C1 (≤600) → C5 (>1800) N
- **Permittivity**: C1 (≤0.2) → C5 (>1.5) s⁻¹
- **Filtration Efficiency**: C1 (≤75) → C5 (>95) %
- **Recycled Content**: C1 (0%) → C5 (>99) %
- **Biobased Content**: C1 (0%) → C5 (>99) %
- **UV Strength**: C1 (≤35) → C5 (>90) % retained
- **Material Cost**: C1 (≤50) → C5 (>500) PHP/m²
- **Installation Cost**: C1 (≤20) → C5 (>250) PHP/m²

## Preprocessing

### Clustering Pipeline
1. **Expert Clustering**: Each continuous feature mapped to discrete clusters (C1-C5)
2. **One-Hot Encoding**: Convert cluster labels to binary vectors
3. **Feature Alignment**: Ensure consistent 42-dimensional input vector
4. **Scaling**: MinMaxScaler applied to normalized features

### Data Flow
```
Raw Features → Clustering → One-Hot Encoding → Scaling → ANN Input (42D)
```

## Training

### Process
1. Load and preprocess dataset with clustering
2. Split data (70/15/15 train/val/test)
3. Build and compile ANN model
4. Train with early stopping and LR scheduling
5. Save trained model and preprocessing artifacts

### Performance Monitoring
- **Metrics**: Accuracy, Precision, Recall, F1-Score
- **Validation**: Real-time monitoring during training
- **Early Stopping**: Prevents overfitting
- **Learning Rate**: Adaptive adjustment for convergence

### Saved Artifacts
- `geotextile_ann.keras`: Trained TensorFlow model
- `label_encoder.pkl`: Class label encoder
- `feature_columns.json`: Feature column mapping
- `val_logits.npy` & `val_labels.npy`: Validation data for calibration

## Calibration

### Platt Scaling
The model uses Platt scaling for probability calibration to provide reliable confidence scores:

1. **Training Phase**: Fit logistic regression scalers on validation logits
2. **Inference Phase**: Apply scalers to new predictions
3. **Normalization**: Ensure calibrated probabilities sum to 1

### Benefits
- **Reliable Confidence**: Calibrated probability estimates
- **Better Decision Making**: Accurate uncertainty quantification
- **Robust Predictions**: Improved generalization to new data

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Usage

### Training the Model
```bash
cd backend
python train.py
```

### Running the Backend Server
```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Running the Frontend
```bash
cd frontend
npm run dev
```

### Accessing the Application
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

## API Endpoints

### GET `/welcome`
Returns a welcome message.

**Response**:
```json
{
  "message": "Welcome to the Geotextile Predictor API!"
}
```

### POST `/predict`
Predicts geotextile type based on input properties.

**Request Body**:
```json
{
  "clusters": {
    "Tensile Cluster": "C3",
    "Puncture Cluster": "C4",
    "Permittivity Cluster": "C2",
    "Filtration Cluster": "C4",
    "Recycled Cluster": "C2",
    "Biobased Cluster": "C1",
    "UV Cluster": "C4",
    "Material Cost Cluster": "C3",
    "Install Cost Cluster": "C2"
  }
}
```

**Response**:
```json
{
  "predicted_type": "PET Woven",
  "confidence": 87.5,
  "description": "PET Woven is a woven geotextile from PET, known for high tensile strength and durability."
}
```

## Frontend

### Technologies
- **React 19**: Modern JavaScript library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication

### Features
- **Interactive Form**: Cluster-based input selection
- **Real-time Prediction**: Instant results with confidence scores
- **Responsive Design**: Mobile-friendly interface
- **Material Descriptions**: Detailed information for each geotextile type

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **TensorFlow/Keras**: Deep learning framework
- **scikit-learn**: Machine learning utilities
- **pandas**: Data manipulation
- **NumPy**: Numerical computing
- **joblib**: Model serialization

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP requests

### Development Tools
- **Python 3.8+**: Backend runtime
- **Node.js 16+**: Frontend runtime
- **Git**: Version control

## Project Structure

```
geotextile/
├── backend/
│   ├── app.py                 # FastAPI application
│   ├── train.py              # Model training script
│   ├── predict.py            # Prediction utilities
│   ├── logger.py             # Logging configuration
│   ├── requirements.txt      # Python dependencies
│   ├── dataset/
│   │   ├── geotextile.csv    # Dataset
│   │   └── constants.py      # Configuration constants
│   ├── models/
│   │   ├── ann_model.py      # ANN model class
│   │   ├── geotextile_ann.keras  # Trained model
│   │   ├── label_encoder.pkl # Label encoder
│   │   ├── feature_columns.json # Feature mapping
│   │   ├── val_logits.npy    # Validation logits
│   │   └── val_labels.npy    # Validation labels
│   ├── preprocessors/
│   │   └── data_preprocessor.py  # Data preprocessing
│   ├── scalers/
│   │   └── scaler.py         # Feature scaling
│   └── utils/
│       └── loaders.py        # Model loading utilities
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── Chatbot.jsx       # Prediction interface
│   │   ├── TypingIndicator.jsx  # Loading indicator
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # React entry point
│   ├── public/
│   │   └── maroon.png        # Logo
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── README.md                 # This file
└── .gitignore               # Git ignore rules
```


**Note**: This system is designed for research and educational purposes. For production use, additional validation and testing should be performed.
