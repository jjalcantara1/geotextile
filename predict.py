import numpy as np
import tensorflow as tf
from preprocessors.data_preprocessor import DataPreprocessor
from scalers.scaler import DataScaler
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH, VAL_LOGITS_PATH, VAL_LABELS_PATH

def main():
    # Initialize components
    preprocessor = DataPreprocessor()
    scaler = DataScaler()

    # Preprocess data first to fit encoder
    X_train, _, _, _, _, _ = preprocessor.preprocess()
    scaler.fit(X_train)

    num_classes = len(preprocessor.get_class_names())
    ann_model = ANNModel(input_dim=9, num_classes=num_classes)

    # Load model
    ann_model.load_model(MODEL_SAVE_PATH)

    # Example new data (using one from the sample dataset for demo)
    new_data = np.array([[20.9, 1431.47, 1.099, 94.2, 40, 0, 71.2, 62.15, 27.4]])  # Recycled PET Nonwoven

    # Apply log transformation to skewed features (same as in preprocessing)
    skewed_indices = [0, 1, 7, 8]  # Indices for Tensile Strength, Puncture Resistance, Material Cost, Installation Cost
    for idx in skewed_indices:
        new_data[0, idx] = np.log1p(new_data[0, idx])

    # Scale the new data
    new_data_scaled = scaler.transform(new_data)

    # Load validation data for Platt scaling
    val_logits = np.load(VAL_LOGITS_PATH)
    val_labels = np.load(VAL_LABELS_PATH)

    # Predict with Platt scaling
    predictions = ann_model.predict_with_platt_scaling(new_data_scaled, val_logits, val_labels)
    predicted_class_idx = np.argmax(predictions, axis=1)[0]
    confidence = np.max(predictions, axis=1)[0] * 100

    # Get class names
    class_names = preprocessor.get_class_names()
    predicted_type = class_names[predicted_class_idx]

    # Output
    print(f"Predicted Geotextile Type: {predicted_type}")
    print(f"Confidence Score: {confidence:.1f}%")

if __name__ == "__main__":
    main()
