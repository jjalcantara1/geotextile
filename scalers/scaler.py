from sklearn.preprocessing import MinMaxScaler
import numpy as np

class DataScaler:
    def __init__(self):
        self.scaler = MinMaxScaler()

    def fit(self, X_train):
        """Fit the scaler on training data."""
        self.scaler.fit(X_train)

    def transform(self, X):
        """Transform data using the fitted scaler."""
        return self.scaler.transform(X)

    def fit_transform(self, X):
        """Fit and transform data."""
        return self.scaler.fit_transform(X)

    def inverse_transform(self, X_scaled):
        """Inverse transform scaled data back to original scale."""
        return self.scaler.inverse_transform(X_scaled)
