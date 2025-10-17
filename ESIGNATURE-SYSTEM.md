# eSignature and Date Stamping System

## Overview

The SOP Management System features a robust dual-signature workflow that ensures proper verification and compliance tracking for all SOP completions. Both users and administrators must electronically sign to verify training completion.

## How It Works

### Complete Workflow

```
User → Reads SOP → Takes Test → Passes (≥80%) 
  → Signs Declaration → Admin Notified → Admin Counter-Signs → COMPLETED
```

### Status Progression

1. **PENDING** - Initial assignment, not started
2. **IN_PROGRESS** - User opened and is reviewing the SOP
3. **AWAITING_USER_SIGNATURE** - Test passed, user needs to sign
4. **AWAITING_ADMIN_SIGNATURE** - User signed, admin needs to counter-sign
5. **COMPLETED** - Fully signed and verified

## User Signature Process

### When It Happens
After a user completes a competency test with a passing score, they are immediately prompted to provide their electronic signature.

### Signature Requirements
- **Type full name**: Must match their name in the system exactly (case-insensitive)
- **Agree to declaration**: Checkbox must be checked
- **Declaration text**: "I confirm that I have thoroughly read the documentation and answered all questions honestly and to the best of my ability"

### What's Captured
- User's typed signature
- Timestamp (date and time)
- IP address (for audit trail)
- SOP version completed
- Linked to test result

### User Experience
1. Complete test and pass
2. Automatic modal appears with:
   - Success message showing score
   - Declaration text
   - Input field to type full name
   - Checkbox to agree
   - Live preview of signature in signature font
3. Click "Sign & Submit"
4. Confirmation: "Signature submitted! Awaiting admin verification."
5. Redirected to dashboard

## Admin Counter-Signature Process

### When It Happens
After user signs, the assigning admin is automatically notified via email to provide counter-signature.

### Counter-Signature Requirements
- **Admin only**: Must have ADMIN role
- **Type full name**: Must match admin's name exactly (case-insensitive)
- **Agree to declaration**: Checkbox must be checked
- **Declaration text**: "I confirm that the assignee has read the documentation and answered all questions honestly and to the best of their ability"

### What's Captured
- Admin's typed signature
- Timestamp (date and time)
- IP address (for audit trail)
- Admin user ID (who counter-signed)

### Admin Experience

**Option 1: Email Notification**
1. Receive email: "Counter-Signature Required: [User] completed [SOP]"
2. Email shows:
   - Staff member details
   - SOP title and version
   - Test score
   - User's signature and timestamp
   - User's declaration
3. Login to system

**Option 2: Dashboard Alert**
- Blue banner showing count of pending counter-signatures
- Click to go to Counter-Sign page

**Counter-Signing:**
1. Navigate to "Counter-Sign" in sidebar
2. See table of all pending counter-signatures
3. Click "Counter-Sign" button
4. Modal appears with:
   - Staff member info
   - Test score
   - Declaration text
   - Input to type admin name
   - Checkbox to agree
5. Type name and sign
6. Assignment marked as COMPLETED

## Email Notifications

### Counter-Sign Request Email
**To:** Assigning admin  
**Subject:** "Counter-Signature Required: [User Name] completed [SOP Title]"  
**Content:**
- Blue gradient header
- Staff member name and email
- SOP title and version
- Test score achieved (with green checkmark)
- User's signature displayed in signature font
- User's signature timestamp
- User's declaration text
- Step-by-step instructions
- Compliance note
- No direct links (for portability)

## Signature Display

### Font Styling
Signatures are displayed in an elegant cursive font:
- Font family: 'Brush Script MT', 'Apple Chancery', cursive
- Large size (2.5rem on desktop, 2rem on mobile)
- Italic style
- Dark gray color
- Distinctive and professional appearance

### Where Signatures Appear

**Admin Views:**
1. **Counter-Sign Dashboard** - User signatures in table
2. **Staff Management** - Signature status in assignments table
3. **Test Results Detail** - Full signature section with both signatures
4. **Staff Detail Page** - Signature status column

**User Views:**
1. **Progress Page** - Signature status indicators
2. **Dashboard** - Status badges on completed SOPs

## Data Storage

### SopSignature Model
Each signature record contains:
- Unique assignment ID
- User ID and SOP ID
- SOP version
- User signature data (name, timestamp, IP)
- Admin signature data (name, timestamp, IP, admin ID)
- Created/updated timestamps

### Immutability
- Signatures cannot be edited after creation
- Only admins can add counter-signatures
- Original records preserved forever
- Full audit trail maintained

## Integration with Version Control

