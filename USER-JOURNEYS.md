# User Journeys - SOP Management System

## Journey 1: New Staff Member Onboarding

### Admin Perspective
```
1. Admin logs in → Redirected to /admin dashboard
2. Clicks "Manage Staff" → Navigate to /admin/staff
3. Clicks "+ Add Staff Member" → Modal appears
4. Fills form:
   - Name: "John Doe"
   - Email: "john@company.com"
   - Password: "welcome123"
   - Role: "User"
5. Clicks "Add Staff Member" → User created
6. Admin clicks "View Details" on new user
7. Admin clicks "+ Assign SOP" → Modal appears
8. Selects "Workplace Safety Procedures"
9. Clicks "Assign" → Assignment created
10. John receives access to the SOP
```

### New Staff Member Perspective
```
1. John receives welcome email with credentials
2. John visits the portal → Redirected to /login
3. Enters email and password
4. Clicks "Sign In" → Authenticated
5. Redirected to /dashboard
6. Sees "Workplace Safety Procedures" in Pending SOPs
7. Ready to start training
```

**Duration:** ~5 minutes
**Result:** New staff member onboarded and assigned first training

---

## Journey 2: Completing a Training Module

### Staff Member Journey
```
1. User logs in → Dashboard shows pending SOPs
2. Dashboard displays statistics:
   - Total Assigned: 3
   - Pending: 2
   - Completed: 1
   - Average Score: 85%

3. User sees "Workplace Safety Procedures" card
   - Status badge: "Pending"
   - Category: "Safety"
   
4. Clicks "Start Learning" → Navigate to /sops/[id]
   - Status automatically changes to "In Progress"
   
5. User reads SOP content:
   - Introduction
   - PPE requirements
   - Emergency procedures
   - Safety rules
   - Conclusion
   
6. Scrolls to bottom → Sees test card
   - "Ready to test your knowledge?"
   - Passing score: 80%
   
7. Clicks "Start Competency Test" → Test view loads

8. Answers questions:
   Q1: What should you do if you notice damaged PPE?
   ✓ Selects: "Report it immediately"
   
   Q2: What is the first action when hearing fire alarm?
   ✓ Selects: "Evacuate immediately"
   
   Q3: What to do when you identify a hazard?
   ✓ Selects: "Report it immediately to supervisor"

9. Clicks "Submit Test" → Processing...

10. Results screen appears:
   ✅ Congratulations! You Passed!
   - Score: 100%
   - Passing score: 80%
   - 3 out of 3 questions correct

11. Clicks "Back to Dashboard" → Navigate to /dashboard
    - SOP now appears in "Completed SOPs" section
    - Statistics updated:
      * Completed: 2
      * Pending: 1
      * Average Score: 92%
```

**Duration:** ~10-15 minutes
**Result:** Training completed, competency verified, records updated

---

## Journey 3: Creating a New SOP with Test

### Admin Journey
```
1. Admin logs in → /admin dashboard

2. Clicks "Manage SOPs" → Navigate to /admin/sops

3. Sees existing SOPs in grid:
   - Workplace Safety (v1.0, Safety) [Has Test]
   - Data Security (v1.0, IT Security) [Has Test]
   - Customer Service (v1.0, Customer Service)

4. Clicks "+ Create New SOP" → Modal opens

5. Fills SOP form:
   Title: "Emergency Response Procedures"
   Description: "Guidelines for handling workplace emergencies"
   Content: [Detailed procedures - multi-paragraph]
   Category: "Safety"
   Version: "1.0"

6. Clicks "Create SOP" → SOP created

7. Confirmation dialog: "SOP created! Add competency test?"
   Clicks "OK" → Test creation modal opens

8. Fills test form:
   Title: "Emergency Response Knowledge Test"
   Passing Score: 85
   
   Question 1:
   - Question: "What is the emergency contact number?"
   - Option 1: "911"
   - Option 2: "999"
   - Option 3: "112"
   - Option 4: "000"
   - Correct Answer: "911"
   
   Question 2:
   - Question: "First priority in an emergency?"
   - Option 1: "Call manager"
   - Option 2: "Ensure personal safety"
   - Option 3: "Document incident"
   - Option 4: "Clean up"
   - Correct Answer: "Ensure personal safety"

9. Clicks "+ Add Question" → Adds more questions

10. Clicks "Create Test" → Test created

11. SOP card now shows:
    - Emergency Response Procedures (v1.0, Safety)
    - [Has Test] badge
    - Assigned to 0 staff members

12. Ready to assign to staff
```

**Duration:** ~15-20 minutes
**Result:** New SOP created with competency test, ready for assignment

---

## Journey 4: Monitoring Staff Progress

### Admin Journey
```
1. Admin logs in → /admin dashboard

2. Dashboard shows key metrics:
   - Total Staff: 15
   - Total SOPs: 8
   - Total Assignments: 45
   - Average Pass Rate: 87%

3. Recent Test Results table shows:
   - Jane Smith | Workplace Safety | 100% | Passed | 2 days ago
   - John Doe | Data Security | 75% | Failed | 1 day ago
   - Mike Johnson | Customer Service | 95% | Passed | Today

4. Admin notices John failed → Clicks "View Details"

5. Navigate to John's profile → /admin/staff/[john-id]

6. Sees complete profile:
   Assigned SOPs:
   - ✅ Workplace Safety (Completed)
   - 🔄 Data Security (In Progress)
   - ⏳ Customer Service (Pending)
   
   Test Results:
   - Workplace Safety | 90% | Passed
   - Data Security | 75% | Failed
   
7. Admin sees John needs to retake Data Security test

8. Admin can:
   - Assign additional SOPs
   - Review test scores
   - Track overall progress
   - Monitor due dates

9. Clicks "+ Assign SOP" → Modal opens

10. Assigns "Emergency Response" to John
    → John now has new training in dashboard
```

