# Home Care Service - Backend

Production-ready NestJS backend for the Home Care Service application.

## Features

- 🔐 JWT Authentication with role-based access control
- 👥 Three user roles: Client, Contractor, Admin
- 📋 Complete task lifecycle management
- 🗓️ Calendar scheduling with proposal/approval workflow
- 💰 Invoice generation
- 📁 File upload support
- 🔄 Task status transitions with validation
- 📊 Timeline tracking for all actions

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Database Setup

1. Create PostgreSQL database:

```bash
createdb homecare_db
```

2. Update `.env` file with your database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=homecare_db

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

PORT=3001
```

3. Run the application (it will auto-create tables):

```bash
npm run start:dev
```

4. Seed the database with demo data:

```bash
npm run seed
```

## Demo Accounts

After seeding, you can login with:

- **Admin**: admin@homecare.com / Password123!
- **Client**: client@homecare.com / Password123!
- **Contractor**: contractor@homecare.com / Password123!

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user (protected)

### Tasks
- `GET /tasks` - List tasks (role-filtered)
- `GET /tasks/:id` - Get task details
- `POST /tasks` - Create task (client only)
- `POST /tasks/:id/assign` - Assign contractor (admin only)
- `POST /tasks/:id/propose-schedule` - Propose schedule (contractor only)
- `POST /tasks/:id/approve-schedule` - Approve schedule (client only)
- `POST /tasks/:id/reject-schedule` - Reject schedule (client only)
- `PUT /tasks/:id/status` - Update task status
- `POST /tasks/:id/cancel` - Cancel task

### Services
- `GET /services` - List all services
- `GET /services/categories` - List categories with services
- `GET /services/category/:categoryId` - Get services by category
- `GET /services/:id` - Get service details

### Homes
- `GET /homes` - List user's homes
- `GET /homes/:id` - Get home details
- `POST /homes` - Create new home
- `PUT /homes/:id` - Update home
- `DELETE /homes/:id` - Delete home

## Task Status Workflow

```
DRAFT → REQUESTED → AWAITING_CONTRACTOR_PROPOSAL → PROPOSED → APPROVED → SCHEDULED → IN_PROGRESS → COMPLETED
                                                      ↓
                                                  REJECTED
```

Any status can transition to CANCELLED.

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── guards/          # JWT and role guards
│   ├── strategies/      # Passport strategies
│   └── decorators/      # Custom decorators
├── database/
│   ├── entities/        # TypeORM entities
│   └── seeds/           # Database seeding
├── tasks/               # Task management module
├── services/            # Service catalog module
├── homes/               # Home/address module
├── app.module.ts        # Main application module
└── main.ts              # Application entry point
```

## Technologies

- NestJS - Progressive Node.js framework
- TypeORM - ORM for TypeScript
- PostgreSQL - Database
- Passport JWT - Authentication
- bcrypt - Password hashing

## License

MIT
