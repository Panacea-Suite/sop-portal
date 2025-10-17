# SOP Management System - Architecture Overview

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom React components
- **State Management**: React hooks + Server components

### Backend
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js 4.24
- **Database**: SQLite (via Prisma)
- **ORM**: Prisma 5.7
- **Password Hashing**: bcryptjs

### Development Tools
- **TypeScript**: Full type safety
- **Prisma Studio**: Database GUI
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Next.js React Frontend                  │  │
│  │  • Pages (App Router)                            │  │
│  │  • Components                                     │  │
│  │  • Client-side State                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    Next.js Server                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Server Components                    │  │
│  │  • Server-side Rendering                         │  │
│  │  • Data Fetching                                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │                API Routes                         │  │
│  │  • /api/auth (NextAuth)                          │  │
│  │  • /api/users                                     │  │
│  │  • /api/sops                                      │  │
│  │  • /api/tests                                     │  │
│  │  • /api/assignments                               │  │
│  │  • /api/results                                   │  │
│  │  • /api/stats                                     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Middleware Layer                       │  │
│  │  • Authentication                                 │  │
│  │  • Authorization                                  │  │
│  │  • Session Management                            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Prisma Client
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  SQLite Database                         │
│  • users                                                 │
│  • sops                                                  │
│  • competencyTests                                       │
│  • testQuestions                                         │
│  • sopAssignments                                        │
│  • testResults                                           │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
/Users/mylesgeorge/SOP Project 2/
│
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   └── [...nextauth]/   # NextAuth handler
│   │   ├── users/                # User management
│   │   ├── sops/                 # SOP CRUD operations
│   │   │   └── [id]/            # Single SOP operations
│   │   ├── tests/                # Test management
│   │   │   └── submit/          # Test submission
│   │   ├── assignments/          # Assignment operations
│   │   │   └── [id]/            # Single assignment ops
│   │   ├── results/              # Test results
│   │   └── stats/                # Statistics endpoint
│   │
│   ├── admin/                    # Admin Dashboard
│   │   ├── page.tsx             # Admin home
│   │   ├── staff/               # Staff management
│   │   │   ├── page.tsx         # Staff list
│   │   │   └── [id]/            # Individual staff view
│   │   └── sops/                # SOP management
│   │       └── page.tsx         # SOP list & creation
│   │
│   ├── dashboard/                # User Dashboard
│   │   ├── page.tsx             # User home (SOP list)
│   │   └── progress/            # Progress tracking
│   │       └── page.tsx
│   │
│   ├── sops/                     # SOP Viewer
│   │   └── [id]/                # Dynamic SOP page
│   │       └── page.tsx         # SOP content & test
│   │
│   ├── login/                    # Authentication
│   │   └── page.tsx             # Login page
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (redirects)
│   ├── providers.tsx             # Context providers
│   └── globals.css               # Global styles
│
├── components/                   # Reusable Components
│   ├── Navbar.tsx               # Navigation bar
│   └── StatCard.tsx             # Statistics card
│
├── lib/                          # Utility Libraries
│   ├── prisma.ts                # Prisma client instance
│   └── auth.ts                  # NextAuth configuration
│
├── prisma/                       # Database Configuration
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed data script
│
├── types/                        # TypeScript Definitions
│   └── next-auth.d.ts           # NextAuth type extensions
│
├── public/                       # Static Assets
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── postcss.config.js             # PostCSS config
├── middleware.ts                 # Route protection
│
├── README.md                     # Main documentation
├── SETUP.md                      # Setup instructions
├── FEATURES.md                   # Feature list
└── ARCHITECTURE.md               # This file
```

## Data Flow

### User Authentication Flow
```
1. User enters credentials on /login
2. Client sends POST to /api/auth/signin
3. NextAuth validates credentials against database
4. Server creates JWT token
5. Client stores session
6. User redirected based on role (admin → /admin, user → /dashboard)
```

### SOP Learning Flow
```
1. User views dashboard (GET /api/sops)
2. User clicks on SOP card
3. Client navigates to /sops/[id]
4. Server fetches SOP (GET /api/sops/[id])
5. Assignment status updated to IN_PROGRESS (PATCH /api/assignments/[id])
6. User reads content
7. User starts test
8. User submits answers (POST /api/tests/submit)
9. Server calculates score
10. If passed, assignment status → COMPLETED
11. Result saved to database
12. User sees result screen
```

### Admin SOP Creation Flow
```
1. Admin navigates to /admin/sops
2. Admin clicks "Create New SOP"
3. Admin fills form with SOP details
4. Client sends POST to /api/sops
5. Server creates SOP in database
6. Admin prompted to add test
7. Admin creates test with questions
8. Client sends POST to /api/tests
9. Server creates test and questions
10. SOP now available for assignment
```

### Staff Assignment Flow
```
1. Admin navigates to staff detail page
2. Admin clicks "Assign SOP"
3. Admin selects SOP from dropdown
4. Client sends POST to /api/assignments
5. Server creates assignment record
6. User can now see SOP in their dashboard
```

## Database Schema

### Users Table
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  assignments   SopAssignment[]
  testResults   TestResult[]
}
```

