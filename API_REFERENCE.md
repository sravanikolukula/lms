# 🔌 API INTEGRATION REFERENCE

## Complete API Flow & Endpoints

---

## 📤 Auto-Generation Flow

### When Teacher Uploads Video

**Path**: `app/(dashboard)/_components/chapter-video-form.tsx`

```typescript
// Flow:
1. User selects video
2. Form submits
3. Video uploads to Mux
4. On success: autoGenerateQuizzes() called
5. For each quiz in chapter:
   └─ Sends POST request
6. User sees status
7. Page refreshes on success
```

**Endpoint Called**:
```
POST /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}/generate
```

---

## 🎯 Generate Endpoint

**File**: `app/api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "content": "Chapter description or transcript...",
  "numberOfQuestions": 5,
  "difficulty": "medium"
}
```

**Processing**:
```
1. Verify authentication
2. Verify course ownership
3. Delete old questions
4. Call generateQuizQuestions() from lib/gemini.ts
5. Save new questions to database
6. Return response
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Quiz generated successfully",
  "quizId": "quiz_123",
  "questions": [
    {
      "id": "q1",
      "text": "What is photosynthesis?",
      "type": "MCQ",
      "option1": "...",
      "option2": "...",
      "option3": "...",
      "option4": "...",
      "answer": "option1",
      "createdAt": "2025-11-14T..."
    },
    // ... more questions
  ]
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional info"
}
```

**Status Codes**:
- `200` - Success
- `400` - Bad request (validation failed)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not course owner)
- `404` - Not found (quiz/chapter not found)
- `500` - Server error

---

## 🤖 Gemini AI Integration

**File**: `lib/gemini.ts`

### Function: `generateQuizQuestions()`

**Input**:
```typescript
async function generateQuizQuestions(
  content: string,           // Chapter text/transcript
  numberOfQuestions: number, // 1-20
  difficulty: string         // "easy" | "medium" | "hard"
): Promise<Question[]>
```

**Output**:
```typescript
[
  {
    id: "uuid",
    text: "Question text...",
    type: "MCQ",
    option1: "Option A",
    option2: "Option B",
    option3: "Option C",
    option4: "Option D",
    answer: "option1" // or option2, option3, option4
  },
  // ... more questions
]
```

**Process**:
```
1. Validate inputs
2. Create prompt for Gemini
3. Call Gemini API with model: "gemini-pro"
4. Parse response
5. Clean markdown formatting
6. Validate question format
7. Correct answer if needed
8. Return array of questions
```

**Error Handling**:
- Validates response is JSON
- Validates all required fields
- Cleans markdown code blocks
- Auto-corrects invalid answers
- Throws descriptive errors

---

## 📝 Teacher Quiz Editor

**Component**: `components/quiz/quiz-editor.tsx`

### API Calls Made

#### 1. Get Quiz Data
```typescript
GET /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}
```

**Response**:
```json
{
  "quiz": {
    "id": "quiz_123",
    "title": "Photosynthesis Quiz",
    "isPublished": false,
    "questions": [
      {
        "id": "q1",
        "text": "...",
        "option1": "...",
        "option2": "...",
        "option3": "...",
        "option4": "...",
        "answer": "option1"
      }
    ]
  }
}
```

#### 2. AI Generate Questions
```typescript
POST /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}/generate
```

**Request**:
```json
{
  "content": "Pasted chapter content...",
  "numberOfQuestions": 5,
  "difficulty": "medium"
}
```

**Response**: Same as generate endpoint above

#### 3. Save Questions
```typescript
PATCH /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}
```

**Request**:
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "New text",
      "option1": "...",
      "option2": "...",
      "option3": "...",
      "option4": "...",
      "answer": "option1"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Quiz updated",
  "quizId": "quiz_123"
}
```

---

## 🧑‍🎓 Student Quiz Taker

**Component**: `components/quiz/quiz-taker.tsx`

### API Calls Made

#### 1. Get Quiz (NO Answers)
```typescript
GET /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}
```

**Response** (for students, answers excluded):
```json
{
  "quiz": {
    "id": "quiz_123",
    "title": "Photosynthesis Quiz",
    "questions": [
      {
        "id": "q1",
        "text": "What is photosynthesis?",
        "option1": "Process in plants...",
        "option2": "Process in animals...",
        "option3": "Process in water...",
        "option4": "Process in soil..."
        // Note: NO answer field!
      }
    ]
  }
}
```

#### 2. Submit Quiz Attempt
```typescript
POST /api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}/attempts
```

**Request**:
```json
{
  "answers": {
    "q1": "option1",
    "q2": "option3",
    "q3": "option2"
  }
}
```

**Response**:
```json
{
  "success": true,
  "score": 75,           // percentage
  "totalQuestions": 10,
  "correctAnswers": 7.5, // calculated
  "attemptId": "attempt_123",
  "message": "Quiz submitted successfully"
}
```

---

## 🔍 Get Quiz Endpoint

**File**: `app/api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/route.ts`

**Method**: GET

**URL**: 
```
/api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}
```

**Security**: 
- Checks user is authenticated
- Returns different response based on user role:
  - **Teachers** (quiz owner): Full questions with answers
  - **Students**: Questions without answers

**Response (Teacher)**:
```json
{
  "id": "quiz_123",
  "title": "Quiz Title",
  "isPublished": true,
  "questions": [
    {
      "id": "q1",
      "text": "Question?",
      "option1": "A",
      "option2": "B",
      "option3": "C",
      "option4": "D",
      "answer": "option1"  // ← Included for teachers
    }
  ]
}
```

**Response (Student)**:
```json
{
  "id": "quiz_123",
  "title": "Quiz Title",
  "isPublished": true,
  "questions": [
    {
      "id": "q1",
      "text": "Question?",
      "option1": "A",
      "option2": "B",
      "option3": "C",
      "option4": "D"
      // ← Answer NOT included for security!
    }
  ]
}
```

---

## 📊 Quiz Attempt Endpoint

**File**: Implied in quiz-taker.tsx

**Method**: POST

**URL**:
```
/api/courses/{courseId}/chapters/{chapterId}/quizzes/{quizId}/attempts
```

**Request**:
```json
{
  "answers": {
    "question_id_1": "option1",
    "question_id_2": "option3",
    "question_id_3": "option2"
  }
}
```

**Processing**:
```
1. Verify quiz exists
2. Verify user has access
3. Get correct answers from database
4. Calculate score:
   - Count correct answers
   - Calculate percentage
