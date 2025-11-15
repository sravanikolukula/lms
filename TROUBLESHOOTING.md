# 🔧 Troubleshooting Guide - Gemini Quiz Generation

## Common Issues & Solutions

### 🚨 Installation Issues

#### Issue: "Cannot find module '@google/generative-ai'"

**Error Message:**
```
Cannot find module '@google/generative-ai' or its corresponding type declarations.
```

**Causes:**
- Package not installed
- Node modules not updated
- Wrong installation method

**Solutions:**
```bash
# Install the package
npm install @google/generative-ai

# Or if using yarn
yarn add @google/generative-ai

# Reinstall node modules if needed
rm -rf node_modules package-lock.json
npm install
```

---

### 🚨 Environment Variable Issues

#### Issue: "GEMINI_API_KEY is not defined"

**Error Message:**
```
Error: GEMINI_API_KEY is not set or empty
```

**Causes:**
- `.env.local` not created
- Wrong variable name
- Typo in key
- Server not restarted after adding key

**Solutions:**

1. **Check `.env.local` exists:**
   ```bash
   # Windows
   type .env.local
   
   # Mac/Linux
   cat .env.local
   ```

2. **Verify format:**
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
   ✅ Correct: `GEMINI_API_KEY=sk_...`
   ❌ Wrong: `GEMINI API KEY=...` (space in name)

3. **Restart server:**
   ```bash
   npm run dev
   ```

4. **Verify it's loading:**
   ```typescript
   console.log(process.env.GEMINI_API_KEY); // Should not be undefined
   ```

---

#### Issue: Invalid API Key

**Error Message:**
```
401 Unauthorized
Error: Invalid API key provided
```

**Causes:**
- Wrong key copied
- Key regenerated and not updated
- Extra spaces in key
- Key revoked

**Solutions:**

1. **Get a new key:**
   - Visit https://ai.google.dev/
   - Go to API Keys section
   - Create a new key
   - Copy exactly (no extra spaces)

2. **Verify key format:**
   ```env
   # Should start with certain pattern
   GEMINI_API_KEY=AIzaSy...
   ```

3. **Enable API:**
   - Ensure Generative AI API is enabled in Google Cloud Console
   - Check API quotas and limits

---

### 🚨 Authentication Issues

#### Issue: "Unauthorized - User not authenticated"

**Error Message:**
```
Unauthorized
```

**Response Code:** `401`

**Causes:**
- User not logged in
- Session expired
- Cookie not set

**Solutions:**

1. **Log out and log back in:**
   ```typescript
   // Clear session
   const response = await fetch('/api/auth/signout', { method: 'POST' });
   ```

2. **Check NextAuth configuration:**
   - Verify `auth.config.ts` is correct
   - Ensure callbacks are properly configured
   - Check session strategy

3. **Clear browser cache:**
   - Open DevTools (F12)
   - Clear cookies for localhost
   - Refresh page

---

#### Issue: "Unauthorized - Course ownership verification failed"

**Error Message:**
```
Unauthorized
(Cannot find course with given ID and userId)
```

**Response Code:** `401`

**Causes:**
- User doesn't own the course
- Wrong courseId passed
- Course was deleted

**Solutions:**

1. **Verify course ownership:**
   ```typescript
   // Check if user owns course
   const course = await db.course.findUnique({
     where: {
       id: courseId,
       userId: currentUserId // Must match logged-in user
     }
   });
   ```

2. **Check courseId parameter:**
   - Ensure correct ID is passed from URL
   - Verify ID exists in database
   - Check ID format

3. **Verify user role:**
   - User must be TEACHER or ADMIN to create quizzes
   - Check user roles in database

---

### 🚨 API Endpoint Issues

#### Issue: "Course Not Found" or "Quiz Not Found"

**Error Message:**
```
404 Not Found
```

**Causes:**
- Wrong courseId
- Wrong quizId
- Course/Quiz was deleted
- Wrong URL structure

**Solutions:**

