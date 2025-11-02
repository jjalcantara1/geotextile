import numpy as np
import tensorflow as tf
import random
import pandas as pd   # ✅ Added this line
import json
from sklearn.metrics import f1_score, mean_squared_error
from sklearn.model_selection import train_test_split
from preprocessors.data_preprocessor import DataPreprocessor
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH, EPOCHS, BATCH_SIZE, VAL_LOGITS_PATH, VAL_LABELS_PATH
from tensorflow.keras.callbacks import ReduceLROnPlateau
import joblib

# ======= Reproducibility =======
tf.random.set_seed(42)
np.random.seed(42)
random.seed(42)

def main():
    # Initialize preprocessor with clustering
    preprocessor = DataPreprocessor()
    df = preprocessor.load_data()
    df = preprocessor.assign_clusters(df)

    # Define the cluster columns
    cluster_columns = [
        "Tensile Cluster", "Puncture Cluster", "Permittivity Cluster",
        "Filtration Cluster", "Recycled Cluster", "Biobased Cluster",
        "UV Cluster", "Material Cost Cluster", "Install Cost Cluster"
    ]

    # Prepare features and labels
    X = df[cluster_columns]
    y = preprocessor.encode_labels(df[preprocessor.target_column].values)

    # One-hot encode cluster columns
    X = pd.get_dummies(X, columns=cluster_columns)

    # Split into train/val/test
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    # Build and compile model
    num_classes = len(preprocessor.get_class_names())
    ann_model = ANNModel(input_dim=X_train.shape[1], num_classes=num_classes)
    ann_model.build_model()
    ann_model.compile_model()

    # Train model
    early_stopping = ann_model.get_early_stopping()
    lr_scheduler = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=6, min_lr=5e-5, verbose=1)

    history = ann_model.model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[early_stopping, lr_scheduler],
        verbose=1
    )

    # Save model and encoder
    ann_model.save_model(MODEL_SAVE_PATH)
    joblib.dump(preprocessor.encoder, "models/label_encoder.pkl")

    # Save feature columns for prediction alignment
    feature_columns = list(X.columns)
    with open("models/feature_columns.json", "w") as f:
        json.dump(feature_columns, f)

    print("\n✅ Model and encoder saved successfully!")
    print(f"Feature columns: {len(feature_columns)} total")

if __name__ == "__main__":
    main()
