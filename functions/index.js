const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const db = admin.firestore();

exports.deepDiveTrivia = functions.https.onCall(async (data, context) => {
  const movieTitle = (data.movieTitle || "a random popular movie").trim();
  const docId = movieTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Check cache first
  const cacheRef = db.collection("triviaCache").doc(docId);
  const cached = await cacheRef.get();
  if (cached.exists) {
    console.log("Cache hit:", movieTitle);
    return cached.data();
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate one deep-dive trivia question about the movie "${movieTitle}". Return ONLY valid JSON with these exact keys: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A","explanation":"..."}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, "").trim();
    const trivia = JSON.parse(text);

    await cacheRef.set({
      ...trivia,
      movieTitle,
      cachedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return trivia;
  } catch (err) {
    console.error("Gemini error:", err);
    throw new functions.https.HttpsError("internal", "Failed to generate trivia");
  }
});