1. **Verify URL structure:**
   ```
   ✅ Correct: /api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate
   ❌ Wrong: /api/courses/generate
   ```

2. **Check IDs exist:**
   ```typescript
   // Verify in database
   const course = await db.course.findUnique({ where: { id: courseId } });
   const quiz = await db.quiz.findUnique({ where: { id: quizId } });
   ```

3. **Check URL parameters:**
   - Log the parameters being sent
   - Verify they match the database IDs

---

#### Issue: "Bad Request: Missing courseId"

**Error Message:**
```
400 Bad Request
Missing required parameters
```

**Causes:**
- Parameters not extracted from URL
- Dynamic route not set up correctly
- Middleware interfering

**Solutions:**

1. **Verify file structure:**
   ```
   ✅ /app/api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/generate/route.ts
   ❌ /app/api/generate/route.ts (missing dynamic segments)
   ```

2. **Check parameter extraction:**
   ```typescript
   const { courseId, chapterId, quizId } = params;
   // These must be extracted from params object
   ```

---

### 🚨 Request Body Issues

#### Issue: "Chapter content is required"

**Error Message:**
```
400 Bad Request
Chapter content is required
```

**Causes:**
- `chapterContent` not included in request
- Empty string passed
- Wrong field name

**Solutions:**

1. **Check request body:**
   ```typescript
   ✅ Correct:
   {
     "chapterContent": "Your content here...",
     "numberOfQuestions": 5,
     "difficulty": "medium"
   }
   
   ❌ Wrong:
   {
     "content": "...",  // Wrong field name
     "questions": 5     // Wrong field name
   }
   ```

2. **Ensure content is not empty:**
   ```typescript
   if (!chapterContent || !chapterContent.trim()) {
     // Content is empty - will fail
   }
   ```

---

### 🚨 Gemini API Issues

#### Issue: "Invalid response format from Gemini API"

**Error Message:**
```
Error: Invalid response format from Gemini API
```

**Causes:**
- Gemini returned unexpected format
- JSON parsing failed
- API response was error
- Timeout occurred

**Solutions:**

1. **Check chapter content quality:**
   - Provide more substantial content
   - Use clear language
   - Include key concepts

2. **Try with fewer questions:**
   ```typescript
   // Instead of
   numberOfQuestions: 20
   
   // Try
   numberOfQuestions: 5
   ```

3. **Check API status:**
   - Visit https://ai.google.dev/
   - Check for service outages
   - Verify API is enabled

4. **Add logging for debugging:**
   ```typescript
   const text = response.text();
   console.log("Raw response:", text); // See what Gemini returned
   const questions = JSON.parse(text);
   ```

---

#### Issue: "429 Too Many Requests"

**Error Message:**
```
429 Too Many Requests
Rate limit exceeded
```

**Causes:**
- Too many requests in short time
- API quota exceeded
- Rate limiting triggered

**Solutions:**

1. **Add delay between requests:**
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
   ```

2. **Reduce batch size:**
   ```typescript
   // Instead of
   numberOfQuestions: 20
   
   // Use
   numberOfQuestions: 5
   ```

3. **Check API quotas:**
   - Visit https://ai.google.dev/
   - Check RPM (Requests Per Minute)
   - Upgrade if needed

---

### 🚨 Database Issues

#### Issue: "Internal Server Error" when saving questions

**Error Message:**
```
500 Internal Server Error
```

**Causes:**
- Database connection lost
- Prisma schema mismatch
- Database query error

**Solutions:**

1. **Check database connection:**
   ```bash
   # Test connection
   npx prisma db execute --stdin
   ```

2. **Verify Prisma schema:**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Check for schema issues
   npx prisma validate
   ```

3. **Check logs:**
   ```typescript
   console.log("[QUIZ_AUTO_GENERATE]", error);
   // Check console output for specific error
   ```

---

### 🚨 Frontend Component Issues

#### Issue: Component doesn't render

**Causes:**
- Component not imported correctly
- Missing dependencies
- Props not passed

