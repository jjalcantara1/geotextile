klearns# TODO List for ANN Geotextile Classifier

- [x] Create dataset/constants.py: Define general constants like CSV path, hyperparameters (e.g., train/val/test split ratios, learning rate, epochs, batch size).
- [x] Create preprocessors/data_preprocessor.py: Load CSV data, one-hot encode labels, split into train/val/test (70/15/15).
- [x] Create scalers/scaler.py: Implement normalization using MinMaxScaler.
- [x] Create models/ann_model.py: Build the ANN model (Input 9, Dense 32 ReLU, Dense 16 ReLU, Dropout 0.2, Output softmax).
- [x] Create train.py: Main script to preprocess data, train model, save as .keras, evaluate and print metrics.
- [x] Create predict.py: Script for inference on new data, output predicted type and confidence score.
- [x] Install TensorFlow if not present (pip install tensorflow).
- [x] Run train.py to train and save model.
- [ ] Run train.py to train and save model.
- [ ] Run predict.py for example prediction.
