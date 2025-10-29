import numpy as np
import tensorflow as tf
import joblib
from tensorflow.keras.models import load_model

class ModelLoader:
    def __init__(self, model_path, encoder_path=None):
        self.model_path = model_path
        self.encoder_path = encoder_path

    def load(self):
        """Load trained model and optional encoder."""
        model = load_model(self.model_path)
        encoder = None
        if self.encoder_path:
            encoder = joblib.load(self.encoder_path)
        return model, encoder
