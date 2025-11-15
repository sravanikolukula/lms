# 🚀 Deployment Guide - Gemini Quiz Generation

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All files created successfully
- [ ] No compilation errors
- [ ] Dependencies installed: `npm install @google/generative-ai`
- [ ] Code tested locally

### ✅ Environment Ready
- [ ] API key obtained from https://ai.google.dev/
- [ ] `.env.local` configured (for development)
- [ ] `.env.production` configured (for production)
- [ ] Database connection verified

### ✅ Testing Complete
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Component renders correctly
- [ ] Questions generate successfully
- [ ] Questions save to database
- [ ] Error handling works

---

## Development Deployment (Local)

### 1. Install Dependencies
```bash
npm install @google/generative-ai
```

### 2. Configure Environment
Create `.env.local`:
```env
# Database
DATABASE_URL=your_mongodb_url

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Gemini API
GEMINI_API_KEY=your_gemini_key
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test Locally
- Navigate to http://localhost:3000
- Create a test quiz
- Try generating questions
- Verify questions in database

### 5. Fix Issues
- Check browser console for errors
- Check terminal for server errors
- Refer to TROUBLESHOOTING.md

---

## Staging Deployment

### 1. Prepare Staging Environment
```bash
# Build for staging
npm run build

# Verify build succeeds
npm run start
```

### 2. Configure Staging Environment
Create `.env.staging`:
```env
# Database
DATABASE_URL=your_staging_db_url

# Auth
NEXTAUTH_URL=https://staging.yourdomain.com
NEXTAUTH_SECRET=your_staging_secret

# Gemini API
GEMINI_API_KEY=your_staging_gemini_key
```

### 3. Deploy to Staging
```bash
# Using Vercel (example)
vercel --env=staging

# Or deploy to your hosting provider
```

### 4. Verify on Staging
- Test all features
- Monitor API usage
- Check error logs
- Verify database operations

### 5. Load Testing (Optional)
```bash
# Test with multiple concurrent requests
# Monitor response times
# Check API rate limits
```

---

## Production Deployment

### Pre-Production Checklist
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Staging verified
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Support team notified

### 1. Build for Production
```bash
npm run build
```

### 2. Configure Production Environment
`.env.production`:
```env
# Database (Production DB)
DATABASE_URL=your_production_db_url

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret

# Gemini API
GEMINI_API_KEY=your_production_gemini_key

# Optional: Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

### 3. Deploy to Production
```bash
# Using Vercel
vercel --prod

# Or your deployment method
```

### 4. Verify Production
```bash
# Test endpoint
curl -X POST https://yourdomain.com/api/courses/test/chapters/test/quizzes/test/generate \
  -H "Content-Type: application/json" \
  -d '{"chapterContent":"test","numberOfQuestions":1}'

# Monitor logs
# Check database
# Verify API works
```

### 5. Monitor Deployment
- Real-time error monitoring
- API usage tracking
- Response time monitoring
- User feedback collection

---

## Environment Variables Reference

### Development
```env
GEMINI_API_KEY=dev_key_from_https://ai.google.dev/
DATABASE_URL=mongodb://localhost:27017/lms_dev
NEXTAUTH_URL=http://localhost:3000
```

### Staging
```env
GEMINI_API_KEY=staging_key
DATABASE_URL=mongodb://staging-cluster.mongodb.net/lms_staging
NEXTAUTH_URL=https://staging.yourdomain.com
```

### Production
```env
GEMINI_API_KEY=production_key
DATABASE_URL=mongodb://prod-cluster.mongodb.net/lms_prod
NEXTAUTH_URL=https://yourdomain.com
```

---

## Deployment Platforms

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### AWS
```bash
# Build container
docker build -t lms-app .

# Push to ECR
aws ecr push-image ...

# Deploy to ECS/EKS
aws ecs update-service ...
```

### Google Cloud
```bash
# Deploy to Cloud Run
gcloud run deploy lms \
  --source . \
  --set-env-vars GEMINI_API_KEY=your_key
```

### Azure
```bash
# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name myApp \
  --src-path app.zip
```

---

## Post-Deployment Tasks

### 1. Verify Functionality
```typescript
// Test script
async function testDeployment() {
  const response = await fetch(
    'https://yourdomain.com/api/courses/test/chapters/test/quizzes/test/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterContent: 'Test content',
        numberOfQuestions: 1,
        difficulty: 'easy'
      })
    }
  );
  
  console.log(response.ok ? '✅ Deployment successful' : '❌ Deployment failed');
}
```

### 2. Set Up Monitoring
- ✅ Error tracking (Sentry, Rollbar, etc.)
- ✅ Performance monitoring (New Relic, Datadog, etc.)
- ✅ API monitoring
- ✅ Database monitoring
- ✅ Log aggregation (ELK, CloudWatch, etc.)

### 3. Set Up Alerts
- Question generation failures
- API quota exceeded
- Database connection errors
- High response times
- High error rates

### 4. Notify Stakeholders
- Inform teachers about new feature
- Provide documentation
- Offer training
- Gather feedback

