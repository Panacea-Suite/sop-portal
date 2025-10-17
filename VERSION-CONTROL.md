# SOP Version Control System

## Overview

The SOP Management System now features comprehensive version control that automatically tracks all changes to SOPs, maintains historical versions, and ensures users always complete the latest version.

## Key Features

### Automatic Versioning
- Every edit to an SOP creates a new version (auto-increments: 1.0 → 1.1 → 1.2)
- Previous versions are automatically archived with full content/PDF preservation
- No manual "Update" button - all changes create new versions

### User Auto-Reassignment & Email Notifications
- When a new version is created, ALL users who had the old version are automatically reassigned
- Assignment status resets to PENDING, requiring users to review and complete the new version
- Email notifications automatically sent to all affected users with:
  - SOP title and version change (e.g., v1.0 → v1.1)
  - Changelog explaining what changed
  - Instructions to login and complete the update
  - Compliance reminder
- Users who completed old versions see prominent warnings about new versions in the dashboard

### Historical Tracking
- All previous versions are preserved with:
  - Full content (text and/or PDF)
  - Version number
  - Changelog/reason for update
  - Date and creator information
- Admins can view any historical version
- Admins can restore old versions (creates new version from historical one)

### Version-Aware Testing
- Test results track which SOP version was completed
- Users can see which version they completed vs. current version
- Admins can see version info in all test results

## How It Works

### For Admins

#### Creating a New Version
1. Navigate to **SOP Management**
2. Click **"Edit SOP"** on any SOP
3. Make your edits (text content and/or PDF upload)
4. Enter a **changelog** explaining what changed (required)
5. Click **"Save as New Version"**
6. System automatically:
   - Archives current version
   - Creates new version (increments 1.0 → 1.1)
   - Reassigns all users to new version
   - Sends email notifications to all affected users
   - Shows success message with reassignment and email counts

#### Viewing Version History
1. Click **"Version History"** button on any SOP
2. See complete timeline of all versions with:
   - Version number
   - Title
   - Changelog/reason for update
   - Creator and date
   - Current version highlighted
3. Click **"View"** to see full content of any historical version
4. Click **"Restore"** to create a new version from historical one

#### Version Information in Admin Views
- **SOP Management**: Shows current version, badges indicate if test exists
- **Staff Management**: Assignment tables show which version each user has
- **Test Results**: All results display which version was tested
- **Admin Dashboard**: Recent results show version info

### For Users

#### Email Notifications
When a new version of an SOP is created, users automatically receive an email containing:
- **Subject**: "SOP Update Required: [SOP Title] (v[New Version])"
- **Content**:
  - SOP title and version change (v1.0 → v1.1)
  - Changelog explaining what changed
  - Step-by-step instructions to login and complete the update
  - Compliance reminder
- **No direct links** included (for security when URL changes in production)
- Users instructed to login and check their "Pending SOPs" section

#### Version Warnings
Users see clear warnings when assigned to a new version after completing an old one:

**Pending SOPs Tab:**
- Amber warning box: "New version available!"
- Shows previously completed version and score
- Button changes to "Review New Version & Retake Test"

**In Progress SOPs:**
- Same warning if version mismatch detected
- Encourages completion of latest version

**Completed Training Table:**
- Shows version completed
- Highlights if current version is newer
- "Current: v1.1" badge if outdated

**SOP Viewer Page:**
- Large amber banner at top when viewing new version
- Clearly states old version completed and new version required
- Explains compliance requirement

#### Version Display
- All assignment cards show current version badge
- Test results always show which version was tested
- Progress page marks old version results as "(Previous Version)"

## Technical Implementation

### Database Schema

#### New SopVersion Model
```prisma
model SopVersion {
  id          String   @id @default(cuid())
  sopId       String
  version     String
  title       String
  description String
  content     String?
  pdfUrl      String?
  pdfFileName String?
  changelog   String?
  createdBy   String?
  createdAt   DateTime @default(now())
  sop         Sop      @relation(fields: [sopId], references: [id], onDelete: Cascade)
  @@index([sopId])
}
```

#### Updated TestResult Model
- Added `sopVersion` field to track which version was tested
- Populated automatically when test is submitted

### API Endpoints

#### POST `/api/sops/[id]`
Creates new version (replaces old PUT):
- Archives current state
- Increments version
- Saves new version to history
- Reassigns all users
- Returns reassignment count

