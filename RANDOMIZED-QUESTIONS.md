# Randomized Question Pool System

## Overview

The SOP Management System features a robust anti-cheating mechanism where admins create a pool of 9-20 questions for each competency test, but users only see 3 randomly selected questions. This prevents answer sharing between staff members while maintaining test integrity.

## Key Features

### Question Pool Requirements
- **Minimum:** 9 questions per test
- **Maximum:** 20 questions per test
- **Shown to users:** 3 questions (randomly selected)
- **Passing requirement:** 100% (all 3 correct)

### Deterministic Randomization
- Each user gets a unique set of 3 questions
- Same user on same attempt always sees the same 3 questions
- Different attempts show different questions
- Based on: User ID + Attempt Number + Test ID
- Completely deterministic and reproducible

### Anti-Cheating Benefits
1. Users cannot share answers (different questions)
2. Each retry shows new questions (prevents memorization)
3. Still requires full understanding (100% pass rate)
4. Large question pool ensures variety
5. Audit trail shows which questions were asked

## How It Works

### For Admins

**Creating a Test:**
1. Navigate to SOP Management
2. Create or edit an SOP
3. Click "Add Test" or "Edit Test"
4. System provides 9 empty question slots by default
5. Add 9-20 questions with:
   - Question text
   - 4 multiple choice options
   - Correct answer selection
6. Cannot save with < 9 or > 20 questions
7. Passing score automatically set to 100%

**Editing a Test:**
- Can edit tests even with existing results
- System shows warning if results exist
- Old results preserve their question references
- Recommended: Create new version instead of editing

**Assignment Restrictions:**
- Cannot assign SOPs with tests having < 9 questions
- System shows warning badges on incomplete tests
- Assignment modal only shows SOPs with 9+ questions

### For Users

**Taking a Test:**
1. Open assigned SOP
2. Review content
3. Click "Start Competency Test"
4. See message: "You must answer all questions correctly to pass (100% required)"
5. Answer 3 questions (displayed as "Question 1 of 3", "Question 2 of 3", "Question 3 of 3")
6. No indication of question pool size
7. Submit test

**Scoring:**
- **3/3 correct = 100% = PASS** ✓ (proceed to signature)
- **2/3 correct = 67% = FAIL** ✗ (can retry)
- **1/3 correct = 33% = FAIL** ✗ (can retry)
- **0/3 correct = 0% = FAIL** ✗ (can retry)

