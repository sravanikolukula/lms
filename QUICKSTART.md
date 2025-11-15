# 🤖 Gemini AI Quiz Question Auto-Generation - Quick Start Guide

## 📦 What You're Getting

A complete system to automatically generate quiz questions using Google's Gemini AI. Transform your manual quiz creation process into a one-click automated system!

## 🚀 3-Minute Setup

### Step 1: Install Package
```bash
npm install @google/generative-ai
```

### Step 2: Get Your API Key
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key

### Step 3: Add to Environment
Edit `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

✅ Done! Restart your server and you're ready to go.

## 🎯 How to Use

### Option 1: Use the Component (Easiest)

```typescript
import { GenerateQuizQuestionsButton } from "@/components/quiz/generate-questions-button";

export function YourQuizPage() {
  return (
    <GenerateQuizQuestionsButton
      courseId="course-123"
      chapterId="chapter-456"
      quizId="quiz-789"
      onSuccess={() => console.log("Questions generated!")}
    />
  );
}
```

### Option 2: Use the Hook

```typescript
import { useGenerateQuizQuestions } from "@/hooks/use-generate-quiz-questions";

export function MyComponent() {
  const { generateQuestions, isLoading } = useGenerateQuizQuestions();
  
  const handleClick = async () => {
    await generateQuestions({
      chapterContent: "Your chapter content here...",
      numberOfQuestions: 5,
      difficulty: "medium"
    });
  };
  
  return <button onClick={handleClick}>{isLoading ? "Generating..." : "Generate"}</button>;
}
```

### Option 3: Direct API Call

```typescript
const response = await fetch(
  `/api/courses/courseId/chapters/chapterId/quizzes/quizId/generate`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chapterContent: 'Your chapter content...',
      numberOfQuestions: 5,
      difficulty: 'medium'
    })
  }
);
const data = await response.json();
```

## 📊 System Architecture

```
┌─────────────────────────────────────────────┐
│         Teacher/UI                          │
│  [Generate with AI Button]                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  GenerateQuizQuestionsButton Component      │
│  • Input chapter content                    │
│  • Select difficulty (easy/medium/hard)     │
│  • Choose number of questions               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  useGenerateQuizQuestions Hook              │
│  • Manages loading state                    │
│  • Handles errors                           │
│  • Triggers API call                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  API Route: /api/.../generate               │
│  • Validates authentication                 │
│  • Verifies course ownership                │
│  • Calls Gemini API                         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  lib/gemini.ts                              │
│  • Generates questions                      │
│  • Formats for database                     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Google Gemini API                          │
│  • Generates MCQ questions                  │
│  • Creates multiple options                 │
│  • Provides correct answer                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  MongoDB Database                           │
│  • Saves questions                          │
│  • Links to quiz                            │
│  • Ready for students                       │
└─────────────────────────────────────────────┘
```

## 📁 Files Created

```
lms/
├── lib/
│   └── gemini.ts ........................... Gemini API utility functions
├── hooks/
│   └── use-generate-quiz-questions.ts ..... React hook for UI integration
├── components/quiz/
│   └── generate-questions-button.tsx ...... Ready-to-use React component
├── app/api/courses/
│   └── [courseId]/chapters/[chapterId]/quizzes/[quizId]/generate/
│       └── route.ts ........................ API endpoint
└── 📚 Documentation
    ├── IMPLEMENTATION_COMPLETE.md ......... Overview & summary
    ├── IMPLEMENTATION_GUIDE.md ........... Detailed technical guide
    ├── QUIZ_AUTO_GENERATION_GUIDE.md .... Feature documentation
    ├── SETUP_CHECKLIST.md ............... Step-by-step setup
    └── EXAMPLE_INTEGRATION.tsx .......... Code examples
