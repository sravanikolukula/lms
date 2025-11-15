# Gemini Quiz Auto-Generation Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install @google/generative-ai
```

### 2. Add Environment Variable
Update your `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Test the Integration

#### Using cURL
```bash
curl -X POST http://localhost:3000/api/courses/course-id/chapters/chapter-id/quizzes/quiz-id/generate \
  -H "Content-Type: application/json" \
  -d '{
    "chapterContent": "React is a JavaScript library for building user interfaces with reusable components.",
    "numberOfQuestions": 3,
    "difficulty": "medium"
  }'
```

#### Using Node.js/TypeScript
```typescript
const response = await fetch('/api/courses/courseId/chapters/chapterId/quizzes/quizId/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapterContent: 'Your chapter content...',
    numberOfQuestions: 5,
    difficulty: 'medium'
  })
});

const data = await response.json();
console.log(data);
```

## Integration Points

### Frontend Component Usage

```typescript
"use client";

import { GenerateQuizQuestionsButton } from "@/components/quiz/generate-questions-button";

export function QuizCreationPage({ courseId, chapterId, quizId }) {
  const handleSuccess = () => {
    console.log("Questions generated successfully!");
    // Refresh quiz questions or redirect
  };

  return (
    <GenerateQuizQuestionsButton
      courseId={courseId}
      chapterId={chapterId}
      quizId={quizId}
      onSuccess={handleSuccess}
    />
  );
}
```

### Custom Hook Usage