**Duration:** ~5-10 minutes
**Result:** Complete visibility of staff training status, identified knowledge gaps

---

## Journey 5: Reviewing Personal Progress

### Staff Member Journey
```
1. User logs in → /dashboard

2. Sees personal statistics:
   - Total Assigned: 5
   - Pending: 1
   - Completed: 4
   - Average Score: 88%

3. Clicks "Progress" in navigation → /dashboard/progress

4. Views complete test history:
   
   | SOP Title            | Test Name           | Score | Result | Date     |
   |---------------------|---------------------|-------|--------|----------|
   | Workplace Safety    | Safety Knowledge    | 100%  | Passed | Oct 1    |
   | Data Security       | Security Test       | 85%   | Passed | Oct 3    |
   | Customer Service    | Service Excellence  | 90%   | Passed | Oct 5    |
   | Emergency Response  | Emergency Knowledge | 95%   | Passed | Oct 7    |

5. User can see:
   - All completed trainings
   - Scores for each test
   - Pass/Fail status
   - Completion dates
   - Which tests required passing score

6. User identifies strong and weak areas
7. User sees professional development progress
```

**Duration:** ~3-5 minutes
**Result:** Clear understanding of training achievements

---

## Journey 6: Failed Test Recovery

### Staff Member Recovery Journey
```
1. User completes "Data Security" test

2. Results screen shows:
   ❌ Test Not Passed
   - Score: 60%
   - Passing score: 80%
   - 3 out of 5 questions correct

3. User sees two options:
   - "Back to Dashboard"
   - "Review SOP Again"

4. Clicks "Review SOP Again" → Back to SOP content

5. User re-reads content, focusing on:
   - Password management
   - Data handling procedures
   - Email security

6. After thorough review, clicks "Start Competency Test" again

7. Takes test with better understanding

8. Results screen shows:
   ✅ Congratulations! You Passed!
   - Score: 85%
   - Passing score: 80%
   - 4 out of 5 questions correct

9. Assignment status → COMPLETED
10. User's average score updated
11. Admin sees passed test in dashboard
```

**Duration:** ~15-20 minutes (including review)
**Result:** Knowledge reinforced, competency achieved

---

## Journey 7: Bulk Staff Assignment

### Admin Efficient Workflow
```
1. Admin creates new SOP: "Cybersecurity Basics"
2. Admin creates competency test
3. Admin needs to assign to all staff

Process for each staff member:
4. Navigate to /admin/staff
5. Click staff member
6. Click "+ Assign SOP"
7. Select "Cybersecurity Basics"
8. Click "Assign"
9. Repeat for next staff member

Alternative approach:
1. Admin navigates to /admin/staff
2. Opens multiple browser tabs
3. Assigns SOP to each staff simultaneously
4. Bulk assignment completed

Result:
- All 15 staff members now have the SOP
- Each sees it in their dashboard
- Training campaign launched
```

**Duration:** ~10-15 minutes for 15 staff
**Result:** System-wide training initiative deployed

---

## Journey 8: Updating Existing SOP

### Admin Maintenance Journey
```
1. Admin needs to update "Workplace Safety" SOP
2. Navigate to /admin/sops
3. Sees SOP card with:
   - Assigned to 15 staff members
   - 10 completed, 5 pending
   
Note: Current system stores completed results
Enhancement needed: Edit functionality

Workaround:
1. Create new SOP: "Workplace Safety v2.0"
2. Create updated test
3. Assign to all staff
4. Mark old version as deprecated

Future enhancement:
- Edit button on SOP cards
- Version control system
- Re-certification workflow
```

**Duration:** ~20 minutes
**Result:** Updated training materials deployed

---

## Common Pain Points & Solutions

### Pain Point 1: Staff Forgets Password
**Solution:** Admin creates new temporary password, emails to staff

### Pain Point 2: Test Failed Multiple Times
**Solution:** 
1. Admin reviews test difficulty
2. Admin can update test questions
3. Staff can attempt unlimited times
4. One-on-one training if needed

### Pain Point 3: Staff Not Completing Training
**Solution:**
1. Admin monitors dashboard
2. Admin can see pending assignments
3. Admin can follow up with staff
4. Due dates provide urgency (future enhancement)

### Pain Point 4: Need to Track Completion Rate
**Solution:**
1. Admin dashboard shows completion statistics
2. Individual staff pages show progress
3. Recent test results provide visibility

---

## Key User Experience Highlights

### For Staff
✅ Clean, intuitive interface
✅ Clear progress tracking
✅ Immediate test feedback
✅ Ability to retry failed tests
✅ Mobile-responsive design

### For Admins
✅ Comprehensive dashboard
✅ Easy staff onboarding
✅ Simple SOP creation
✅ Flexible test builder
✅ Real-time progress monitoring

---

## Success Metrics

### Staff Completion Rate
- Target: 90% completion within 30 days
- Tracking: Dashboard statistics
- Visibility: Real-time updates

### Test Pass Rate
- Target: 85% first-attempt pass rate
- Tracking: Test results
- Action: Adjust test difficulty if needed

### Time to Competency
- Target: <15 minutes per SOP
- Tracking: Assignment to completion dates
- Optimization: Improve content clarity

---

This completes the user journey documentation. The system provides intuitive workflows for both staff training and administrative oversight.




