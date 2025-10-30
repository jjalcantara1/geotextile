import tensorflow as tf
from tensorflow.keras import Input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, LeakyReLU
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.linear_model import LogisticRegression
import numpy as np

class ANNModel:
    def __init__(self, input_dim, num_classes):
        self.input_dim = input_dim
        self.num_classes = num_classes
        self.model = None
        self.platt_scalers = None

    def build_model(self):
        """Build ANN model with explicit Input layer."""
        inputs = Input(shape=(self.input_dim,), name="input_layer")

        x = Dense(64)(inputs)
        x = LeakyReLU(negative_slope=0.1)(x)
        x = Dropout(0.3)(x)

        x = Dense(32)(x)
        x = LeakyReLU(negative_slope=0.1)(x)
        x = Dropout(0.2)(x)

        outputs = Dense(self.num_classes, activation="softmax", name="softmax_output")(x)

        self.model = Model(inputs=inputs, outputs=outputs, name="GeotextileANN")
        return self.model

    def compile_model(self):
        """Compile model."""
        self.model.compile(
            optimizer=Adam(learning_rate=1e-3),
            loss="categorical_crossentropy",
            metrics=["accuracy", "precision", "recall"]
        )

    def get_early_stopping(self):
        """Early stopping callback."""
        return EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

    def train(self, X_train, y_train, X_val, y_val):
        """Train model."""
        es = self.get_early_stopping()
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=150,
            batch_size=32,
            callbacks=[es],
            verbose=1
        )
        return history

    def save_model(self, path):
        """Save model."""
        self.model.save(path)

    def load_model(self, path):
        """Load model."""
        self.model = tf.keras.models.load_model(path)

    def get_logits_model(self):
        """Model that outputs logits (pre-softmax)."""
        from tensorflow.keras import Model

        if self.model is None:
            raise ValueError("Model not built yet.")

        # Use already-defined input tensor (safe now)
        x = self.model.layers[-2].output  # Get layer before softmax
        logits_output = Dense(self.num_classes, activation=None, name="logits_output")(x)

        logits_model = Model(inputs=self.model.input, outputs=logits_output)
        logits_model.set_weights(self.model.get_weights())
        return logits_model

    def predict_with_platt_scaling(self, X, val_logits, val_labels):
        """Predict with Platt scaling for calibration."""
        if self.platt_scalers is None:
            # Fit Platt scalers on validation data
            self.platt_scalers = []
            # Convert one-hot labels to class indices if necessary
            if val_labels.ndim > 1:
                val_labels_indices = np.argmax(val_labels, axis=1)
            else:
                val_labels_indices = val_labels
            for class_idx in range(self.num_classes):
                scaler = LogisticRegression(random_state=42)
                # Use one-vs-rest: target is 1 if this class, 0 otherwise
                y_binary = (val_labels_indices == class_idx).astype(int)
                scaler.fit(val_logits[:, class_idx].reshape(-1, 1), y_binary)
                self.platt_scalers.append(scaler)

        # Get logits for new data
        logits_model = self.get_logits_model()
        new_logits = logits_model.predict(X)

        # Apply Platt scaling
        calibrated_probs = np.zeros_like(new_logits)
        for class_idx in range(self.num_classes):
            prob = self.platt_scalers[class_idx].predict_proba(new_logits[:, class_idx].reshape(-1, 1))[:, 1]
            calibrated_probs[:, class_idx] = prob

        # Normalize to ensure probabilities sum to 1
        calibrated_probs = calibrated_probs / np.sum(calibrated_probs, axis=1, keepdims=True)
        return calibrated_probs
