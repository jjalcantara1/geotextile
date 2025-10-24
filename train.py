import numpy as np
import tensorflow as tf
import random
from sklearn.metrics import precision_score, recall_score, f1_score, mean_squared_error
from preprocessors.data_preprocessor import DataPreprocessor
from scalers.scaler import DataScaler
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH, EPOCHS, BATCH_SIZE, VAL_LOGITS_PATH, VAL_LABELS_PATH
from tensorflow.keras.callbacks import ReduceLROnPlateau

# ======= Reproducibility =======
tf.random.set_seed(42)
np.random.seed(42)
random.seed(42)

def main():
    # Initialize components
    preprocessor = DataPreprocessor()
    scaler = DataScaler()

    # Preprocess data
    X_train, X_val, X_test, y_train, y_val, y_test = preprocessor.preprocess()

    # Get number of classes from encoder
    num_classes = len(preprocessor.get_class_names())
    ann_model = ANNModel(input_dim=9, num_classes=num_classes)

    # Scale features
    scaler.fit(X_train)
    X_train_scaled = scaler.transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # Build and compile model
    ann_model.build_model()
    ann_model.compile_model()

    # Define callbacks
    early_stopping = ann_model.get_early_stopping()
    lr_scheduler = ReduceLROnPlateau(
        monitor='val_loss', factor=0.5, patience=6, min_lr=5e-5, verbose=1
    )

    # Train model with scheduler and early stopping
    history = ann_model.model.fit(
        X_train_scaled, y_train,
        validation_data=(X_val_scaled, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=[early_stopping, lr_scheduler],
        verbose=1
    )

    # Save model
    ann_model.save_model(MODEL_SAVE_PATH)

    # Save validation logits and labels for Platt scaling
    logits_model = ann_model.get_logits_model()
    val_logits = logits_model.predict(X_val_scaled, verbose=0)
    np.save(VAL_LOGITS_PATH, val_logits)
    np.save(VAL_LABELS_PATH, y_val)

    # Evaluate on test set
    test_loss, test_accuracy, test_precision, test_recall = ann_model.model.evaluate(X_test_scaled, y_test, verbose=0)

    # Predictions for additional metrics
    y_pred_prob = ann_model.model.predict(X_test_scaled)
    y_pred = np.argmax(y_pred_prob, axis=1)
    y_true = np.argmax(y_test, axis=1)

    # Compute metrics
    f1 = f1_score(y_true, y_pred, average='weighted')
    rmse = np.sqrt(mean_squared_error(y_test.flatten(), y_pred_prob.flatten()))

    # ======= PRINT SUMMARY =======
    print("\n===============================")
    print("📊 MODEL PERFORMANCE SUMMARY")
    print("===============================")
    print(f"Accuracy:  {test_accuracy * 100:.2f}%")
    print(f"Precision: {test_precision * 100:.2f}%")
    print(f"Recall:    {test_recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print(f"Loss:      {test_loss:.3f}")
    print(f"RMSE:      {rmse:.3f}")
    print("===============================\n")

if __name__ == "__main__":
    main()