**Solutions:**

1. **Check import:**
   ```typescript
   ✅ import { GenerateQuizQuestionsButton } from "@/components/quiz/generate-questions-button";
   ❌ import { GenerateQuestionsButton } from "@/components";
   ```

2. **Verify props:**
   ```typescript
   ✅ <GenerateQuizQuestionsButton 
     courseId={courseId}
     chapterId={chapterId}
     quizId={quizId}
   />
   
   ❌ <GenerateQuizQuestionsButton /> (missing required props)
   ```

3. **Check dependencies:**
   ```bash
   npm ls @radix-ui/react-dialog
   npm ls sonner
   ```

---

#### Issue: Hook error - "useParams is not available"

**Causes:**
- Using in non-client component
- Route structure mismatch

**Solutions:**

1. **Add 'use client' directive:**
   ```typescript
   "use client"; // Add at top of file
   
   import { useParams } from "next/navigation";
   ```

2. **Verify route structure:**
   - Component must be in app router
   - Must be client component

---

### 🚨 Network Issues

#### Issue: Timeout or slow responses

**Error:**
```
Error: Request timeout
```

**Causes:**
- Internet connection slow
- Gemini API slow
- Large content being processed

**Solutions:**

1. **Increase timeout:**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
   ```

2. **Use shorter content:**
   - Provide concise chapter summary
   - Remove unnecessary text

3. **Try again:**
   - Gemini API is usually fast (5-15 seconds)
   - Network issues are temporary

---

### 🚨 Question Quality Issues

#### Issue: Generated questions are poor quality

**Causes:**
- Chapter content is too short
- Content is unclear
- Difficulty setting mismatch

**Solutions:**

1. **Improve chapter content:**
   ```
   ❌ "React is good"
   ✅ "React is a JavaScript library for building user interfaces with reusable components. It uses a virtual DOM for efficient updates and supports hooks for state management."
   ```

2. **Adjust difficulty:**
   - Use "easy" for foundational concepts
   - Use "medium" for practical application
   - Use "hard" for advanced topics

3. **Regenerate:**
   - Generate again with better content
   - Quality may vary - this is normal

---

## 📊 Debug Checklist

Use this when something isn't working:

- [ ] Is the package installed? (`npm list @google/generative-ai`)
- [ ] Is the API key in `.env.local`? (run `echo %GEMINI_API_KEY%` on Windows)
- [ ] Did you restart the server after adding the key? (`npm run dev`)
- [ ] Are you logged in as a teacher/admin?
- [ ] Do you own the course you're testing with?
- [ ] Is the courseId/quizId correct?
- [ ] Is the chapter content substantial (3+ sentences)?
- [ ] Can you see console logs for errors?
- [ ] Is the API key valid at https://ai.google.dev/?
- [ ] Check browser DevTools for network errors

---

## 🆘 Getting Help

### Check These Files First:
1. **IMPLEMENTATION_GUIDE.md** - Technical reference
2. **QUICKSTART.md** - Quick setup guide
3. **SETUP_CHECKLIST.md** - Step-by-step setup

### Resources:
- 🔗 Gemini API: https://ai.google.dev/
- 📚 Full docs: https://ai.google.dev/docs
- 🐛 Report issues: Check logs in browser DevTools

### Diagnostic Steps:
```typescript
// Add this to your component to debug
console.log("Environment:", process.env.GEMINI_API_KEY ? "Set" : "Not set");
console.log("User:", currentUser?.id);
console.log("Course ID:", courseId);
console.log("Quiz ID:", quizId);
```

---

## ✅ Verification Steps

**All working if:**
- ✅ npm install completes without errors
- ✅ Component renders without errors
- ✅ Can click "Generate" button
- ✅ Questions appear after 5-15 seconds
- ✅ Questions save to database
- ✅ No console errors

**If any fails, refer to relevant section above.**

---

**Last Updated:** November 14, 2025  
**Version:** 1.0.0
