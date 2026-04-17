
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionDifficulty } from "../types.ts";

/**
 * Fetches unique Rajasthan PYQs with a massive diversity focus.
 */
export async function fetchPYQs(params: {
  count: number;
  subject?: string;
  topic?: string;
  isMix?: boolean;
  testNumber?: number;
  examContext?: string;
  difficulty?: QuestionDifficulty;
}, retryCount = 0): Promise<Question[]> {
  const { count, subject, topic, isMix, testNumber, examContext, difficulty } = params;
  const topicDescriptor = isMix ? "Rajasthan General Knowledge (Mixed Mock)" : (topic || subject || "Rajasthan GK");
  const seed = Math.floor(Math.random() * 1000000);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Ultimate High-Yield Prompt for 2025 Rajasthan Exam Standards
  const prompt = `ACT AS AN EXPERT RPSC/RSSB PAPER SETTER. Generate ${count} HIGH-LEVEL questions for ${examContext || topicDescriptor}.
  
  DIFFICULTY LEVEL: HARD (RAS/SI/College Lecturer Standards).
  DIVERSITY SEED: ${seed}
  
  MANDATORY CONTENT STRUCTURE:
  1. 100% COMPLEX QUESTIONS (Kathan, Milan, Vyakhiya).
  2. NEW PATTERN: RAS 2024-25 analytical style.
  
  STRICT FORMATTING RULES:
  - STATEMENT QUESTIONS: Each statement (1. , 2. , 3. ) MUST be on a NEW LINE.
  - MATCHING (MILAN): Side-by-side using ' || ' as separator (सूची-I || सूची-II).
  - CODES (कूट): Always provide a selection section (e.g., केवल 1 और 2 सही हैं).
  
  OTHER RULES:
  - Option 'E' is ALWAYS "अनुत्तरित प्रश्न".
  - Correct answer is A, B, C, or D.
  - Return VALID JSON.
  - LANGUAGE: Pure standard Hindi.
  
  Schema: [{
    "id": "raj_${seed}_[index]",
    "question": "Full multi-line string with newlines (\\n) and separators ( || )",
    "options": {"A":"..","B":"..","C":"..","D":"..","E":"अनुत्तरित प्रश्न"},
    "correctAnswer": "A",
    "examName": "RPSC RAS/SI/RSSB Paper",
    "examYear": 2025,
    "subject": "${topicDescriptor}"
  }]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.85, // Higher temperature for more diversity
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                  D: { type: Type.STRING },
                  E: { type: Type.STRING },
                },
                required: ['A', 'B', 'C', 'D', 'E']
              },
              correctAnswer: { type: Type.STRING },
              examName: { type: Type.STRING },
              examYear: { type: Type.NUMBER },
              subject: { type: Type.STRING },
            },
            required: ['id', 'question', 'options', 'correctAnswer', 'examName', 'examYear', 'subject']
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text.trim()).slice(0, count);
  } catch (error) {
    if (retryCount < 2) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchPYQs(params, retryCount + 1);
    }
    console.error("Gemini Fetch Failure:", error);
    throw error;
  }
}