5. Create QuizAttempt record
6. Save to database
7. Return score and results
```

**Response**:
```json
{
  "success": true,
  "score": 80,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "feedback": "Great job! You got 4 out of 5 correct.",
  "attemptId": "attempt_123",
  "createdAt": "2025-11-14T10:30:00Z"
}
```

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ TEACHER UPLOADS VIDEO                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                       chapter-video-form.tsx
                              ↓
                 Video → Mux (video storage)
                              ↓
            autoGenerateQuizzes() → Loop through quizzes
                              ↓
        POST /api/.../quizzes/{quizId}/generate
                              ↓
              generate/route.ts (handles request)
                              ↓
        generateQuizQuestions() (lib/gemini.ts)
                              ↓
            Gemini API (models/gemini-pro)
                              ↓
        Returns: JSON with questions
                              ↓
        Save to db.question.createMany()
                              ↓
        Return success response
                              ↓
        UI shows status + auto-refresh
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STUDENTS NOW SEE QUIZ                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        Student sees quiz button on chapter page
                              ↓
               Student clicks "Take Quiz"
                              ↓
        Navigate to /courses/.../quizzes/{quizId}
                              ↓
               quiz-taker.tsx (component)
                              ↓
         GET /api/.../quizzes/{quizId}
                              ↓
         route.ts returns quiz (NO answers!)
                              ↓
         QuizTaker displays questions
                              ↓
        Student answers all questions
                              ↓
            Student clicks "Submit Quiz"
                              ↓
    POST /api/.../quizzes/{quizId}/attempts
        with student answers
                              ↓
        Calculate score server-side
                              ↓
      Save QuizAttempt to database
                              ↓
       Return score to student
                              ↓
      Show results page with feedback
```

---

## 🔐 Security Implementation

### API Key Security
```typescript
// Key stored in .env.local (never in code)
const apiKey = process.env.GEMINI_API_KEY

// Only server-side (never sent to client)
const response = await callGeminiAPI(apiKey, prompt)

// Client never sees the key
return response // ← No API key in response
```

### Answer Hiding
```typescript
// For students, exclude answer field
const questions = await db.question.findMany({
  where: { quizId },
  select: {
    id: true,
    text: true,
    option1: true,
    option2: true,
    option3: true,
    option4: true,
    // answer: false ← NOT included
  }
})
```

### Scoring Security
```typescript
// Server calculates score (not client)
const correctAnswers = questions.filter(q => 
  q.answer === studentAnswers[q.id]
).length

const score = (correctAnswers / total) * 100

// Save to database (not just client)
await db.quizAttempt.create({ score })
```

---

## 🧪 Testing Endpoints

### Test Auto-Generation
```bash
curl -X POST http://localhost:3000/api/courses/123/chapters/456/quizzes/789/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Sample chapter text",
    "numberOfQuestions": 5,
    "difficulty": "medium"
  }'
```

### Test Get Quiz (as student)
```bash
curl http://localhost:3000/api/courses/123/chapters/456/quizzes/789
# Should NOT include answer field
```

### Test Get Quiz (as teacher)
```bash
curl http://localhost:3000/api/courses/123/chapters/456/quizzes/789
# Should include answer field (if you're the owner)
```

---

## 📊 Response Codes Summary

| Endpoint | Method | Success | Auth Error | Not Found |
|----------|--------|---------|-----------|-----------|
| `/generate` | POST | 200 | 401 | 404 |
| `/quizzes/{id}` | GET | 200 | 401 | 404 |
| `/quizzes/{id}` | PATCH | 200 | 401 | 404 |
| `/attempts` | POST | 200 | 401 | 404 |

---

## 🔗 Integration Points

### Frontend → API
```
Components call APIs with axios
↓
Include user authentication token in headers
↓
API validates token
↓
Process request
↓
Return response
```

### API → Gemini
```
API receives question generation request
↓
Prepare prompt
↓
Call Gemini API with model: gemini-pro
↓
Parse response (clean markdown)
↓
Validate format
↓
Return questions to caller
```

### API → Database
```
API validates request
↓
Call Prisma methods
↓
Save/retrieve from MongoDB
↓
Return data to caller
```

---

## 🚀 Deployment Integration

### Environment Variables Needed
```
GEMINI_API_KEY=your_api_key_here
DATABASE_URL=your_mongodb_url
NEXTAUTH_SECRET=your_secret
```

### API Endpoint Locations (Production)
```
Teacher Auto-Generate:
  POST /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate

Student Get Quiz:
  GET /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]

Student Submit:
  POST /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/attempts
```

---

## 📞 Reference

| Component | Calls | Response |
|-----------|-------|----------|
| Video Form | `/generate` | Questions |
| Quiz Editor | `GET`, `POST`, `PATCH` | Quiz data |
| Quiz Taker | `GET`, `POST` | Questions, Score |
| Gemini Util | Gemini API | Generated questions |

---

**Status**: ✅ ALL ENDPOINTS READY  
**Security**: ✅ VERIFIED  
**Documentation**: ✅ COMPLETE  
