import json
import os


# ==========================================
# SETTINGS
# ==========================================

photo_name = "test_group.jpeg"

embeddings_folder = "embeddings"

output_file = "photo_faces.json"


# ==========================================
# FIND GROUP FACE EMBEDDINGS
# ==========================================

face_embeddings = []

for file_name in os.listdir(embeddings_folder):

    if not file_name.startswith("group_face_"):
        continue

    if not file_name.endswith("_embedding.npy"):
        continue

    face_embeddings.append(file_name)


# Sort faces by face number
face_embeddings.sort(
    key=lambda file_name: int(
        file_name.split("_")[2]
    )
)


# ==========================================
# CREATE FACE METADATA
# ==========================================

faces = []

for index, embedding_file in enumerate(
    face_embeddings,
    start=1
):

    face_data = {
        "face_id": index,
        "embedding_file": embedding_file
    }

    faces.append(face_data)


# ==========================================
# CREATE PHOTO DATA
# ==========================================

photo_data = {
    "photo": photo_name,
    "face_count": len(faces),
    "faces": faces
}


# ==========================================
# SAVE JSON
# ==========================================

with open(
    output_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        photo_data,
        file,
        indent=4
    )


# ==========================================
# DISPLAY RESULT
# ==========================================

print("================================")
print("Photo Face Metadata")
print("================================")

print("Photo:", photo_name)
print("Faces:", len(faces))

print("\nFace Embeddings:")

for face in faces:

    print(
        f"Face {face['face_id']} "
        f"→ {face['embedding_file']}"
    )


print("\n================================")
print("Metadata Saved")
print("================================")

print("File:", output_file)