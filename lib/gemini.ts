import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Interface for a generated quiz question.
 */
interface GeneratedQuestion {
  text: string;
  type: "MCQ" | "NORMAL";
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: string;
}

/**
 * Initializes the Gemini AI client.
 * @returns A GoogleGenerativeAI instance.
 * @throws An error if GEMINI_API_KEY environment variable is not set.
 */
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates a set of multiple-choice quiz questions based on provided content.
 *
 * @param videoContent The text content (e.g., transcript) to generate questions from.
 * @param numberOfQuestions The exact number of questions to generate (default: 5).
 * @param difficulty The difficulty level ("easy", "medium", or "hard") (default: "medium").
 * @returns A promise that resolves to an array of GeneratedQuestion objects.
 */
export async function generateQuizQuestions(
  videoContent: string,
  numberOfQuestions: number = 10,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<GeneratedQuestion[]> {
  try {
    if (!videoContent || videoContent.trim().length === 0) {
      throw new Error("Video content cannot be empty");
    }

    const genAI = initializeGemini();

    // ✅ FIX 1: Use a supported Gemini model for the new SDK.
    const modelName = process.env.GEMINI_MODEL || process.env.GENERATIVE_MODEL || "gemini-2.5-flash";
    
    const model = genAI.getGenerativeModel({ model: modelName });

    const difficultyGuidelines = {
      easy: "basic concepts, straightforward understanding",
      medium: "mixed difficulty, application of concepts",
      hard: "complex scenarios, critical thinking required"
    };

    const prompt = `You are an expert educational content creator specializing in creating comprehensive quiz questions.

Based on the following video content, generate exactly ${numberOfQuestions} multiple choice quiz questions with ${difficulty} difficulty level (${difficultyGuidelines[difficulty]}).

Video Content:
"${videoContent}"

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY ${numberOfQuestions} questions (no more, no less)
2. Each question MUST be multiple choice with exactly 4 options
3. The answer must be the EXACT TEXT of one of the 4 options (not "A", "B", "C", or "D")
4. Questions must be diverse and cover different aspects of the content
5. Options must be plausible but only one should be correct
6. Return ONLY valid JSON array, no markdown, no code blocks, no other text

JSON Format (IMPORTANT - follow exactly):
[
  {
    "text": "What is the main concept discussed?",
    "type": "MCQ",
    "option1": "First option",
    "option2": "Second option",
    "option3": "Third option",
    "option4": "Fourth option",
    "answer": "Second option"
  }
]

Now generate the quiz:`;

    let result;
    try {
      // ✅ FIX 2: Call generateContent with the prompt only; the prompt requests JSON output.
      result = await model.generateContent(prompt);
    } catch (err: any) {
      // Improved error message for common model-not-found issue
      const raw = err?.toString?.() || "";
      if (raw.includes("models/") && raw.includes("not found")) {
        console.error("Gemini model error:", raw);
        throw new Error(
          `Failed to generate content: ${raw}. This usually means the model '${modelName}' is not available for your account or API version. \n` +
            `Please set environment variable GEMINI_MODEL or GENERATIVE_MODEL to a supported model (e.g. 'gemini-2.5-flash' or a Gemini model available to your project).\n` +
            `See Google Generative AI docs or call ListModels to see available models.`
        );
      }
      throw err;
    }
    
    // Support response.text being either a string or a function that returns a string
    const rawResponseText =
      typeof result.response.text === "function" ? result.response.text() : result.response.text;
    const responseText = (rawResponseText ?? "").toString().trim();

    // Cleanup logic for robustness, though less necessary with responseMimeType
    let cleanedText = responseText;
    if (responseText.includes("```json")) {
      cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (responseText.includes("```")) {
      cleanedText = responseText.replace(/```\n?/g, "");
    }

    // Parse the JSON response
    const questions: GeneratedQuestion[] = JSON.parse(cleanedText);

    // Validation logic
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Response is not a valid JSON array or is empty:", questions);
      throw new Error("Gemini API did not return a valid JSON array or returned an empty array.");
    }

    // Validate and auto-correct answers
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.type || !q.option1 || !q.option2 || !q.option3 || !q.option4 || !q.answer) {
        console.error(`Invalid question structure at index ${i}:`, q);
        throw new Error(`Question ${i + 1} is missing required fields or has an invalid structure.`);
      }

      // Verify answer is one of the options
      const options = [q.option1, q.option2, q.option3, q.option4];
      if (!options.includes(q.answer)) {
        console.warn(`Question ${i + 1}: Answer "${q.answer}" is not in options, auto-correcting to "${options[0]}"`);
        questions[i].answer = options[0];
      }
    }

    // Ensure we return exactly the requested number of questions
    return questions.slice(0, numberOfQuestions);
  } catch (error) {
    console.error("Error generating quiz questions with Gemini:", error);
    throw new Error(
      `Failed to generate quiz questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generates a single multiple-choice question on a specific topic and context.
 */
export async function generateSingleQuestion(
  topic: string,
  context: string
): Promise<GeneratedQuestion> {
  try {
    const questions = await generateQuizQuestions(`Topic: ${topic}\n\nContext: ${context}`, 1, "medium");
    return questions[0];
  } catch (error) {
    console.error("Error generating single question with Gemini:", error);
    throw error;
  }
}

/**
 * Lists the available Gemini models using the REST API.
 */
export async function listAvailableModels(): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  // Use the standard REST endpoint
  const url = `[https://generativelanguage.googleapis.com/v1beta/models?key=$](https://generativelanguage.googleapis.com/v1beta/models?key=$){encodeURIComponent(
    apiKey
  )}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to list models: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error listing Gemini models:", err);
    throw err;
  }
}