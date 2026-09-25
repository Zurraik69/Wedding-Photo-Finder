import cv2
import numpy as np
import os


# ==========================================
# SETTINGS
# ==========================================

image_path = "test_group.jpeg"

yunet_model_path = "models/face_detection_yunet_2023mar.onnx"
sface_model_path = "models/face_recognition_sface_2021dec.onnx"

output_face_folder = "detected_faces"
output_embedding_folder = "embeddings"


# ==========================================
# CREATE OUTPUT FOLDERS
# ==========================================

os.makedirs(output_face_folder, exist_ok=True)
os.makedirs(output_embedding_folder, exist_ok=True)


# ==========================================
# LOAD IMAGE
# ==========================================

image = cv2.imread(image_path)

if image is None:
    print("Error: Image could not be loaded.")
    exit()

print("Image loaded successfully!")
print("Image shape:", image.shape)


# ==========================================
# LOAD YUNET
# ==========================================

detector = cv2.FaceDetectorYN.create(
    yunet_model_path,
    "",
    (320, 320),
    0.9,
    0.3,
    5000
)

print("YuNet model loaded successfully!")


# Set actual image size
height, width = image.shape[:2]

detector.setInputSize((width, height))


# ==========================================
# FACE DETECTION
# ==========================================

_, faces = detector.detect(image)


if faces is None:
    print("No faces detected.")
    exit()


print("\n================================")
print("Face Detection")
print("================================")

print("Faces detected:", len(faces))


# ==========================================
# LOAD SFACE
# ==========================================

recognizer = cv2.FaceRecognizerSF.create(
    sface_model_path,
    ""
)

print("SFace model loaded successfully!")


# ==========================================
# PROCESS EVERY FACE
# ==========================================

for index, face in enumerate(faces, start=1):

    print("\n--------------------------------")
    print(f"Processing Face {index}")
    print("--------------------------------")

    # --------------------------------------
    # FACE BOX
    # --------------------------------------

    x, y, w, h = face[:4].astype(int)

    print(
        f"Face box: "
        f"x={x}, y={y}, width={w}, height={h}"
    )


    # --------------------------------------
    # LANDMARKS
    # --------------------------------------

    landmarks = face[4:14].reshape(5, 2)

    print("Landmarks detected:")

    print("Left eye:", landmarks[0])
    print("Right eye:", landmarks[1])
    print("Nose:", landmarks[2])
    print("Left mouth:", landmarks[3])
    print("Right mouth:", landmarks[4])


    # --------------------------------------
    # ALIGN FACE
    # --------------------------------------

    aligned_face = recognizer.alignCrop(
        image,
        face
    )

    print(
        "Aligned face shape:",
        aligned_face.shape
    )


    # --------------------------------------
    # GENERATE EMBEDDING
    # --------------------------------------

    embedding = recognizer.feature(
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


    # --------------------------------------
    # SAVE ALIGNED FACE
    # --------------------------------------

    face_output_path = (
        f"{output_face_folder}/"
        f"group_face_{index}.jpg"
    )

    cv2.imwrite(
        face_output_path,
        aligned_face
    )

    print(
        "Saved aligned face:",
        face_output_path
    )


    # --------------------------------------
    # SAVE EMBEDDING
    # --------------------------------------

    embedding_output_path = (
        f"{output_embedding_folder}/"
        f"group_face_{index}_embedding.npy"
    )

    np.save(
        embedding_output_path,
        embedding
    )

    print(
        "Saved embedding:",
        embedding_output_path
    )


    # --------------------------------------
    # DRAW FACE BOX
    # --------------------------------------

    cv2.rectangle(
        image,
        (x, y),
        (x + w, y + h),
        (255, 0, 0),
        2
    )


    # --------------------------------------
    # DRAW FACE NUMBER
    # --------------------------------------

    cv2.putText(
        image,
        f"Face {index}",
        (x, y - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )


    # --------------------------------------
    # DRAW LANDMARKS
    # --------------------------------------

    for point in landmarks:

        px, py = point.astype(int)

        cv2.circle(
            image,
            (px, py),
            3,
            (0, 255, 0),
            -1
        )


# ==========================================
# SAVE DETECTION RESULT
# ==========================================

output_image_path = "detected_faces/test_group_detected.jpg"

cv2.imwrite(
    output_image_path,
    image
)

print("\n================================")
print("Completed")
print("================================")

print(
    "Detection image saved:",
    output_image_path
)


# ==========================================
# DISPLAY IMAGE
# ==========================================

max_width = 1000
max_height = 700

display_image = image.copy()

display_height, display_width = display_image.shape[:2]

scale = min(
    max_width / display_width,
    max_height / display_height,
    1
)

if scale < 1:

    new_width = int(display_width * scale)
    new_height = int(display_height * scale)

    display_image = cv2.resize(
        display_image,
        (new_width, new_height)
    )


cv2.imshow(
    "Group Face Detection",
    display_image
)

cv2.waitKey(0)

cv2.destroyAllWindows()