#### GET `/api/sops/[id]/versions`
Fetches version history (admin only):
- Returns all versions for a SOP
- Includes changelog and creator info

#### GET `/api/sops/[id]/versions/[versionId]`
Fetches specific version details (admin only):
- Returns full content and metadata
- Used for viewing historical versions

#### POST `/api/sops/[id]/versions/[versionId]`
Restores a historical version (admin only):
- Creates new version from selected historical version
- Reassigns all users
- Adds changelog noting restoration

### Helper Functions (`lib/versionHelpers.ts`)

```typescript
// Auto-increment version (1.0 → 1.1)
incrementVersion(version: string): string

// Compare two versions
compareVersions(v1: string, v2: string): number

// Check if v1 is newer than v2
isNewerVersion(v1: string, v2: string): boolean

// Format for display (1.0 → v1.0)
formatVersion(version: string): string
```

### UI Components

#### SopVersionHistory Modal (`components/SopVersionHistory.tsx`)
- Displays version timeline
- View and restore actions
- Full content preview

#### Version Badges (CSS classes)
- `.badge-version` - Standard version display
- `.badge-outdated` - Warning for outdated versions
- `.badge-current` - Current version highlight
- `.badge-version-completed` - Completed version display

## User Workflow Example

### Scenario: Admin Updates a Safety SOP

1. **Admin Action**: 
   - Edits "Workplace Safety" SOP
   - Changes from v1.0 to v1.1
   - Changelog: "Added new fire safety protocols"

2. **System Action**:
   - Archives v1.0 with all content
   - Creates v1.1 as current version
   - Finds 5 users had v1.0 assigned
   - Deletes old assignments
   - Creates new PENDING assignments for all 5 users
   - Sends email notifications to all 5 users

3. **User Experience** (for someone who completed v1.0):
   - Receives email: "SOP Update Required: Workplace Safety (v1.1)"
   - Email explains version change and shows changelog
   - Logs into system
   - Sees "Workplace Safety" in Pending tab
   - Warning: "You completed v1.0 (100%). Please review the updated version."
   - Button: "Review New Version & Retake Test"
   - Opens SOP: Large banner explains v1.1 is required
   - Completes new test on v1.1

4. **Historical Record**:
   - Admin can view v1.0 anytime
   - v1.0 test results preserved
   - v1.1 test results tracked separately
   - Full audit trail maintained

## Benefits

1. **Compliance**: Ensures all users complete latest versions
2. **Transparency**: Clear changelog and version history
3. **Accountability**: Tracks who created each version and when
4. **Audit Trail**: Complete history of all SOP changes
5. **User Awareness**: Impossible to miss new versions (email + dashboard warnings)
6. **Data Preservation**: Nothing is ever lost or overwritten
7. **Flexibility**: Can restore old versions if needed
8. **Automated Notifications**: Users immediately notified via email about updates
9. **Professional Communication**: Branded emails with clear instructions

## Migration

All existing SOPs have been initialized with version history:
- Initial version created for each SOP
- Changelog: "Initial version"
- Creator: "System"
- Ready for future versioning

## Best Practices

### For Admins
1. Always provide meaningful changelog entries
2. Review who's assigned before creating new version
3. Use version history to track evolution of procedures
4. Consider restoring if a change needs to be reverted

### For Users
1. Review version warnings promptly
2. Compare old and new versions to understand changes
3. Complete new versions as soon as assigned
4. Contact admin if unclear about changes

## Email Notification System

### Implementation
The system uses **Resend** to send professional email notifications:
- Automatically triggered when creating new versions
- Sent to all users being reassigned
- Includes full version details and changelog
- Branded with company colors (amber warning theme)
- No direct links (for security/portability)

### Email Content Structure
1. **Header**: Amber gradient with warning icon
2. **Greeting**: Personalized with user name
3. **SOP Details Box**: 
   - SOP title
   - Version change (v1.0 → v1.1)
   - Changelog
4. **Action Required Box**:
   - Step-by-step instructions
   - Login reminder
   - Navigation guidance
5. **Compliance Reminder**: Professional footer

### Error Handling
- Email failures don't block version creation
- Failed emails logged to console
- Success/failure counts returned to admin
- Users still see dashboard warnings if email fails

## Future Enhancements

Potential additions:
- Side-by-side version comparison tool
- Version approval workflow
- Major vs. minor version distinction
- Scheduled version releases
- Version-specific certificates
- Email delivery tracking and read receipts

