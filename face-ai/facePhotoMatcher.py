import json
import numpy as np
import os


# ==========================================
# SETTINGS
# ==========================================

query_embedding_path = "embeddings/test_face_1_embedding.npy"

metadata_file = "photo_faces.json"

embeddings_folder = "embeddings"


# ==========================================
# COSINE SIMILARITY
# ==========================================

def cosine_similarity(embedding1, embedding2):

    dot_product = np.dot(
        embedding1,
        embedding2
    )

    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot_product / (norm1 * norm2)


# ==========================================
# LOAD QUERY EMBEDDING
# ==========================================

query_embedding = np.load(
    query_embedding_path
)

query_embedding = query_embedding.flatten()


print("================================")
print("Query Face")
print("================================")

print(
    "Embedding:",
    query_embedding_path
)

print(
    "Shape:",
    query_embedding.shape
)


# ==========================================
# LOAD PHOTO METADATA
# ==========================================

with open(
    metadata_file,
    "r",
    encoding="utf-8"
) as file:

    photo_data = json.load(file)


print("\n================================")
print("Photo Metadata")
print("================================")

print(
    "Photo:",
    photo_data["photo"]
)

print(
    "Face Count:",
    photo_data["face_count"]
)


# ==========================================
# COMPARE QUERY WITH EVERY FACE
# ==========================================

results = []


for face in photo_data["faces"]:

    face_id = face["face_id"]

    embedding_file = face["embedding_file"]

    embedding_path = os.path.join(
        embeddings_folder,
        embedding_file
    )


    # Load face embedding
    face_embedding = np.load(
        embedding_path
    )

    face_embedding = face_embedding.flatten()


    # Calculate similarity
    similarity = cosine_similarity(
        query_embedding,
        face_embedding
    )


    results.append(
        {
            "face_id": face_id,
            "embedding_file": embedding_file,
            "similarity": similarity
        }
    )


# ==========================================
# SORT BY SIMILARITY
# ==========================================

results.sort(
    key=lambda item: item["similarity"],
    reverse=True
)


# ==========================================
# DISPLAY FACE MATCHING
# ==========================================

print("\n================================")
print("Face Matching Results")
print("================================")


for index, result in enumerate(
    results,
    start=1
):

    print(
        f"{index}. "
        f"Face {result['face_id']} "
        f"→ "
        f"{result['similarity']:.6f}"
    )


# ==========================================
# BEST MATCH
# ==========================================

if results:

    best_match = results[0]

    print("\n================================")
    print("Best Matching Face")
    print("================================")

    print(
        "Face ID:",
        best_match["face_id"]
    )

    print(
        "Embedding:",
        best_match["embedding_file"]
    )

    print(
        "Similarity:",
        f"{best_match['similarity']:.6f}"
    )


    # ======================================
    # GET ACTUAL PHOTO
    # ======================================

    matched_photo = photo_data["photo"]


    print("\n================================")
    print("Matched Photo")
    print("================================")

    print(
        "Photo:",
        matched_photo
    )

else:

    print("\nNo faces found.")