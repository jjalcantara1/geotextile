import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, mean_squared_error
from preprocessors.data_preprocessor import DataPreprocessor
from scalers.scaler import DataScaler
from models.ann_model import ANNModel
from dataset.constants import MODEL_SAVE_PATH

def main():
    # Initialize components
    preprocessor = DataPreprocessor()
    scaler = DataScaler()

    # Preprocess data first to fit encoder
    X_train, X_val, X_test, y_train, y_val, y_test = preprocessor.preprocess()

    # Now get num_classes after encoder is fitted
    num_classes = len(preprocessor.get_class_names())
    ann_model = ANNModel(input_dim=9, num_classes=num_classes)

    # Scale data
    scaler.fit(X_train)
    X_train_scaled = scaler.transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # Build and compile model
    ann_model.build_model()
    ann_model.compile_model()

    # Train model
    history = ann_model.train(X_train_scaled, y_train, X_val_scaled, y_val)

    # Save model
    ann_model.save_model(MODEL_SAVE_PATH)

    # Evaluate on test set
    test_loss, test_accuracy, test_precision, test_recall = ann_model.model.evaluate(X_test_scaled, y_test, verbose=0)

    # Predictions for additional metrics
    y_pred_prob = ann_model.model.predict(X_test_scaled)
    y_pred = np.argmax(y_pred_prob, axis=1)
    y_true = np.argmax(y_test, axis=1)

    f1 = f1_score(y_true, y_pred, average='weighted')
    rmse = np.sqrt(mean_squared_error(y_test.flatten(), y_pred_prob.flatten()))

    # Print metrics
    print("Model Performance:")
    print(f"Accuracy: {test_accuracy * 100:.1f}%")
    print(f"Precision: {test_precision * 100:.1f}%")
    print(f"Recall: {test_recall * 100:.1f}%")
    print(f"F1-Score: {f1 * 100:.1f}%")
    print(f"Loss: {test_loss:.3f}")
    print(f"RMSE: {rmse:.3f}")

if __name__ == "__main__":
    main()