**Retaking:**
- Each retry shows 3 NEW random questions
- Attempt tracked (Attempt #1, #2, #3, etc.)
- No limit on retry attempts
- Must achieve 100% to pass

## Technical Implementation

### Database Schema

**TestResult Model:**
```prisma
model TestResult {
  // ... existing fields ...
  questionsShown Json?        // Array of question IDs shown
  attemptNumber  Int  @default(1)  // Retry tracking
}
```

**CompetencyTest:**
- passingScore default changed to 100

### Deterministic Randomization Algorithm

```typescript
1. Calculate seed = hash(userId + attemptNumber + testId)
2. Use Linear Congruential Generator (LCG) for seeded random
3. Fisher-Yates shuffle all questions with seeded random
4. Select first 3 from shuffled array
5. Return selected questions
```

**Why Deterministic?**
- Same inputs = same output
- User can refresh page without losing their questions
- Reproducible for debugging
- Consistent test experience

### Question Selection Process

When user opens SOP to take test:
1. API counts previous attempts
2. Calculates: attemptNumber = previous + 1
3. Generates seed from user ID + attempt + test ID
4. Shuffles question pool with seed
5. Returns first 3 questions
6. User sees only those 3

### Test Submission

When user submits answers:
1. Frontend sends: answers + questionsShown array
2. Backend validates only the 3 questions shown
3. Calculates score based on 3 questions
4. Stores questionsShown and attemptNumber
5. Returns result with signature requirement if passed

## Admin Views

### Test Results Detail

**Shows:**
- Header: "Questions Asked (3 of 9 total)"
- Note: "This user was shown 3 randomly selected questions from the question pool"
- Only the 3 questions that were asked
- Each question marked correct/incorrect
- Summary shows "X out of 3" not "X out of 9"
- Attempt number if > 1

**Benefits:**
- Clear audit trail
- Know exactly which questions user saw
- Can review performance on specific questions
- Historical record preserved

### SOP Management

**Visual Indicators:**
- Tests with < 9 questions show warning badge
- Cannot assign until 9+ questions added
- Question count visible in test details

## Examples

### Scenario 1: Different Users, Same Test

**Test Pool:** 9 questions (Q1-Q9)

- **User A (Attempt 1):** Sees Q2, Q5, Q8
- **User B (Attempt 1):** Sees Q1, Q4, Q7
- **User C (Attempt 1):** Sees Q3, Q6, Q9

Result: Each user gets different questions, cannot share answers

### Scenario 2: Same User, Multiple Attempts

**User A's journey:**
- **Attempt 1:** Sees Q2, Q5, Q8 → Scores 67% (2/3) → FAIL
- **Attempt 2:** Sees Q1, Q4, Q9 → Scores 100% (3/3) → PASS ✓

Result: Retry shows different questions, prevents memorization

### Scenario 3: Test Editing

- Admin creates test with 12 questions
- 5 users complete it (various 3-question subsets)
- Admin edits test, changes question #4
- Historical results still show original question #4
- New attempts use updated question #4
- System shows warning during edit

## Migration from Old System

### Existing Tests

**Tests with < 9 questions:**
- Show warning badge: "⚠️ Needs X more questions"
- Cannot be assigned to new users
- Existing assignments remain valid (backwards compatible)
- Admin must add questions to enable new assignments

**Tests with ≥ 9 questions:**
- Work immediately with randomization
- If passingScore was 80%, now shows 100% for new tests
- Existing tests keep their passingScore setting

## Best Practices

### For Admins

1. **Create diverse questions** covering all SOP aspects
2. **Use 12-15 questions** for good variety (not just minimum 9)
3. **Review question difficulty** - all should be answerable from SOP
4. **Update tests regularly** when SOP content changes
5. **Monitor pass rates** - if too low, review question quality

### Creating Good Question Pools

**Do:**
- Cover main topics evenly
- Mix easy, medium, hard questions
- Use clear, unambiguous language
- Test understanding, not memorization
- Include practical scenarios

**Don't:**
- Create trick questions
- Use overly similar questions
- Focus on trivial details
- Make questions interdependent

## Troubleshooting

### "Minimum 9 questions required"
- Add more questions to the test
- Count current questions in test modal
- Save not allowed until 9+ added

### "Test must have at least 9 questions before assignment"
- Test exists but has < 9 questions
- Edit test and add more questions
- Then assignment will be allowed

###"No SOPs Available" in assignment modal
- All tests have < 9 questions
- Edit tests to add more questions
- Or create new SOPs with proper tests

### User sees fewer than 3 questions
- Test has < 3 questions total (shouldn't happen with 9 minimum)
- System shows all available questions if < 3

## Security & Integrity

### Anti-Cheating Measures
- Different questions per user
- New questions on retry
- 100% pass requirement (no partial credit)
- Cannot see question pool size
- Cannot predict which questions will appear

### Audit Trail
- questionsShown stored in every TestResult
- Admin can see exactly which questions user answered
- Attempt number tracked
- Complete transparency for compliance

### Data Integrity
- Question IDs preserved even if questions edited
- Historical results remain intact
- Deterministic = reproducible
- No random failures or inconsistencies

## API Endpoints

### POST `/api/tests`
- Validates 9-20 questions
- Sets passingScore to 100 by default
- Returns error if out of range

### PUT `/api/tests/[id]`
- Validates 9-20 questions
- Checks for existing results
- Shows warning if results exist
- Allows edit but preserves history

### GET `/api/sops/[id]`
- For users: Returns 3 randomized questions
- For admins: Returns all questions
- Calculates attempt number
- Uses deterministic selection

### POST `/api/tests/submit`
- Accepts questionsShown array
- Validates only shown questions
- Stores attempt number
- Requires 100% for pass

## Performance Considerations

- Randomization happens server-side
- Minimal overhead (simple hash + shuffle)
- No external dependencies
- Scales to any user count
- Questions cached in memory during request

## Future Enhancements

Potential improvements:
- Configurable question count (e.g., 5 of 15)
- Difficulty-weighted randomization
- Category-based question distribution
- Question usage analytics
- Performance metrics per question
- Adaptive difficulty based on user performance

