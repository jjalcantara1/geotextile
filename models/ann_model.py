from tensorflow.keras import Input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, LeakyReLU
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np

class ANNModel:
    def __init__(self, input_dim, num_classes):
        self.input_dim = input_dim
        self.num_classes = num_classes
        self.model = None

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