```typescript
import { useGenerateQuizQuestions } from "@/hooks/use-generate-quiz-questions";

export function MyQuizForm() {
  const { generateQuestions, isLoading, error, generatedQuestions } = 
    useGenerateQuizQuestions();

  const handleGenerate = async () => {
    try {
      const questions = await generateQuestions({
        chapterContent: "Your content here",
        numberOfQuestions: 5,
        difficulty: "medium"
      });
      console.log("Generated:", questions);
    } catch (err) {
      console.error("Failed to generate:", err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Questions"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {generatedQuestions.map((q) => (
          <li key={q.id}>{q.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### POST /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate

Generates quiz questions using Gemini AI and saves them to the database.

**Authentication**: Required (must be logged in and own the course)

**Request Body**:
```json
{
  "chapterContent": "string (required) - The content to generate questions from",
  "numberOfQuestions": "number (optional, default: 5) - How many questions to generate",
  "difficulty": "string (optional, default: 'medium') - 'easy', 'medium', or 'hard'"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Successfully generated and saved 5 questions",
  "questions": [
    {
      "id": "unique_id",
      "text": "What is the primary purpose of React?",
      "type": "MCQ",
      "option1": "Backend server management",
      "option2": "Building user interfaces",
      "option3": "Database management",
      "option4": "API development",
      "answer": "Building user interfaces",
      "quizId": "quiz_id",
      "createdAt": "2025-11-14T10:30:00Z",
      "updatedAt": "2025-11-14T10:30:00Z"
    }
    // ... more questions
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - User not authenticated or doesn't own the course
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Course or quiz not found
- `500 Internal Server Error` - Server-side error

## Utility Functions

### generateQuizQuestions()

Generate multiple quiz questions from content.

```typescript
import { generateQuizQuestions } from "@/lib/gemini";

const questions = await generateQuizQuestions(
  "Chapter content here...",
  5,           // numberOfQuestions
  "medium"     // difficulty
);
```

**Parameters**:
- `chapterContent` (string): The content to generate questions from
- `numberOfQuestions` (number): How many questions to generate (default: 5)
- `difficulty` (string): 'easy', 'medium', or 'hard' (default: 'medium')

**Returns**: `Promise<GeneratedQuestion[]>`

### generateSingleQuestion()

Generate a single quiz question.

```typescript
import { generateSingleQuestion } from "@/lib/gemini";

const question = await generateSingleQuestion(
  "React",
  "React is a JavaScript library for building user interfaces..."
);
```

**Parameters**:
- `topic` (string): The topic of the question
- `context` (string): Context/content about the topic

**Returns**: `Promise<GeneratedQuestion>`

## Database Schema

```typescript
model Question {
  id         String   @id @default(cuid()) @map("_id")
  text       String              // Question text
  type       QuestionType        // MCQ or NORMAL
  option1    String?             // Option A
  option2    String?             // Option B
  option3    String?             // Option C
  option4    String?             // Option D
  answer     String?             // Correct answer

  quizId     String
  quiz       Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([quizId])
}
```

## Configuration

### Gemini Models

The implementation uses `gemini-pro` model. You can change this in `lib/gemini.ts`:

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

Available models:
- `gemini-pro` - Best for text generation
- `gemini-pro-vision` - For multimodal (text + image)

### Customizing Prompts

Edit the prompts in `lib/gemini.ts` to customize question generation:

```typescript
const prompt = `You are an expert educational content creator. Based on the following chapter content, generate ${numberOfQuestions} multiple choice quiz questions with ${difficulty} difficulty level.
// ... customize the prompt as needed
`;
```

## Error Handling

### Common Errors and Solutions

**1. "Cannot find module '@google/generative-ai'"**
```bash
npm install @google/generative-ai
```

**2. "GEMINI_API_KEY is not set"**
Ensure `.env.local` has:
```env
GEMINI_API_KEY=your_actual_key
```

**3. Invalid response format**
- Check API key validity
- Verify chapter content is comprehensive
- Try with smaller question batches

**4. Rate limiting**
- Reduce questions per request
- Add delays between requests
- Check API quota

## Performance Tips

1. **Batch Processing**: Generate 5-10 questions at once for efficiency
2. **Async Operations**: Use async/await for non-blocking operations
3. **Caching**: Consider caching frequently generated questions
4. **Validation**: Always validate generated content before publication

## Security Checklist

- [ ] API key is in `.env.local` (gitignored)
- [ ] No API key in version control
- [ ] Authentication required on endpoints
- [ ] Course ownership verified
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting configured

## Monitoring

### Check API Usage

Monitor your Gemini API usage at [Google AI Console](https://ai.google.dev/)

### Log Generated Questions

The system logs to console:
```typescript
console.error("Error generating quiz questions with Gemini:", error);
```

### Track Performance

Add monitoring to track:
- Number of questions generated
- Time taken
- Success/failure rates
- API errors

## Advanced Usage

### Custom Question Generation

Create specialized prompts for different subjects:

```typescript
// lib/gemini-specialized.ts
export async function generateMathQuestions(
  content: string,
  count: number
) {
  const customPrompt = `You are a mathematics teacher. Generate ${count} challenging math quiz questions...`;
  // Use customPrompt in your API call
}
```

### Batch Generation with Progress

```typescript
export async function generateWithProgress(
  content: string,
  totalQuestions: number,
  onProgress: (current: number, total: number) => void
) {
  const questions = [];
  const batchSize = 5;
  
  for (let i = 0; i < totalQuestions; i += batchSize) {
    const batch = await generateQuizQuestions(
      content,
      Math.min(batchSize, totalQuestions - i)
    );
    questions.push(...batch);
    onProgress(questions.length, totalQuestions);
  }
  
  return questions;
}
```

## Troubleshooting Checklist

- [ ] Is the API key valid?
- [ ] Is the API key in `.env.local`?
- [ ] Is the server restarted after adding env var?
- [ ] Is the user authenticated?
- [ ] Does the user own the course?
- [ ] Is the chapter content substantial?
- [ ] Are there network connectivity issues?
- [ ] Is the API quota exceeded?

## Support Resources

- [Google Generative AI Documentation](https://ai.google.dev/)
- [Gemini API Reference](https://ai.google.dev/api)
- [Node.js SDK Documentation](https://ai.google.dev/tutorials/node_quickstart)
- [Project Repository](https://github.com/sravanikolukula/lms)

## Version History

- **v1.0.0** (2025-11-14) - Initial implementation with basic question generation