### Version + Signature Relationship
- **Each version requires separate signatures**
- Old version signatures preserved in history
- New version starts with no signatures
- Signature records store specific version number

### When New Version Created
1. Users reassigned to new version (PENDING status)
2. Previous signatures remain linked to old version
3. Users must complete new version and sign again
4. Admin must counter-sign new completion
5. Complete separation of version signatures

## Security & Compliance

### Security Features
- IP address logging for all signatures
- Timestamp with timezone awareness
- Name matching validation (prevents typos/fraud)
- Immutable records (no edits possible)
- Role-based access control
- Audit trail for all actions

### Compliance Benefits
1. **Legal validity**: Electronic signatures with full audit trail
2. **Dual verification**: Both user and supervisor confirm
3. **Traceability**: Know exactly who signed what and when
4. **Version tracking**: Signatures tied to specific SOP versions
5. **Accountability**: Clear chain of responsibility
6. **Documentation**: Complete history for audits/inspections

## Admin Dashboard Features

### Pending Counter-Signatures Card
- Prominent alert when signatures pending
- Shows count of pending items
- Direct link to Counter-Sign page
- Updates in real-time

### Counter-Sign Page
Location: `/admin/countersign`

Features:
- Table of all pending counter-signatures
- Shows:
  - Staff member name and email
  - SOP title and category
  - Version number
  - Test score
  - User's signature (in signature font)
  - Signature timestamp
  - Counter-Sign button
- One-click counter-signing
- Updates automatically after signing

## User Experience

### Dashboard Indicators
- Completed SOPs show signature status
- "Awaiting Admin Signature" badge shown when applicable
- Green "Fully Signed" badge when complete

### Progress Page
- Signature status column
- Visual indicators for each test result
- Clear differentiation between signed/unsigned

## API Endpoints

### POST `/api/signatures`
Create user signature
- Requires: assignmentId, signature, agreedToDeclaration
- Validates: Test passed, name matches, checkbox checked
- Actions: Creates signature, updates status, sends admin email
- Returns: Signature record with timestamp

### POST `/api/signatures/[id]/countersign`
Admin counter-signs
- Requires: signature, agreedToDeclaration
- Validates: Is admin, name matches, status correct
- Actions: Updates signature record, completes assignment
- Returns: Updated signature

### GET `/api/signatures/pending-countersign`
Fetch pending counter-signatures (admin only)
- Returns: List of assignments awaiting admin signature
- Includes: User info, SOP details, test scores, user signatures

### GET `/api/signatures`
Fetch all signatures (admin only)
- Returns: Complete signature history
- Includes: All signature records with related data

## Signature Validation Rules

### User Signature
- Must type exact full name as registered in system
- Case-insensitive matching
- Whitespace trimmed
- Must check agreement checkbox
- Cannot submit if test failed
- Cannot bypass signature requirement

### Admin Counter-Signature
- Must be logged in as ADMIN role
- Must type exact full name as registered
- Case-insensitive matching
- Must check agreement checkbox
- Can only counter-sign assignments in AWAITING_ADMIN_SIGNATURE status
- Any admin can counter-sign (not just assigning admin)

## Error Handling

### Signature Creation Errors
- "Signature must match your full name exactly"
- "You must agree to the declaration"
- "Assignment is not awaiting user signature"
- Failed signatures logged but don't block test results

### Email Notification Errors
- Email failures don't block signature creation
- Logged to console for admin review
- Admin can still be notified via dashboard
- System continues to function normally

## Best Practices

### For Users
1. Read SOPs thoroughly before testing
2. Take tests honestly
3. Provide signature immediately after passing
4. Check dashboard for signature status
5. Contact admin if signature issues occur

### For Admins
1. Respond to counter-sign requests promptly
2. Review test scores before counter-signing
3. Verify staff member actually understands material
4. Use Counter-Sign page for batch processing
5. Monitor pending counter-signatures regularly

## Troubleshooting

### "Signature must match your full name"
- Type your name exactly as it appears in your profile
- Check for extra spaces
- Capitalization doesn't matter

### "Assignment is not awaiting signature"
- Test may not have been passed
- May have already been signed
- Contact administrator

### Admin can't counter-sign
- Verify you have ADMIN role
- Check that user has already signed
- Ensure assignment status is AWAITING_ADMIN_SIGNATURE

## Future Enhancements

Potential additions:
- Bulk counter-signing (sign multiple at once)
- Signature reminders after X days
- Signature history export (PDF/CSV)
- Custom declaration texts per SOP
- Signature delegation
- Mobile app signature support
- Biometric signature options
- Signature certificate generation

