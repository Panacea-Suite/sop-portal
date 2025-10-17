# Quick Setup Guide

Follow these steps to get your SOP Management System up and running:

## Step 1: Set up PostgreSQL

First, ensure PostgreSQL is installed and running. See [PostgreSQL Setup Guide](./POSTGRESQL-SETUP.md) for detailed instructions.

## Step 2: Environment Variables

Create a `.env` file in the project root with the following content:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/sop_management?schema=public"

# NextAuth configuration
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email configuration (already configured)
RESEND_API_KEY="re_BA9Dp955_EjnW1ywmrLrEi98CdVEvb5kY"
EMAIL_FROM="SOP Management <onboarding@supplementfactoryuk.com>"
```

**Important:** 
- Update the `DATABASE_URL` with your PostgreSQL credentials
- Change `NEXTAUTH_SECRET` to a random string in production!

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Initialize Database

```bash
# Run migrations to create database schema
npm run db:migrate
```

## Step 5: Seed Demo Data

```bash
npm run db:seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Demo users: `user@example.com` / `user123` and `jane@example.com` / `user123`
- Sample SOPs with competency tests
- Sample assignments and test results

## Step 6: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and log in with one of the demo accounts!

## Quick Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run migrations (development mode)
- `npm run db:migrate:deploy` - Run migrations (production mode)
- `npm run db:seed` - Seed database with demo data
- `npm run db:reset` - Reset database and reseed (⚠️ deletes all data)
- `npm run db:studio` - Open Prisma Studio to view/edit data

## First Login

### Admin Access
1. Go to `http://localhost:3000/login`
2. Login with `admin@example.com` / `admin123`
3. You'll be redirected to the admin dashboard
4. Explore staff management and SOP creation

### User Access
1. Go to `http://localhost:3000/login`
2. Login with `user@example.com` / `user123`
3. You'll be redirected to the user dashboard
4. View assigned SOPs and complete competency tests

## Troubleshooting

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset everything (WARNING: Deletes all data!)
npm run db:reset

# View migration status
npx prisma migrate status

# Open database GUI
npm run db:studio
```

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Customize**: Update branding, colors, and content in the code
2. **Add Users**: Use admin panel to onboard real staff members
3. **Create SOPs**: Add your organization's actual procedures
4. **Deploy**: Push to Vercel, Netlify, or your preferred platform

Enjoy your SOP Management System! 🎉


