import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'geotextile.csv')

# Hyperparameters
TRAIN_SPLIT = 0.7
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15

LEARNING_RATE = 0.001
EPOCHS = 150
BATCH_SIZE = 16
EARLY_STOPPING_PATIENCE = 10

# Model save path
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'geotextile_ann.keras')
