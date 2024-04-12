const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");
// Import the GoogleGenerativeAI class from the Gemini library
// const {
//   getGenerativeModel,
//   GoogleGenerativeAI,
// } = require("gemini-api-wrapper");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const filterFiles = (req, file, cb) => {
  const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid File Type Submitted"));
  }
};
const upload = multer({ storage: storage, fileFilter: filterFiles });
// Function to handle file uploads
const handleFileUpload = upload.single("file");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file part" });
    }

    const imagePath = path.join(__dirname, "../uploads", req.file.filename);
    console.log("the image path - ", imagePath);

    try {
      const { data } = await Tesseract.recognize(imagePath, "eng", {
        logger: (info) => console.log(info),
      });

      console.log("Extracted Text:", data.text);
      // const enhancedText = await enhanceWithGemini(data.text);
      // console.log("Enhanced Text: ", enhancedText);
      return res.status(200).json({ message: data.text });
    } catch (tesseractError) {
      console.error("Tesseract Error:", tesseractError);
      return res
        .status(500)
        .json({ error: "Tesseract Error", message: tesseractError.message });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

const enhanceWithGemini = async (text) => {
  try {
    // Access your API key as an environment variable or provide it directly
    const apiKey = process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: `${process.env.MODEL_TYPE}`,
    });

    // Use the model to generate enhanced text
    const prompt = "1mg paracetamol";
    const response = await model.generateContent(prompt);
    console.log("GPT response - ", response);
    return response.enhancedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};

module.exports = {
  uploadFile,
  handleFileUpload,
};
