# Waste2Wealth - GreenCoin Africa

A platform that turns waste into opportunity while empowering communities.

## Features

- **For Collectors**: Find waste collection tasks and earn GreenCoins
- **For Factories**: Post collection tasks and manage recycling operations
- **Wallet System**: Track earnings and redeem rewards
- **Real-time Dashboard**: Monitor tasks, earnings, and statistics

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud-based like Neon)

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Update other variables as needed

4. Push database schema:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:6000`

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```text
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API routes
│   ├── localAuth.ts # Authentication system
│   └── storage.ts   # Database operations
├── shared/          # Shared types and schemas
└── package.json
```

## Authentication

This application uses a simple local authentication system. Users can log in with just a username - no password required for development purposes.

For production, consider implementing:

- Password-based authentication
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication

## Database

The application uses PostgreSQL with Drizzle ORM. Make sure to set up your database and run migrations before starting the server.

## Development

- Frontend runs on Vite dev server
- Backend runs on Express with hot reload via tsx
- Port: 6000 (configurable via PORT environment variable)

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI, Wouter
- **Backend**: Express, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Authentication**: Express Session

## License

MIT
