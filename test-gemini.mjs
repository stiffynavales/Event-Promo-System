// Run: node test-gemini.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";

// Read GEMINI_API_KEY from .env.local
const env = readFileSync(".env.local", "utf-8");
const match = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : "";
console.log("Using API key:", apiKey.slice(0, 12) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

for (const modelName of modelsToTest) {
  try {
    console.log(`\nTesting: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say: WORKS");
    const text = result.response.text();
    console.log(`✅ ${modelName} WORKS! Response: ${text.trim()}`);
    break; // Stop at first working model
  } catch (err) {
    console.log(`❌ ${modelName} FAILED: ${err.message?.slice(0, 120)}`);
  }
}
