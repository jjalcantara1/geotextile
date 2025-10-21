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
            Dropout(0.25),

            Dense(128),
            LeakyReLU(alpha=0.1),
            Dropout(0.2),

            Dense(64),
            LeakyReLU(alpha=0.1),
            Dropout(0.15),

            Dense(32),
            LeakyReLU(alpha=0.1),
            Dropout(0.1),
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
