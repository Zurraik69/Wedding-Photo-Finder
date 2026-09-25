import sys
import cv2
import numpy as np
import urllib.request
import os
import json


# ============================================
# Helper: Send logs to stderr
# ============================================

def log(message):
    print(message, file=sys.stderr)


# ============================================
# 1. Image Input
# ============================================

if len(sys.argv) < 2:

    print(
        json.dumps({
            "success": False,
            "error": "Image URL or file path is required."
        })
    )

    sys.exit(1)


image_input = sys.argv[1].strip()


if not image_input:

    print(
        json.dumps({
            "success": False,
            "error": "Image URL or file path is required."
        })
    )

    sys.exit(1)


# ============================================
# 2. Load Image
# ============================================

image = None


try:

    # ----------------------------------------
    # Cloudinary / HTTP URL
    # ----------------------------------------

    if (
        image_input.startswith("http://")
        or image_input.startswith("https://")
    ):

        log("\nDownloading image...")

        response = urllib.request.urlopen(
            image_input
        )

        image_data = response.read()

        log(
            "Image downloaded successfully."
        )


        image_array = np.frombuffer(
            image_data,
            np.uint8
        )


        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )


    # ----------------------------------------
    # Local File Path
    # ----------------------------------------

    else:

        log(
            "\nLoading local image..."
        )

        image = cv2.imread(
            image_input
        )

        log(
            "Local image loaded."
        )


except Exception as error:

    print(
        json.dumps({
            "success": False,
            "error": f"Failed to load image: {error}"
        })
    )

    sys.exit(1)


# ============================================
# 3. Validate Image
# ============================================

if image is None:

    print(
        json.dumps({
            "success": False,
            "error": "OpenCV could not decode this image."
        })
    )

    sys.exit(1)


log(
    "Image loaded successfully."
)

log(
    f"Original image size: {image.shape}"
)


# ============================================
# 4. Create Output Folders
# ============================================

os.makedirs(
    "detected_faces",
    exist_ok=True
)

os.makedirs(
    "embeddings",
    exist_ok=True
)


# ============================================
# 5. Load YuNet Face Detector
# ============================================

detector_model = (
    "models/face_detection_yunet_2023mar.onnx"
)


detector = cv2.FaceDetectorYN.create(
    detector_model,
    "",
    (320, 320),
    0.6,
    0.3,
    5000
)


height, width = image.shape[:2]


detector.setInputSize(
    (width, height)
)


# ============================================
# 6. Detect Faces
# ============================================

_, faces = detector.detect(
    image
)


if faces is None:

    log(
        "\nNo faces detected."
    )

    print(
        json.dumps({
            "success": True,
            "facesDetected": 0,
            "faces": []
        })
    )

    sys.exit(0)


log(
    f"\nFaces detected: {len(faces)}"
)


# ============================================
# 7. Load SFace Recognition Model
# ============================================

recognizer_model = (
    "models/face_recognition_sface_2021dec.onnx"
)


recognizer = cv2.FaceRecognizerSF.create(
    recognizer_model,
    ""
)


# ============================================
# 8. Store Face Results
# ============================================

face_results = []


# ============================================
# 9. Process Every Face
# ============================================

for index, face in enumerate(faces):

    face_id = index + 1


    log(
        f"\nProcessing Face {face_id}..."
    )


    # ----------------------------------------
    # Face Box
    # ----------------------------------------

    x, y, w, h = (
        face[:4].astype(int)
    )


    log("Face box:")

    log(f"x = {x}")

    log(f"y = {y}")

    log(f"width = {w}")

    log(f"height = {h}")


    # ----------------------------------------
    # Align Face
    # ----------------------------------------

    try:

        aligned_face = (
            recognizer.alignCrop(
                image,
                face
            )
        )

    except Exception as error:

        log(
            f"Face alignment failed: {error}"
        )

        continue


    # ----------------------------------------
    # Generate Embedding
    # ----------------------------------------

    try:

        embedding = (
            recognizer.feature(
                aligned_face
            )
        )

    except Exception as error:

        log(
            f"Embedding generation failed: {error}"
        )

        continue


    # ----------------------------------------
    # Convert Embedding
    # ----------------------------------------

    embedding_list = (
        embedding.flatten()
        .astype(float)
        .tolist()
    )


    # ----------------------------------------
    # Save Detected Face
    # ----------------------------------------

    face_filename = (
        f"face_{face_id}.jpg"
    )


    face_path = os.path.join(
        "detected_faces",
        face_filename
    )


    cv2.imwrite(
        face_path,
        aligned_face
    )


    # ----------------------------------------
    # Save Embedding
    # ----------------------------------------

    embedding_filename = (
        f"face_{face_id}_embedding.npy"
    )


    embedding_path = os.path.join(
        "embeddings",
        embedding_filename
    )


    np.save(
        embedding_path,
        embedding
    )


    log(
        f"Aligned face saved: {face_path}"
    )

    log(
        f"Embedding saved: {embedding_path}"
    )

    log(
        f"Embedding shape: {embedding.shape}"
    )


    # ----------------------------------------
    # Store Result
    # ----------------------------------------

    face_results.append({

        "faceId": face_id,

        "box": {
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h)
        },

        "embedding": embedding_list

    })


# ============================================
# 10. Send Result to Node.js
# ============================================

result = {

    "success": True,

    "facesDetected": len(face_results),

    "faces": face_results

}


# IMPORTANT:
# stdout contains ONLY JSON.
# Node.js will read this output.

print(
    json.dumps(result)
)


# ============================================
# 11. Processing Completed
# ============================================

log(
    "\n================================"
)

log(
    "Processing completed."
)

log(
    "================================"
)