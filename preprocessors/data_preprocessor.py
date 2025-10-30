import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import numpy as np
from dataset.constants import DATASET_PATH, TRAIN_SPLIT, VAL_SPLIT, TEST_SPLIT

class DataPreprocessor:
    def __init__(self):
        self.encoder = OneHotEncoder(sparse_output=False)
        self.feature_columns = [
            'Tensile Strength (kN/m)', 'Puncture Resistance (N)', 'Permittivity (s⁻¹)',
            'Filtration Efficiency (%)', 'Recycled Content (%)', 'Biobased Content (%)',
            'UV Strength Retained (% after 500h)', 'Material Cost (PHP/m²)', 'Installation Cost (PHP/m²)'
        ]
        self.target_column = 'Type'

    # =====================
    # Load Dataset
    # =====================
    def load_data(self):
        """Load the dataset from CSV."""
        self.df = pd.read_csv(DATASET_PATH)
        return self.df

    # =====================
    # Cluster Mapping
    # =====================
    def assign_clusters(self, df):
        """Assign expert-defined clusters (C1–C5) for each numeric property."""

        def tensile_cluster(x):
            if x <= 30: return "C1"
            elif x <= 60: return "C2"
            elif x <= 120: return "C3"
            elif x <= 200: return "C4"
            else: return "C5"

        def puncture_cluster(x):
            if x <= 600: return "C1"
            elif x <= 1000: return "C2"
            elif x <= 1400: return "C3"
            elif x <= 1800: return "C4"
            else: return "C5"

        def permittivity_cluster(x):
            if x <= 0.2: return "C1"
            elif x <= 0.5: return "C2"
            elif x <= 1.0: return "C3"
            elif x <= 1.5: return "C4"
            else: return "C5"

        def filtration_cluster(x):
            if x <= 75: return "C1"
            elif x <= 85: return "C2"
            elif x <= 90: return "C3"
            elif x <= 95: return "C4"
            else: return "C5"

        def recycled_cluster(x):
            if x == 0: return "C1"
            elif x <= 30: return "C2"
            elif x <= 60: return "C3"
            elif x <= 99: return "C4"
            else: return "C5"

        def biobased_cluster(x):
            if x == 0: return "C1"
            elif x <= 30: return "C2"
            elif x <= 70: return "C3"
            elif x <= 99: return "C4"
            else: return "C5"

        def uv_cluster(x):
            if x <= 30: return "C1"
            elif x <= 50: return "C2"
            elif x <= 70: return "C3"
            elif x <= 85: return "C4"
            else: return "C5"

        def material_cost_cluster(x):
            if x <= 100: return "C1"
            elif x <= 200: return "C2"
            elif x <= 400: return "C3"
            elif x <= 700: return "C4"
            else: return "C5"

        def install_cost_cluster(x):
            if x <= 50: return "C1"
            elif x <= 100: return "C2"
            elif x <= 200: return "C3"
            elif x <= 350: return "C4"
            else: return "C5"

        # Apply clusters
        df["Tensile Cluster"] = df["Tensile Strength (kN/m)"].apply(tensile_cluster)
        df["Puncture Cluster"] = df["Puncture Resistance (N)"].apply(puncture_cluster)
        df["Permittivity Cluster"] = df["Permittivity (s⁻¹)"].apply(permittivity_cluster)
        df["Filtration Cluster"] = df["Filtration Efficiency (%)"].apply(filtration_cluster)
        df["Recycled Cluster"] = df["Recycled Content (%)"].apply(recycled_cluster)
        df["Biobased Cluster"] = df["Biobased Content (%)"].apply(biobased_cluster)
        df["UV Cluster"] = df["UV Strength Retained (% after 500h)"].apply(uv_cluster)
        df["Material Cost Cluster"] = df["Material Cost (PHP/m²)"].apply(material_cost_cluster)
        df["Install Cost Cluster"] = df["Installation Cost (PHP/m²)"].apply(install_cost_cluster)

        return df

    # =====================
    # Encode target labels
    # =====================
    def encode_labels(self, y):
        """One-hot encode the target labels."""
        y_encoded = self.encoder.fit_transform(y.reshape(-1, 1))
        return y_encoded

    # =====================
    # Split Dataset
    # =====================
    def split_data(self, X, y_encoded):
        """Split data into train, validation, and test sets."""
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y_encoded, test_size=(VAL_SPLIT + TEST_SPLIT), random_state=42
        )
        val_size = VAL_SPLIT / (VAL_SPLIT + TEST_SPLIT)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=(1 - val_size), random_state=42
        )
        return X_train, X_val, X_test, y_train, y_val, y_test

    # =====================
    # Main Preprocessing Pipeline
    # =====================
    def preprocess(self):
        """Full preprocessing pipeline with cluster mapping and clean numeric encoding."""
        self.load_data()
        self.df = self.assign_clusters(self.df)

        # One-hot encode the cluster labels for ANN input
        cluster_columns = [
            "Tensile Cluster", "Puncture Cluster", "Permittivity Cluster",
            "Filtration Cluster", "Recycled Cluster", "Biobased Cluster",
            "UV Cluster", "Material Cost Cluster", "Install Cost Cluster"
        ]

        # Get only cluster columns + target
        df_clusters = self.df[cluster_columns + [self.target_column]].copy()

        # One-hot encode cluster columns
        df_encoded = pd.get_dummies(df_clusters, columns=cluster_columns)

        # Do not add missing columns; use only present ones to match trained model
        present_columns = [col for col in df_encoded.columns if col != self.target_column]
        df_encoded = df_encoded[present_columns + [self.target_column]]

        # Drop target column to form X, ensure all numeric
        X = df_encoded.drop(columns=[self.target_column]).astype(float).values

        # Encode target labels
        y = df_encoded[self.target_column].values
        y_encoded = self.encode_labels(y)

        return self.split_data(X, y_encoded)


    # =====================
    # Get Class Names
    # =====================
    def get_class_names(self):
        """Get the class names from the encoder."""
        return self.encoder.categories_[0]
