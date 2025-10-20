import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import pandas as pd
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

    def load_data(self):
        """Load the dataset from CSV."""
        self.df = pd.read_csv(DATASET_PATH)
        return self.df

    def encode_labels(self, y):
        """One-hot encode the target labels."""
        y_encoded = self.encoder.fit_transform(y.reshape(-1, 1))
        return y_encoded

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

    def preprocess(self):
        """Full preprocessing pipeline."""
        self.load_data()
        X = self.df[self.feature_columns].values
        y = self.df[self.target_column].values
        y_encoded = self.encode_labels(y)
        return self.split_data(X, y_encoded)

    def get_class_names(self):
        """Get the class names from the encoder."""
        return self.encoder.categories_[0]
