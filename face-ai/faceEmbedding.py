import cv2
import numpy as np
import os


# ============================================================
# 1. MODEL PATHS
# ============================================================

yunet_model_path = "models/face_detection_yunet_2023mar.onnx"

sface_model_path = "models/face_recognition_sface_2021dec.onnx"


# ============================================================
# 2. INPUT IMAGE
# ============================================================

image_path = "test_3.jpeg"

image = cv2.imread(image_path)

if image is None:
    print("Image not found!")
    exit()

print("Image loaded successfully!")


# ============================================================
# 3. LOAD YUNET FACE DETECTOR
# ============================================================

face_detector = cv2.FaceDetectorYN.create(
    yunet_model_path,
    "",
    (320, 320),
    0.9,
    0.3,
    5000
)

print("YuNet model loaded successfully!")


# ============================================================
# 4. SET INPUT IMAGE SIZE
# ============================================================

height, width = image.shape[:2]

face_detector.setInputSize((width, height))


# ============================================================
# 5. DETECT FACE + LANDMARKS
# ============================================================

_, faces = face_detector.detect(image)


if faces is None:
    print("No face detected!")
    exit()


print("Faces detected:", len(faces))


# ============================================================
# 6. LOAD SFACE RECOGNITION MODEL
# ============================================================

face_recognizer = cv2.FaceRecognizerSF.create(
    sface_model_path,
    ""
)

print("SFace model loaded successfully!")


# ============================================================
# 7. CREATE OUTPUT FOLDERS
# ============================================================

os.makedirs("detected_faces", exist_ok=True)
os.makedirs("embeddings", exist_ok=True)


# ============================================================
# 8. GET IMAGE NAME
# ============================================================

# test.jpeg   → test
# test_2.jpeg → test_2

image_name = os.path.splitext(
    os.path.basename(image_path)
)[0]


# ============================================================
# 9. PROCESS EVERY DETECTED FACE
# ============================================================

for index, face in enumerate(faces, start=1):

    print()
    print("--------------------------------")
    print(f"Processing Face {index}")
    print("--------------------------------")


    # --------------------------------------------------------
    # FACE INFORMATION
    # --------------------------------------------------------

    x, y, w, h = face[:4]

    print(
        f"Face box: "
        f"x={int(x)}, "
        f"y={int(y)}, "
        f"width={int(w)}, "
        f"height={int(h)}"
    )


    # --------------------------------------------------------
    # LANDMARKS
    # --------------------------------------------------------

    left_eye = (face[4], face[5])
    right_eye = (face[6], face[7])
    nose = (face[8], face[9])
    left_mouth = (face[10], face[11])
    right_mouth = (face[12], face[13])


    print("Landmarks detected:")

    print(
        "Left eye:",
        left_eye
    )

    print(
        "Right eye:",
        right_eye
    )

    print(
        "Nose:",
        nose
    )

    print(
        "Left mouth:",
        left_mouth
    )

    print(
        "Right mouth:",
        right_mouth
    )


    # --------------------------------------------------------
    # ALIGN + CROP FACE USING SFACE
    # --------------------------------------------------------

    aligned_face = face_recognizer.alignCrop(
        image,
        face
    )


    print(
        "Aligned face shape:",
        aligned_face.shape
    )


    # --------------------------------------------------------
    # GENERATE FACE EMBEDDING
    # --------------------------------------------------------

    embedding = face_recognizer.feature(
        aligned_face
    )


    print(
        "Embedding shape:",
        embedding.shape
    )


    print(
        "Number of embedding values:",
        embedding.size
    )


    # --------------------------------------------------------
    # SHOW FIRST 10 EMBEDDING VALUES
    # --------------------------------------------------------

    print("First 10 embedding values:")

    print(
        embedding[0][:10]
    )


    # --------------------------------------------------------
    # SAVE ALIGNED FACE
    # --------------------------------------------------------

    aligned_face_path = (
        f"detected_faces/"
        f"{image_name}_aligned_face_{index}.jpg"
    )

    cv2.imwrite(
        aligned_face_path,
        aligned_face
    )


    print(
        f"Saved aligned face: "
        f"{aligned_face_path}"
    )


    # --------------------------------------------------------
    # SAVE EMBEDDING
    # --------------------------------------------------------

    embedding_path = (
        f"embeddings/"
        f"{image_name}_face_{index}_embedding.npy"
    )

    np.save(
        embedding_path,
        embedding
    )


    print(
        f"Saved embedding: "
        f"{embedding_path}"
    )


    # --------------------------------------------------------
    # DRAW FACE RECTANGLE
    # --------------------------------------------------------

    cv2.rectangle(
        image,
        (int(x), int(y)),
        (int(x + w), int(y + h)),
        (255, 0, 0),
        2
    )


    # --------------------------------------------------------
    # DRAW LANDMARKS
    # --------------------------------------------------------

    landmarks = [
        left_eye,
        right_eye,
        nose,
        left_mouth,
        right_mouth
    ]


    for point in landmarks:

        point_x = int(point[0])
        point_y = int(point[1])

        cv2.circle(
            image,
            (point_x, point_y),
            4,
            (0, 255, 0),
            -1
        )


# ============================================================
# 10. RESIZE IMAGE FOR DISPLAY
# ============================================================

display_image = image.copy()

display_height, display_width = display_image.shape[:2]

# Maximum display size
max_width = 1000
max_height = 700

scale = min(
    max_width / display_width,
    max_height / display_height,
    1
)

new_width = int(display_width * scale)
new_height = int(display_height * scale)

display_image = cv2.resize(
    display_image,
    (new_width, new_height)
)


# ============================================================
# 11. SHOW RESULT
# ============================================================

cv2.namedWindow(
    "YuNet + SFace",
    cv2.WINDOW_NORMAL
)

cv2.imshow(
    "YuNet + SFace",
    display_image
)

cv2.waitKey(0)

cv2.destroyAllWindows()