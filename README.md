# SOP Management System

A comprehensive web-based Standard Operating Procedure (SOP) management and training platform built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

### For Staff Members (Users)
- 📚 View assigned SOPs with detailed content
- ✍️ Complete competency tests for each SOP
- 📊 Track training progress and completion status
- 📈 View test scores and pass/fail results
- 🎯 Monitor pending, in-progress, and completed SOPs

### For Administrators
- 👥 Onboard and manage staff members
- 📝 Create and manage SOPs with rich content
- ✅ Design competency tests with multiple-choice questions
- 🎯 Assign SOPs to specific staff members
- 📊 Monitor staff training progress with detailed analytics
- 🔍 Review test results and pass/fail statistics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** NextAuth.js
- **Password Hashing:** bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL 14+ (see [PostgreSQL Setup Guide](./POSTGRESQL-SETUP.md))

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "/Users/mylesgeorge/SOP Project 2"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   # Configure your PostgreSQL connection in .env file
   # See POSTGRESQL-SETUP.md for details
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npm run db:migrate
   ```

4. **Seed the database with demo data:**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Demo Accounts

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### User Accounts
- **Email:** user@example.com
- **Password:** user123

- **Email:** jane@example.com
- **Password:** user123

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard and management pages
│   │   ├── page.tsx         # Admin dashboard
│   │   ├── staff/           # Staff management
│   │   └── sops/            # SOP management
│   ├── dashboard/           # User dashboard
│   │   ├── page.tsx         # User SOP list
│   │   └── progress/        # Progress tracking
│   ├── sops/[id]/           # SOP viewer and test interface
│   ├── login/               # Authentication
│   └── api/                 # API routes
│       ├── auth/            # NextAuth configuration
│       ├── users/           # User management
│       ├── sops/            # SOP CRUD operations
│       ├── tests/           # Test management
│       ├── assignments/     # SOP assignments
│       ├── results/         # Test results
│       └── stats/           # Statistics
├── components/              # Reusable React components
│   ├── Navbar.tsx          # Navigation bar
│   └── StatCard.tsx        # Statistics card
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   └── auth.ts             # Auth configuration
├── prisma/                  # Database configuration
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
└── types/                   # TypeScript type definitions
```

## Database Schema

### Models

- **User**: Staff members and administrators
- **Sop**: Standard Operating Procedures with content
- **CompetencyTest**: Tests associated with SOPs
- **TestQuestion**: Questions for each test
- **SopAssignment**: Linking users to assigned SOPs
- **TestResult**: User test completion records

## Key Features Explained

### SOP Workflow
1. Admin creates an SOP with detailed content
2. Admin creates a competency test with questions
3. Admin assigns the SOP to specific staff members
4. Staff receives the assignment (PENDING status)
5. Staff reads the SOP (status changes to IN_PROGRESS)
6. Staff completes the competency test
7. System calculates score and pass/fail status
8. If passed, assignment status changes to COMPLETED

### Test System
- Multiple-choice questions with 4 options
- Customizable passing score (default 80%)
- Instant results with score and pass/fail indication
- Answers are stored for potential review
- Multiple attempts allowed if failed

### Dashboard Analytics
- **User Dashboard:** Personal stats, pending/completed SOPs, test scores
- **Admin Dashboard:** System-wide statistics, recent test results, staff overview
- **Staff Detail View:** Individual progress, assigned SOPs, test history

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### SOPs
- `GET /api/sops` - Get SOPs (all for admin, assigned for users)
- `POST /api/sops` - Create SOP (admin only)
- `GET /api/sops/[id]` - Get single SOP
- `PUT /api/sops/[id]` - Update SOP (admin only)
- `DELETE /api/sops/[id]` - Delete SOP (admin only)

### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (admin only)
- `PATCH /api/assignments/[id]` - Update assignment status
- `DELETE /api/assignments/[id]` - Delete assignment (admin only)

### Tests
- `POST /api/tests` - Create test (admin only)
- `POST /api/tests/submit` - Submit test answers

### Results & Stats
- `GET /api/results` - Get test results
- `GET /api/stats` - Get statistics

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control (RBAC)
- Protected API routes with authentication middleware
- Session-based authorization checks

## Customization

### Adding New SOP Categories
Edit the category dropdown in `app/admin/sops/page.tsx` or allow free-form entry.

### Changing Passing Scores
Modify the default in `app/admin/sops/page.tsx` or adjust per-test in the admin interface.

### Styling
Update Tailwind configuration in `tailwind.config.ts` or modify component classes.

### Database Configuration
The system uses PostgreSQL. To configure:
1. Set up PostgreSQL locally or use a hosted service
2. Update `DATABASE_URL` in `.env`
3. Run `npm run db:migrate` to apply migrations

For detailed setup instructions, see [PostgreSQL Setup Guide](./POSTGRESQL-SETUP.md)

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Ensure you:
1. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
2. Configure database URL
3. Run `prisma generate` and `prisma db push`
4. Set up proper Node.js version (18+)

## Future Enhancements

Potential features to add:
- [ ] Email notifications for new assignments
- [ ] File upload for SOP documents (PDF, DOCX)
- [ ] Rich text editor for SOP content
- [ ] Bulk staff import via CSV
- [ ] Advanced analytics and reporting
- [ ] Certificate generation for completed training
- [ ] Training expiration and renewal reminders
- [ ] Multi-language support
- [ ] Mobile app version

## Troubleshooting

### Database Issues
```bash
# Reset database (WARNING: This will delete all data!)
npm run db:reset

# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### Authentication Problems
- Clear browser cookies and local storage
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your domain

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or contributions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Next.js and Tailwind CSS**


