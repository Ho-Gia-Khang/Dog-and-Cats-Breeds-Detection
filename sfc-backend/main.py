import cv2
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

def load_cnn_model():
    model = tf.keras.models.load_model(r'../models/CNN.h5', compile=False)
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])
    return model

cnn_model = load_cnn_model()

@app.post("api/upload/cnn")
async def predict_cnn(file: UploadFile = File(...)):
    file_size = len(file.file.read())
    file.file.seek(0)

    pil_img = Image.open(file.file)

    pred_img = np.array(pil_img)
    pred_img = cv2.imread(pred_img, cv2.COLOR_BGR2RGB)
    pred_img = cv2.resize(pred_img, (128, 128))
    pred_img = np.reshape(pred_img, (1, 128, 128, 1)) / 255.0

    result = cnn_model.predict(pred_img)

    message = ""
    if result < 0.5:
        message = "Real"
    else:
        message = "Forge"

    result = result * 100
    result = np.round(result, 2)
    
    return JSONResponse(content={"result": result, "message": message}, status_code=200)

@app.get("/")
async def root():
    return {"message": "Hello from backend!"}