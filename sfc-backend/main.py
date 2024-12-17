from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from keras.preprocessing import image
import numpy as np
from PIL import Image

import os
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '1'

import tensorflow as tf


origins = [
    "http://localhost:3000",
    # "localhost:3000",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class_names = [
    "Abyssinian", "American Bulldog", "American Pit Bull Terrier", "Basset Hound", "Beagle", 
    "Bengal", "Birman", "Bombay", "Boxer", "British Shorthair", 
    "Chihuahua", "Egyptian Mau", "English Cocker Spaniel", "English Setter", "German Shorthaired", 
    "Great Pyrenees", "Havanese", "Japanese Chin", "Keeshond", "Leonberger", 
    "Maine Coon", "Miniature Pinscher", "Newfoundland", "Persian", "Pomeranian", 
    "Pug", "Ragdoll", "Russian Blue", "Saint Bernard", "Samoyed", 
    "Scottish Terrier", "Shiba Inu", "Siamese", "Sphynx", "Staffordshire Bull Terrier", 
    "Wheaten Terrier", "Yorkshire Terrier"
]

def load_resnet_model():
    model = tf.keras.models.load_model(r'../models/ResNet50_V2.keras', compile=False)
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['CategoricalAccuracy'])
    return model

def load_mobilenet_model():
    model = tf.keras.models.load_model(r'../models/MobileNet_V2.keras', compile=False)
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['CategoricalAccuracy'])
    return model

def load_inception_model():
    model = tf.keras.models.load_model(r'../models/Inception_V3.keras', compile=False)
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['CategoricalAccuracy'])
    return model

def preprocess_image(image_path, size):
    image_path = image_path.resize(size)  # Resize image
    image_array = image.img_to_array(image_path)  # Convert to numpy array
    image_array = tf.expand_dims(image_array, 0)  # Add batch dimension
    return image_array

def predict_image(model, image_array):
    predictions = model.predict(image_array)
    predicted_class_index = np.argmax(predictions[0])  # Get the index of the highest probability
    predicted_class = class_names[predicted_class_index]
    confidence = float(np.max(predictions[0]))
    return {"predicted_class": predicted_class, "confidence": confidence}

resnet_model = load_resnet_model()
mobilenet_model = load_mobilenet_model()
inception_model = load_inception_model()

@app.post("/api/upload/resnet")
async def predict_resnet(file: UploadFile = File(...)):
    # Check file size
    file_size_mb = len(await file.read()) / (1024 * 1024)
    file.file.seek(0)  # Reset file pointer to beginning

    print(f"Received file: {file.filename}, Content-Type: {file.content_type}, Size: {file_size_mb:.2f} MB")

    pil_image = Image.open(file.file)
    pil_image = pil_image.convert("RGB")  # Ensure the image is in RGB mode

    image_array = preprocess_image(pil_image, (224, 224))  # ResNet50 expects 224x224 images

    prediction = predict_image(resnet_model, image_array)

    return JSONResponse(content={"prediction": prediction})

@app.post("/api/upload/mobilenet")
async def predict_mobilenet(file: UploadFile = File(...)):
    file_size_mb = len(await file.read()) / (1024 * 1024)
    file.file.seek(0)

    print(f"Received file: {file.filename}, Content-Type: {file.content_type}, Size: {file_size_mb:.2f} MB")

    pil_image = Image.open(file.file)
    pil_image = pil_image.convert("RGB")

    image_array = preprocess_image(pil_image, (224, 224)) # MobileNetV2 expects 224x224 images

    prediction = predict_image(mobilenet_model, image_array)

    return JSONResponse(content={"prediction": prediction})

@app.post("/api/upload/inception")
async def predict_inception(file: UploadFile = File(...)):
    file_size_mb = len(await file.read()) / (1024 * 1024)
    file.file.seek(0)

    print(f"Received file: {file.filename}, Content-Type: {file.content_type}, Size: {file_size_mb:.2f} MB")

    pil_image = Image.open(file.file)
    pil_image = pil_image.convert("RGB")

    image_array = preprocess_image(pil_image, (299, 299))

    prediction = predict_image(inception_model, image_array)

    return JSONResponse(content={"prediction": prediction})

@app.get("/")
async def root():
    return {"message": "Hello from backend!"}