import numpy as np
import os


# ==========================================
# SETTINGS
# ==========================================

query_embedding_path = "embeddings/test_face_1_embedding.npy"

embeddings_folder = "embeddings"

# Old/test files that we don't want to use
ignored_files = {
    "face_1_embedding.npy"
}


# ==========================================
# COSINE SIMILARITY
# ==========================================

def cosine_similarity(embedding1, embedding2):

    dot_product = np.dot(embedding1, embedding2)

    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot_product / (norm1 * norm2)


# ==========================================
# LOAD QUERY EMBEDDING
# ==========================================

query_embedding = np.load(query_embedding_path)

query_embedding = query_embedding.flatten()

print("================================")
print("Query Face")
print("================================")

print("File:", query_embedding_path)
print("Embedding shape:", query_embedding.shape)


# ==========================================
# FIND EMBEDDINGS
# ==========================================

embedding_files = []

for file_name in os.listdir(embeddings_folder):

    if not file_name.endswith(".npy"):
        continue

    # Ignore query itself
    if file_name == os.path.basename(query_embedding_path):
        continue

    # Ignore old/test embeddings
    if file_name in ignored_files:
        continue

    embedding_files.append(file_name)


print("\n================================")
print("Embeddings to Compare")
print("================================")

if not embedding_files:

    print("No embeddings found.")

else:

    for file_name in embedding_files:
        print(file_name)


# ==========================================
# COMPARE
# ==========================================

results = []

for file_name in embedding_files:

    file_path = os.path.join(
        embeddings_folder,
        file_name
    )

    embedding = np.load(file_path)

    embedding = embedding.flatten()

    similarity = cosine_similarity(
        query_embedding,
        embedding
    )

    results.append(
        {
            "file": file_name,
            "similarity": similarity
        }
    )


# ==========================================
# SORT
# ==========================================

results.sort(
    key=lambda item: item["similarity"],
    reverse=True
)


# ==========================================
# DISPLAY RESULTS
# ==========================================

print("\n================================")
print("Face Matching Results")
print("================================")

if not results:

    print("No matching results.")

else:

    for index, result in enumerate(results, start=1):

        print(
            f"{index}. "
            f"{result['file']} → "
            f"Cosine Similarity: "
            f"{result['similarity']:.6f}"
        )


# ==========================================
# TOP MATCH
# ==========================================

if results:

    best_match = results[0]

    print("\n================================")
    print("Top Match")
    print("================================")

    print("File:", best_match["file"])

    print(
        f"Cosine Similarity: "
        f"{best_match['similarity']:.6f}"
    )