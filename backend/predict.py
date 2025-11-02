import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import json

def predict_cluster_input(input_clusters):
    """
    Predict geotextile type from 9 cluster-based parameters.
    Example input:
    {
        "Tensile Cluster": "C3",
        "Puncture Cluster": "C2",
        "Permittivity Cluster": "C1",
        "Filtration Cluster": "C3",
        "Recycled Cluster": "C4",
        "Biobased Cluster": "C2",
        "UV Cluster": "C3",
        "Material Cost Cluster": "C2",
        "Install Cost Cluster": "C1"
    }
    """

    # Load model, encoder, and feature metadata
    model = tf.keras.models.load_model("models/geotextile_ann.keras")
    encoder = joblib.load("models/label_encoder.pkl")

    with open("models/feature_columns.json", "r") as f:
        feature_columns = json.load(f)

    # Convert input into DataFrame
    df_input = pd.DataFrame([input_clusters])

    # One-hot encode using same cluster columns
    df_encoded = pd.get_dummies(df_input)

    # Add missing columns and align order
    for col in feature_columns:
        if col not in df_encoded.columns:
            df_encoded[col] = 0
    df_encoded = df_encoded[feature_columns]

    # Convert to numeric numpy array
    X_input = df_encoded.to_numpy(dtype=np.float32)

    # Predict
    y_pred = model.predict(X_input)

    # Convert prediction to label
    predicted_index = np.argmax(y_pred, axis=1)
    # Convert class index to one-hot vector
    one_hot = np.zeros((1, encoder.categories_[0].shape[0]))
    one_hot[0, predicted_index[0]] = 1

    # Decode the class name
    predicted_class = encoder.inverse_transform(one_hot)[0][0]


    # Print results
    print("\n===============================")
    print(f"🧠 Predicted Geotextile Type: {predicted_class}")
    print(f"Confidence Scores (%): {np.max(y_pred) * 100:.2f}%")    
    print("===============================")

    return predicted_class


if __name__ == "__main__":
    new_input = {
        "Tensile Cluster": "C3",
        "Puncture Cluster": "C2",
        "Permittivity Cluster": "C1",
        "Filtration Cluster": "C3",
        "Recycled Cluster": "C4",
        "Biobased Cluster": "C2",
        "UV Cluster": "C3",
        "Material Cost Cluster": "C2",
        "Install Cost Cluster": "C1"
    }

    predict_cluster_input(new_input)
