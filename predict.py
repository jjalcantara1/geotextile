import numpy as np
import tensorflow as tf
from preprocessors.data_preprocessor import DataPreprocessor
from scalers.scaler import DataScaler
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH

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

    # Scale the new data
    new_data_scaled = scaler.transform(new_data)

    # Predict with temperature scaling to reduce overconfidence
    logits = ann_model.model.predict(new_data_scaled, verbose=0)
    temperature = 2.0  # Temperature scaling factor
    scaled_logits = logits / temperature
    predictions = tf.nn.softmax(scaled_logits).numpy()
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
