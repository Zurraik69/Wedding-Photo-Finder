const cosineSimilarity = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2) {
    return 0;
  }

  if (embedding1.length !== embedding2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];

    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};


// ==========================================
// FIND MATCHING PHOTOS
// ==========================================

const findMatchingPhotos = (
  queryEmbedding,
  photos,
  threshold = 0.5
) => {

  const matches = [];

  console.log("\n================================");
  console.log("Face Similarity Scores");
  console.log("================================");


  for (const photo of photos) {

    if (!photo.faces || photo.faces.length === 0) {

      console.log(
        `${photo.filename} → No faces stored`
      );

      continue;
    }


    let bestSimilarity = -1;

    for (const face of photo.faces) {

      const similarity = cosineSimilarity(
        queryEmbedding,
        face.embedding
      );


      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
      }
    }


    // ========================================
    // Show every photo score
    // ========================================

    console.log(
      `${photo.filename} → ${bestSimilarity.toFixed(6)}`
    );


    // ========================================
    // Add matching photos
    // ========================================

    if (bestSimilarity >= threshold) {

      matches.push({
        photoId: photo._id,
        imageUrl: photo.imageUrl,
        filename: photo.filename,
        similarity: bestSimilarity,
      });

    }

  }


  // ==========================================
  // Sort highest similarity first
  // ==========================================

  matches.sort(
    (a, b) => b.similarity - a.similarity
  );


  return matches;
};


module.exports = {
  cosineSimilarity,
  findMatchingPhotos,
};