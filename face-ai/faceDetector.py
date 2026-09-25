import cv2
import os
import numpy as np


# ============================================================
# 1. LOAD FACE DETECTOR
# ============================================================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


# ============================================================
# 2. LOAD EYE DETECTOR
# ============================================================

eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_eye.xml"
)


# ============================================================
# 3. READ IMAGE
# ============================================================

image = cv2.imread("test.jpeg")

if image is None:
    print("Image not found!")
    exit()


# ============================================================
# 4. CONVERT IMAGE TO GRAYSCALE
# ============================================================

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


# ============================================================
# 5. DETECT FACES
# ============================================================

faces = face_cascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(80, 80)
)

print("Raw detections:", len(faces))


# ============================================================
# 6. CREATE OUTPUT FOLDERS
# ============================================================

os.makedirs("detected_faces", exist_ok=True)
os.makedirs("features", exist_ok=True)


# ============================================================
# 7. VALIDATE DETECTED FACES
# ============================================================

valid_faces = []

for (x, y, w, h) in faces:

    # Extract face region from grayscale image
    face_gray = gray[y:y + h, x:x + w]

    # Detect eyes inside the face
    eyes = eye_cascade.detectMultiScale(
        face_gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(15, 15)
    )

    print(
        f"Detection: x={x}, y={y}, "
        f"width={w}, height={h}, "
        f"eyes={len(eyes)}"
    )

    # Keep detection if at least one eye is found
    if len(eyes) >= 1:
        valid_faces.append((x, y, w, h))


print("Valid faces:", len(valid_faces))


# ============================================================
# 8. PROCESS EVERY VALID FACE
# ============================================================

for index, (x, y, w, h) in enumerate(valid_faces, start=1):

    # --------------------------------------------------------
    # A. CROP FACE
    # --------------------------------------------------------

    face_crop = image[y:y + h, x:x + w]

    print(f"\nProcessing Face {index}...")


    # --------------------------------------------------------
    # B. PREPROCESSING - RESIZE
    # --------------------------------------------------------

    # Every face will have the same size
    face_resized = cv2.resize(
        face_crop,
        (128, 128)
    )

    print("Resized face:", face_resized.shape)


    # --------------------------------------------------------
    # C. CONVERT FACE TO GRAYSCALE
    # --------------------------------------------------------

    face_gray = cv2.cvtColor(
        face_resized,
        cv2.COLOR_BGR2GRAY
    )


    # --------------------------------------------------------
    # D. NORMALIZATION
    # --------------------------------------------------------

    # Convert pixel values from:
    # 0 - 255
    #
    # to:
    # 0.0 - 1.0

    face_normalized = face_gray.astype(
        np.float32
    ) / 255.0


    # --------------------------------------------------------
    # E. FEATURE EXTRACTION
    # --------------------------------------------------------

    # Convert 128 x 128 matrix
    # into one-dimensional numerical vector

    features = face_normalized.flatten()


    # --------------------------------------------------------
    # F. PRINT FEATURE INFORMATION
    # --------------------------------------------------------

    print("Feature shape:", features.shape)
    print("Number of features:", len(features))

    print(
        "First 10 feature values:",
        features[:10]
    )


    # --------------------------------------------------------
    # G. SAVE ORIGINAL FACE CROP
    # --------------------------------------------------------

    face_output_path = (
        f"detected_faces/face_{index}.jpg"
    )

    cv2.imwrite(
        face_output_path,
        face_crop
    )

    print(
        f"Saved face: {face_output_path}"
    )


    # --------------------------------------------------------
    # H. SAVE FEATURE VECTOR
    # --------------------------------------------------------

    feature_output_path = (
        f"features/face_{index}_features.npy"
    )

    np.save(
        feature_output_path,
        features
    )

    print(
        f"Saved features: {feature_output_path}"
    )


    # --------------------------------------------------------
    # I. DRAW RECTANGLE AROUND VALID FACE
    # --------------------------------------------------------

    cv2.rectangle(
        image,
        (x, y),
        (x + w, y + h),
        (255, 0, 0),
        2
    )


# ============================================================
# 9. SHOW RESULT
# ============================================================

cv2.imshow(
    "Face Detection",
    image
)

cv2.waitKey(0)
cv2.destroyAllWindows()