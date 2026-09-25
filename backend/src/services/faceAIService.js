const { spawn } = require("child_process");
const path = require("path");


// ============================================
// Face AI Service
// ============================================


// ============================================
// Common Python Runner
// ============================================

const runPythonFaceAI = (input) => {

  return new Promise((resolve, reject) => {

    // ----------------------------------------
    // Project Paths
    // ----------------------------------------

    const projectRoot = path.resolve(
      __dirname,
      "../.."
    );

    const faceAiFolder = path.join(
      projectRoot,
      "..",
      "face-ai"
    );

    const pythonScript = path.join(
      faceAiFolder,
      "faceUrlEmbedding.py"
    );

    const pythonExecutable = path.join(
      faceAiFolder,
      "venv",
      "Scripts",
      "python.exe"
    );


    // ----------------------------------------
    // Validate Input
    // ----------------------------------------

    if (!input) {

      return reject(
        new Error("Face AI input is required")
      );

    }


    // ----------------------------------------
    // Start Python Process
    // ----------------------------------------

    const pythonProcess = spawn(
      pythonExecutable,
      [
        pythonScript,
        input
      ],
      {
        cwd: faceAiFolder
      }
    );


    // ----------------------------------------
    // Collect stdout
    // ----------------------------------------

    let pythonOutput = "";

    pythonProcess.stdout.on(
      "data",
      (data) => {

        pythonOutput += data.toString();

      }
    );


    // ----------------------------------------
    // Collect stderr
    // ----------------------------------------

    let pythonError = "";

    pythonProcess.stderr.on(
      "data",
      (data) => {

        pythonError += data.toString();

        console.log(
          `[Face AI] ${data.toString()}`
        );

      }
    );


    // ----------------------------------------
    // Python Process Error
    // ----------------------------------------

    pythonProcess.on(
      "error",
      (error) => {

        reject(
          new Error(
            `Failed to start Python: ${error.message}`
          )
        );

      }
    );


    // ----------------------------------------
    // Python Process Finished
    // ----------------------------------------

    pythonProcess.on(
      "close",
      (code) => {

        // --------------------------------------
        // Python failed
        // --------------------------------------

        if (code !== 0) {

          return reject(
            new Error(
              `Face AI failed with code ${code}\n${pythonError}`
            )
          );

        }


        // --------------------------------------
        // Parse Python JSON
        // --------------------------------------

        try {

          const result = JSON.parse(
            pythonOutput.trim()
          );


          // ------------------------------------
          // Python reported failure
          // ------------------------------------

          if (!result.success) {

            return reject(
              new Error(
                result.error ||
                "Face AI processing failed"
              )
            );

          }


          // ------------------------------------
          // Return Face Results
          // ------------------------------------

          resolve(result.faces);

        } catch (error) {

          reject(
            new Error(
              `Failed to parse Face AI response: ${error.message}`
            )
          );

        }

      }
    );

  });

};


// ============================================
// Generate Embeddings From Cloudinary URL
// ============================================

const generateFaceEmbeddings = (imageUrl) => {

  return runPythonFaceAI(imageUrl);

};


// ============================================
// Generate Embeddings From Local File
// ============================================

const generateFaceEmbeddingsFromFile = (filePath) => {

  return runPythonFaceAI(filePath);

};


// ============================================
// Exports
// ============================================

module.exports = {
  generateFaceEmbeddings,
  generateFaceEmbeddingsFromFile,
};