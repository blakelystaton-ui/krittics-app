const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
admin.initializeApp();

// You must define and export at least one function here,
// like your Krittics trivia function, for deployment to succeed.

// Example placeholder (if you haven't added your actual code yet):
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Krittics Cloud Function is running!');
});
