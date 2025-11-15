# Quiz Question Auto-Generation using Gemini API

## Overview
This implementation automates quiz question generation using Google's Gemini API. Teachers no longer need to manually create quiz questions - the system will generate them based on chapter content.

## Setup Instructions

### 1. Install Gemini SDK
First, install the Google Generative AI package:

```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click on "Get API Key"
3. Create a new API key for your project
4. Copy the API key

### 3. Add Environment Variables
Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual Gemini API key.

## Files Added/Modified

### New Files Created:

1. **`lib/gemini.ts`**
   - Contains utility functions for generating quiz questions
   - `generateQuizQuestions()` - Generates multiple questions at once
   - `generateSingleQuestion()` - Generates a single question

2. **`app/api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate/route.ts`**
   - New API endpoint for auto-generating quiz questions
   - POST endpoint that accepts chapter content and generates questions

## Usage Guide

### Method 1: Using the API Endpoint

#### Endpoint
```
POST /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate
```

#### Request Body
```json
{
  "chapterContent": "Your chapter content here...",
  "numberOfQuestions": 5,
  "difficulty": "medium"
}
```

#### Parameters
- **chapterContent** (required): The content of the chapter to generate questions from
- **numberOfQuestions** (optional): Number of questions to generate (default: 5)
- **difficulty** (optional): Difficulty level - "easy", "medium", or "hard" (default: "medium")

#### Example Request
```typescript
const response = await fetch(
  `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}/generate`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chapterContent: "React is a JavaScript library for building user interfaces...",
      numberOfQuestions: 5,
      difficulty: "medium",
    }),
  }
);

const data = await response.json();
console.log(data);
```

#### Example Response
```json
{
  "success": true,
  "message": "Successfully generated and saved 5 questions",
  "questions": [
    {
      "id": "question_id_1",
      "text": "What is React?",
      "type": "MCQ",
      "option1": "A backend framework",
      "option2": "A JavaScript library for building user interfaces",
      "option3": "A CSS framework",
      "option4": "A database system",
      "answer": "A JavaScript library for building user interfaces",
      "quizId": "quiz_id",
      "createdAt": "2025-11-14T10:30:00Z",
      "updatedAt": "2025-11-14T10:30:00Z"
    },
    // ... more questions
  ]
}
```

### Method 2: Using the Utility Functions (Server-side)

```typescript
import { generateQuizQuestions, generateSingleQuestion } from "@/lib/gemini";

// Generate multiple questions
const questions = await generateQuizQuestions(
  "Your chapter content...",
  5,
  "medium"
);

// Generate a single question
const singleQuestion = await generateSingleQuestion(
  "React",
  "React is a JavaScript library for building user interfaces..."
);
```

## Features

- **Automatic Question Generation**: Generate MCQ questions automatically from chapter content
- **Configurable Difficulty**: Choose between easy, medium, and hard questions
- **Batch Generation**: Generate multiple questions at once
- **Single Question Generation**: Create individual questions on demand
- **Database Integration**: Questions are automatically saved to the database
- **Authentication**: Requires user authentication and course ownership verification
- **Error Handling**: Comprehensive error handling and logging

## Database Schema

Questions are stored in the `Question` model with the following fields:

```prisma
model Question {
  id         String   @id @default(cuid()) @map("_id")
  text       String
  type       QuestionType  // MCQ or NORMAL
  option1    String?
  option2    String?
  option3    String?
  option4    String?
  answer     String?

  quizId     String
  quiz       Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([quizId])
}
```

## Response Format

Generated questions follow this format:

```typescript
interface GeneratedQuestion {
  text: string;              // Question text
  type: "MCQ" | "NORMAL";    // Question type
  option1?: string;          // First option
  option2?: string;          // Second option
  option3?: string;          // Third option
  option4?: string;          // Fourth option
  answer: string;            // Correct answer (full text, not A/B/C/D)
}
```

## Error Handling

The system handles various error scenarios:

- **401 Unauthorized**: User not authenticated or doesn't own the course
- **404 Not Found**: Quiz or course not found
- **400 Bad Request**: Missing required fields
- **500 Internal Server Error**: Gemini API errors or database errors

## Best Practices

1. **Use Relevant Content**: Provide clear, comprehensive chapter content for better question generation
2. **Validate Generated Questions**: Always review generated questions before publishing
3. **Adjust Difficulty**: Use appropriate difficulty levels for your target audience
4. **Monitor API Usage**: Keep track of your Gemini API usage to avoid unexpected costs
5. **Batch Operations**: Generate multiple questions at once rather than one at a time for efficiency

## Troubleshooting

### "Cannot find module '@google/generative-ai'"
**Solution**: Make sure you've installed the package:
```bash
npm install @google/generative-ai
```

### "Unauthorized" error
**Solution**: Verify that:
- You're logged in
- The API key is correct in `.env.local`
- You own the course you're trying to create quiz for

### "Invalid response format from Gemini API"
**Solution**: 
- Check your API key validity
- Try regenerating questions
- Check the chapter content quality

### Rate Limiting
If you hit rate limits on the Gemini API:
- Reduce the number of questions generated at once
- Add delays between requests
- Upgrade your Gemini API quota

## Cost Considerations

The Gemini API has a free tier with quotas. Check the [Google AI Pricing](https://ai.google.dev/pricing) page for details on:
- Free tier limits
- Paid tier pricing
- RPM (requests per minute) limits

## Security Considerations

1. **API Key Protection**: Never commit your API key to version control
2. **Use Environment Variables**: Store the API key in `.env.local` (which is gitignored)
3. **Authentication**: All endpoints require user authentication
4. **Course Ownership**: Verify course ownership before generating questions
5. **Input Validation**: Always validate input data

## Future Enhancements

Possible improvements:
1. Batch question generation with progress tracking
2. Question quality scoring
3. Support for different question types (short answer, essay, etc.)
4. Question difficulty verification
5. Caching of generated questions
6. Admin dashboard for monitoring generation

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Gemini API documentation at https://ai.google.dev/
3. Check browser console for error details
4. Review server logs for backend errors
