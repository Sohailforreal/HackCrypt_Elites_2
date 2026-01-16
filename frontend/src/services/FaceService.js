import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

class FaceService {
    constructor() {
        this.modelsLoaded = false;
    }

    async loadModels() {
        if (this.modelsLoaded) return;

        try {
            console.log("Loading Face API Models...");
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), // Changed to TinyFace
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            console.log("Face API Models Loaded!");
            this.modelsLoaded = true;
        } catch (error) {
            console.error("Failed to load Face API models:", error);
            throw new Error("Failed to load Face Recognition models. Please ensure models are in /public/models.");
        }
    }

    async getFaceDescriptor(imageSrc) {
        if (!this.modelsLoaded) {
            await this.loadModels();
        }

        // Create an HTMLImageElement from the base64 source
        const img = await faceapi.fetchImage(imageSrc);

        // Detect single face with TinyFaceDetectorOptions
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            throw new Error("No face detected in the image.");
        }

        // detection.descriptor is a Float32Array (128 values)
        return Array.from(detection.descriptor);
    }
}

export const faceService = new FaceService();
