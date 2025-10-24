

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Input, BatchNormalization, LeakyReLU
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from dataset.constants import LEARNING_RATE, EPOCHS, BATCH_SIZE, EARLY_STOPPING_PATIENCE
import numpy as np

class ANNModel:
    def __init__(self, input_dim, num_classes):
        self.input_dim = input_dim
        self.num_classes = num_classes
        self.model = None


    def build_model(self):
        """Build the ANN model."""
        self.model = Sequential([
            Dense(256, input_dim=self.input_dim),
            LeakyReLU(alpha=0.1),
            Dropout(0.4),

            Dense(128),
            LeakyReLU(alpha=0.1),
            Dropout(0.3),

            Dense(64),
            LeakyReLU(alpha=0.1),
            Dropout(0.2),

            Dense(32),
            LeakyReLU(alpha=0.1),
            Dense(self.num_classes, activation='softmax')
        ])
        return self.model

    def compile_model(self):
        """Compile the model with optimizer and loss."""
        self.model.compile(
            optimizer=Adam(learning_rate=LEARNING_RATE),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )

    def get_early_stopping(self):
        """Get early stopping callback."""
        return EarlyStopping(
            monitor='val_loss',
            patience=EARLY_STOPPING_PATIENCE,
            restore_best_weights=True
        )

    def train(self, X_train, y_train, X_val, y_val):
        """Train the model."""
        early_stopping = self.get_early_stopping()
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            callbacks=[early_stopping],
            verbose=1
        )
        return history

    def save_model(self, path):
        """Save the model."""
        self.model.save(path)

    def load_model(self, path):
        """Load the model."""
        from tensorflow.keras.models import load_model
        self.model = load_model(path)
        return self.model

    def get_logits_model(self):
        """Create a model that outputs logits (without softmax)."""
        if self.model is None:
            raise ValueError("Model not loaded")
        # Create a new model with the same layers but last layer without activation
        logits_model = Sequential()
        for layer in self.model.layers[:-1]:
            logits_model.add(layer)
        # Add the last layer without activation, with a unique name
        last_layer = self.model.layers[-1]
        logits_layer = Dense(last_layer.units, activation=None, name='logits_output')
        logits_model.add(logits_layer)
        # Build the model to initialize weights
        logits_model.build((None, self.input_dim))
        # Copy weights layer by layer, but set weights for the new logits layer separately
        for i, layer in enumerate(self.model.layers[:-1]):
            logits_model.layers[i].set_weights(layer.get_weights())
        # Set weights for the logits layer from the original last layer (kernel and bias)
        logits_model.layers[-1].set_weights(last_layer.get_weights())
        return logits_model

    def predict_with_temperature(self, X, temperature=2.0):
        """Predict with temperature scaling to soften confidence scores."""
        # Get logits directly from the model by predicting and inverting softmax
        predictions = self.model.predict(X, verbose=0)
        # Approximate logits from predictions (inverse softmax)
        logits = np.log(predictions + 1e-7)  # Add small epsilon to avoid log(0)
        # Apply temperature scaling
        scaled_logits = logits / temperature
        # Apply softmax
        exp_logits = np.exp(scaled_logits - np.max(scaled_logits, axis=1, keepdims=True))
        scaled_predictions = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)
        return scaled_predictions

    def predict_with_platt_scaling(self, X, val_logits=None, val_labels=None):
        """Predict with Platt scaling calibration."""
        if val_logits is None or val_labels is None:
            # If no validation data provided, fall back to temperature scaling
            return self.predict_with_temperature(X, temperature=2.0)

        # Fit logistic regression on validation logits
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import StandardScaler

        # Get logits for validation data
        logits_model = self.get_logits_model()
        val_logits_pred = logits_model.predict(val_logits, verbose=0)

        # Fit Platt scaling (logistic regression on logits)
        scaler = StandardScaler()
        val_logits_scaled = scaler.fit_transform(val_logits_pred.reshape(-1, 1))

        platt_model = LogisticRegression(random_state=42)
        platt_model.fit(val_logits_scaled, val_labels.argmax(axis=1))

        # Predict on new data
        logits = logits_model.predict(X, verbose=0)
        logits_scaled = scaler.transform(logits.reshape(-1, 1))
        calibrated_probs = platt_model.predict_proba(logits_scaled)

        return calibrated_probs