### SOPs Table
```prisma
model Sop {
  id          String   @id @default(cuid())
  title       String
  description String
  content     String
  category    String?
  version     String   @default("1.0")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  assignments SopAssignment[]
  test        CompetencyTest?
}
```

### Competency Tests Table
```prisma
model CompetencyTest {
  id           String   @id @default(cuid())
  sopId        String   @unique
  title        String
  passingScore Int      @default(80)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  sop       Sop            @relation(fields: [sopId], references: [id])
  questions TestQuestion[]
  results   TestResult[]
}
```

### Assignments Table
```prisma
model SopAssignment {
  id         String           @id @default(cuid())
  userId     String
  sopId      String
  assignedAt DateTime         @default(now())
  dueDate    DateTime?
  status     AssignmentStatus @default(PENDING)
  
  user User @relation(fields: [userId], references: [id])
  sop  Sop  @relation(fields: [sopId], references: [id])
  
  @@unique([userId, sopId])
}
```

## Security Architecture

### Authentication
- **Session-based**: JWT tokens stored in HTTP-only cookies
- **NextAuth.js**: Industry-standard authentication
- **Password Hashing**: Bcrypt with 10 salt rounds

### Authorization
- **Middleware**: Route-level protection
- **API Guards**: Session checks on every API call
- **Role Checks**: Admin vs User permissions
- **Data Scoping**: Users see only their data

### CSRF Protection
- NextAuth includes CSRF token validation
- Form submissions include CSRF tokens
- API routes verify request origin

## Performance Optimizations

### Frontend
- **Server Components**: Reduce client-side JavaScript
- **Code Splitting**: Automatic by Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: Where possible

### Backend
- **Efficient Queries**: Prisma optimizes SQL
- **Indexes**: Database indexes on foreign keys
- **Connection Pooling**: Prisma connection pool
- **Caching**: Session caching by NextAuth

### Database
- **SQLite**: Fast for development
- **Indexes**: Automatic on relations
- **Transactions**: Used for critical operations
- **Foreign Keys**: Enforced relationships

## Scalability Considerations

### Current Architecture (Development)
- SQLite database (single file)
- Good for: 1-100 concurrent users
- Suitable for small to medium teams

### Production Scaling Options

#### Option 1: PostgreSQL
```
1. Change DATABASE_URL to PostgreSQL
2. Update Prisma schema provider
3. Run migrations
4. Benefits: 1000+ concurrent users
```

#### Option 2: Serverless
```
1. Deploy to Vercel/Netlify
2. Use Vercel Postgres or Supabase
3. Automatic scaling
4. Benefits: Unlimited scale
```

#### Option 3: Docker + Cloud
```
1. Containerize application
2. Deploy to AWS/GCP/Azure
3. Use managed database service
4. Benefits: Full control, high scale
```

## Deployment Architecture

### Recommended: Vercel
```
GitHub Repository
       ↓
Vercel (Automatic Deploy)
       ↓
Production URL
       ↓
Vercel Postgres (Database)
```

### Alternative: Traditional Hosting
```
VPS/Cloud Instance
       ↓
Node.js Process
       ↓
PostgreSQL Database
       ↓
Nginx Reverse Proxy
       ↓
SSL Certificate (Let's Encrypt)
```

## Monitoring & Maintenance

### Logs
- Next.js server logs
- API route logs
- Database query logs (Prisma)
- Authentication events (NextAuth)

### Backups
- SQLite: Copy `dev.db` file
- PostgreSQL: Use `pg_dump`
- Automated backups recommended

### Updates
- Regular dependency updates
- Security patches
- Database migrations
- Schema versioning with Prisma

## Testing Strategy

### Recommended Tests
1. **Unit Tests**: Component and utility functions
2. **Integration Tests**: API routes
3. **E2E Tests**: Critical user flows
4. **Security Tests**: Authentication and authorization

### Test Framework Suggestions
- Jest for unit tests
- React Testing Library for components
- Cypress or Playwright for E2E
- Postman for API testing

## Future Enhancements

### Technical Improvements
- [ ] Add Redis for session caching
- [ ] Implement WebSocket for real-time updates
- [ ] Add full-text search for SOPs
- [ ] Implement file uploads (S3/CloudFlare R2)
- [ ] Add email service integration
- [ ] Implement audit logging
- [ ] Add data export functionality
- [ ] Create mobile app with React Native

### Feature Enhancements
- [ ] Rich text editor for SOPs
- [ ] Video content support
- [ ] Training certificates (PDF generation)
- [ ] Advanced analytics dashboard
- [ ] Notification system
- [ ] Calendar integration for due dates
- [ ] Multi-language support
- [ ] Custom branding per organization

---

This architecture provides a solid foundation for a production-ready SOP management system with room for growth and customization.




