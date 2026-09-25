import numpy as np


# ============================================================
# 1. EMBEDDING FILE PATHS
# ============================================================

embedding_1_path = "embeddings/test_face_1_embedding.npy"

embedding_2_path = "embeddings/test_3_face_1_embedding.npy"


# ============================================================
# 2. LOAD EMBEDDINGS
# ============================================================

embedding_1 = np.load(embedding_1_path)

embedding_2 = np.load(embedding_2_path)


print("Embedding 1 loaded successfully!")
print("Embedding 2 loaded successfully!")


# ============================================================
# 3. PRINT SHAPES
# ============================================================

print()
print("Embedding 1 shape:", embedding_1.shape)
print("Embedding 2 shape:", embedding_2.shape)


# ============================================================
# 4. FLATTEN EMBEDDINGS
# ============================================================

embedding_1 = embedding_1.flatten()

embedding_2 = embedding_2.flatten()


print()
print("After flattening:")
print("Embedding 1 shape:", embedding_1.shape)
print("Embedding 2 shape:", embedding_2.shape)


# ============================================================
# 5. CALCULATE COSINE SIMILARITY
# ============================================================

dot_product = np.dot(
    embedding_1,
    embedding_2
)

norm_1 = np.linalg.norm(
    embedding_1
)

norm_2 = np.linalg.norm(
    embedding_2
)


cosine_similarity = (
    dot_product /
    (norm_1 * norm_2)
)


# ============================================================
# 6. PRINT SIMILARITY SCORE
# ============================================================

print()
print("--------------------------------")
print("Similarity Result")
print("--------------------------------")

print(
    "Cosine Similarity:",
    cosine_similarity
)


# ============================================================
# 7. CONVERT TO PERCENTAGE
# ============================================================

similarity_percentage = (
    (cosine_similarity + 1) / 2
) * 100


print(
    "Similarity Percentage:",
    similarity_percentage,
    "%"
)


# ============================================================
# 8. BASIC RESULT DISPLAY
# ============================================================

print()

if cosine_similarity >= 0.5:

    print(
        "Result: The embeddings are relatively similar."
    )

else:

    print(
        "Result: The embeddings are relatively different."
    )