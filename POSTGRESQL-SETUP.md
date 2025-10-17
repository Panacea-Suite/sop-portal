# PostgreSQL Setup Guide

This guide explains how to set up PostgreSQL for the SOP Management System.

## Prerequisites

You need PostgreSQL installed on your system. Here are installation options:

### Option 1: Install PostgreSQL Locally

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create the database
createdb sop_management
```

#### Windows
Download and install PostgreSQL from: https://www.postgresql.org/download/windows/

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb sop_management
```

### Option 2: Use a Hosted PostgreSQL Service (Recommended for Production)

Popular options include:
- **Supabase** (https://supabase.com) - Free tier available
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Railway** (https://railway.app) - Simple deployment
- **Heroku PostgreSQL** (https://www.heroku.com/postgres)
- **AWS RDS** - For production scale

## Configuration

1. **Update your `.env` file** with your PostgreSQL connection string:

   For local PostgreSQL:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/sop_management?schema=public"
   ```

   For hosted services (example with Supabase):
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
   ```

2. **Create the database** (if using local PostgreSQL):
   ```bash
   createdb sop_management
   ```

3. **Run migrations** to set up the database schema:
   ```bash
   # Generate migration files
   npx prisma migrate dev --name init

   # For production deployment
   npx prisma migrate deploy
   ```

4. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: This will delete all data!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## Troubleshooting

### Connection Refused Error
If you get "Can't reach database server at localhost:5432":
1. Ensure PostgreSQL is running: `brew services list` (macOS)
2. Check if the port is correct (default: 5432)
3. Verify your username/password

### Permission Denied
If you get permission errors:
1. Ensure the database exists: `createdb sop_management`
2. Check user permissions in PostgreSQL

### Migration Issues
If migrations fail:
1. Check your schema syntax: `npx prisma validate`
2. Reset migrations if needed: `npx prisma migrate reset`

## Production Considerations

1. **Connection Pooling**: For production, consider using a connection pooler like PgBouncer
2. **SSL**: Enable SSL for production connections by adding `?sslmode=require` to your connection string
3. **Backups**: Set up regular automated backups
4. **Monitoring**: Use tools like pgAdmin or your hosting provider's monitoring

## Environment Variables

Make sure these are set in your production environment:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - A secure random string
- `NEXTAUTH_URL` - Your production URL

## Next Steps

1. Install PostgreSQL or set up a hosted service
2. Update your `.env` file with the correct connection string
3. Run `npx prisma migrate dev` to create the database schema
4. Run `npm run dev` to start the application