```

## ✨ Features

| Feature | Status |
|---------|--------|
| Automatic question generation | ✅ |
| MCQ format (4 options) | ✅ |
| Configurable difficulty | ✅ |
| Batch generation (1-20 questions) | ✅ |
| Database auto-save | ✅ |
| Authentication & authorization | ✅ |
| User-friendly UI component | ✅ |
| Error handling & logging | ✅ |
| Production ready | ✅ |

## 📊 Question Format

Generated questions follow this structure:

```json
{
  "id": "unique_id",
  "text": "What is React?",
  "type": "MCQ",
  "option1": "Backend framework",
  "option2": "JavaScript library for UIs",
  "option3": "CSS framework",
  "option4": "Database system",
  "answer": "JavaScript library for UIs",
  "quizId": "quiz_123"
}
```

## ⚙️ Configuration

### Difficulty Levels
- **Easy**: Basic concepts, straightforward questions
- **Medium**: Mixed difficulty, practical application (default)
- **Hard**: Complex concepts, critical thinking

### Number of Questions
- Minimum: 1
- Recommended: 5-10
- Maximum: 20 (can be extended)

### API Settings
```typescript
// Gemini model (in lib/gemini.ts)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

## 🔒 Security

✅ API key stored in `.env.local` (never in code)  
✅ Authentication required  
✅ Course ownership verified  
✅ Input validation  
✅ Error handling doesn't expose sensitive data  

## 💰 Pricing

- **Free Tier**: Generous quotas (ideal for testing)
- **Paid Tier**: $1.50/1M input tokens, $6/1M output tokens
- Monitor usage: https://ai.google.dev/

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_COMPLETE.md` | Project overview & summary |
| `IMPLEMENTATION_GUIDE.md` | Technical details & API reference |
| `QUIZ_AUTO_GENERATION_GUIDE.md` | Feature documentation |
| `SETUP_CHECKLIST.md` | Step-by-step setup guide |
| `EXAMPLE_INTEGRATION.tsx` | Code examples & usage patterns |

## 🐛 Common Issues & Fixes

### "Cannot find module '@google/generative-ai'"
```bash
npm install @google/generative-ai
```

### "GEMINI_API_KEY is not set"
- Add to `.env.local`: `GEMINI_API_KEY=your_key`
- Restart server: `npm run dev`

### "Unauthorized" error
- Make sure you're logged in
- Verify you own the course
- Check API key is valid

### Generation is slow
- It takes 5-15 seconds - this is normal
- Check internet connection
- Try with fewer questions

## 📋 What Happens Next?

**Teacher workflow:**
1. Creates a new quiz
2. Clicks "Generate with AI"
3. Pastes chapter content (2-3 paragraphs)
4. Selects difficulty and number of questions
5. Clicks "Generate"
6. ✅ Questions appear in seconds!
7. Can review, edit, or regenerate
8. Publishes quiz to students

## 🎯 Best Practices

1. **Input Quality**: Provide clear, comprehensive chapter content
2. **Difficulty**: Match your student level
3. **Quantity**: 5-10 questions per quiz is ideal
4. **Review**: Always review generated questions before publishing
5. **Variety**: Generate questions about different topics for quizzes

## 📞 Support

- 📖 Full guide: Read `IMPLEMENTATION_GUIDE.md`
- 💡 Examples: Check `EXAMPLE_INTEGRATION.tsx`
- 🔗 Gemini Docs: https://ai.google.dev/
- 📚 API Docs: https://ai.google.dev/api

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Install Gemini package
- [ ] Get and add API key
- [ ] Import and use GenerateQuizQuestionsButton
- [ ] Generate sample questions
- [ ] See questions in database
- [ ] Edit generated questions
- [ ] Publish quiz to students
- [ ] Teachers love the time savings!

## 🎉 Ready to Go!

You now have a **production-ready AI question generation system**. Teachers can create high-quality quizzes in minutes instead of hours!

### Next Step: Read the Implementation Guide
👉 Open `IMPLEMENTATION_GUIDE.md` for detailed setup instructions.

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 14, 2025  
**Questions?** Check the documentation files in your project root!