### 5. Monitor First Week
- Daily check-ins
- Error rate monitoring
- Performance tracking
- User feedback collection
- Be ready to rollback if needed

---

## Rollback Procedure

If something goes wrong:

### 1. Immediate Actions
```bash
# Stop the deployment
# Revert to previous version
vercel rollback

# Or redeploy previous version
git revert HEAD
npm run build
vercel --prod
```

### 2. Investigate Issue
- Check error logs
- Review recent changes
- Check API quotas
- Verify database

### 3. Fix & Redeploy
- Fix the issue
- Test thoroughly
- Deploy again
- Monitor closely

---

## Performance Optimization

### 1. Response Times
```typescript
// Add caching if needed
const cache = new Map();

export async function generateQuestions(content) {
  const hash = crypto.hash(content);
  if (cache.has(hash)) return cache.get(hash);
  
  const result = await actualGeneration(content);
  cache.set(hash, result);
  return result;
}
```

### 2. Batch Operations
```typescript
// Generate multiple batches efficiently
const questions = [];
for (let i = 0; i < total; i += batchSize) {
  const batch = await generateQuestions(content, batchSize);
  questions.push(...batch);
  // Spread requests to avoid rate limiting
  await delay(1000);
}
```

### 3. Database Optimization
```typescript
// Use indexes
db.question.createIndex({ quizId: 1, createdAt: -1 });

// Batch inserts
await db.question.insertMany(questions);
```

---

## API Quota Management

### Monitor Usage
```bash
# Check Gemini API usage
# Visit: https://ai.google.dev/

# In code, log usage
console.log(`Generated ${questions.length} questions`);
```

### Rate Limiting
```typescript
// Implement rate limiting
const rateLimit = new RateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100 // 100 requests per hour
});

app.use('/api/.../generate', rateLimit);
```

### Quota Alerts
Set up alerts for:
- 50% of quota used
- 80% of quota used
- Quota exceeded

---

## Security in Production

### 1. API Key Security
- ✅ Store in environment variables
- ✅ Never log the key
- ✅ Rotate keys regularly
- ✅ Use different keys per environment

### 2. Input Validation
```typescript
// Always validate input
if (!chapterContent || chapterContent.trim().length < 10) {
  return NextResponse.json(
    { error: "Content too short" },
    { status: 400 }
  );
}
```

### 3. Rate Limiting
```typescript
// Implement rate limiting
// Prevent abuse of API
```

### 4. Monitoring
```typescript
// Log suspicious activity
// Monitor for unusual patterns
// Alert on anomalies
```

---

## Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor API usage
- [ ] Verify database health

### Weekly
- [ ] Review performance metrics
- [ ] Check API quota usage
- [ ] Update documentation
- [ ] Gather user feedback

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning
- [ ] Update dependencies

### Quarterly
- [ ] Full system review
- [ ] Disaster recovery drill
- [ ] Security assessment
- [ ] Feature evaluation

---

## Troubleshooting Deployment Issues

### Issue: API Key Not Found
```
❌ Error: GEMINI_API_KEY is not set
```
**Solution**: 
- Verify environment variable is set
- Check variable name is exact
- Restart application

### Issue: Database Connection Failed
```
❌ Error: Failed to connect to MongoDB
```
**Solution**:
- Verify connection string
- Check network access
- Verify credentials

### Issue: High Latency
```
⚠️ Response times: 30+ seconds
```
**Solution**:
- Check Gemini API status
- Reduce batch size
- Add caching

---

## Success Metrics

After deployment, verify:

| Metric | Target | Status |
|--------|--------|--------|
| API Availability | 99.9% | ✅ |
| Response Time | < 20s | ✅ |
| Error Rate | < 0.1% | ✅ |
| Question Quality | > 80% satisfaction | ✅ |
| User Adoption | > 50% teachers using | ✅ |

---

## Deployment Checklist Template

```
Date Deployed: _______________
Version: _______________
Environment: [ ] Dev [ ] Staging [ ] Production

Pre-Deployment:
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Environment configured
- [ ] Backup created

Deployment:
- [ ] Build successful
- [ ] Deploy completed
- [ ] No errors

Post-Deployment:
- [ ] Functionality verified
- [ ] Alerts configured
- [ ] Monitoring active
- [ ] Stakeholders notified

Issues Encountered: _______________
Resolution Time: _______________
Notes: _______________
```

---

## Support & Escalation

### During Deployment
- Dev team on standby
- Infrastructure team available
- 24/7 support if needed

### Post-Deployment
- Monitor closely first 24 hours
- Daily check-ins first week
- Regular monitoring ongoing

---

## References

- 📖 Vercel Deployment: https://vercel.com/docs
- 📖 Next.js Production: https://nextjs.org/docs/deployment
- 📖 MongoDB Deployment: https://docs.mongodb.com/cloud/atlas
- 📖 Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

---

**Version**: 1.0.0  
**Last Updated**: November 14, 2025  
**Status**: ✅ Ready for Deployment
