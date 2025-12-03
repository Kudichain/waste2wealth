# Waste2Wealth - NGNT Platform (Localhost Edition)

A platform that turns waste into opportunity while empowering communities through NGNT digital currency.

## 🌍 Overview

Waste2Wealth connects waste collectors, recycling vendors, and processing factories in a circular economy powered by NGNT tokens. Each NGNT = ₦1,000 Nigerian Naira.

## ✨ Features

- **For Collectors**: Find waste collection tasks and earn NGNT rewards
- **For Vendors**: Manage waste processing and earn from verified submissions
- **For Factories**: Post collection tasks and manage recycling operations
- **Digital Wallet**: Track NGNT earnings with automatic Naira conversion
- **Real-time Dashboard**: Monitor tasks, earnings, and statistics
- **Admin Panel**: Comprehensive management and payout system

## 🚀 Localhost Setup

### Prerequisites

- **Node.js 18+** installed ([Download here](https://nodejs.org))
- **Git** (optional, for version control)
- **Windows, macOS, or Linux** operating system

### Quick Start

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

The project uses SQLite (file-based database) by default - no external database setup required!

Copy `.env.example` to `.env` (already done):

```bash
# .env is already configured for localhost
PORT=4000
DATABASE_URL=file:./waste2wealth.db
SESSION_SECRET=waste2wealth-secret-key-change-in-production-12345
```

3. **Initialize Database**

```bash
# Push schema to database
npm run db:push

# Seed with demo data (optional)
npm run dev
# Then visit http://localhost:4000 to trigger auto-seeding
```

4. **Start Development Server**

```bash
npm run dev
```

Visit **http://localhost:4000** in your browser 🎉

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔑 Default Login Credentials

### Admin Account
- **Email**: `admin@m.o.t3ch.io`
- **Password**: `Nig5atom@`

### Test Accounts (Created after seeding)
- **Collector**: Username: `collector1` (no password required in dev)
- **Vendor**: Username: `vendor1` (no password required in dev)

## 📁 Project Structure

```text
Waste2Wealth/
├── client/              # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (dashboards, landing)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Express backend (TypeScript)
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   ├── localAuth.ts     # Authentication system
│   ├── storage.ts       # Database operations (Drizzle ORM)
│   ├── db.ts            # Database connection
│   └── seed.ts          # Database seeding
├── shared/              # Shared TypeScript types and schemas
│   └── schema.ts        # Drizzle schema definitions
├── .env                 # Environment variables (localhost config)
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:push` | Push schema changes to database |
| `npm run check` | TypeScript type checking |

## 🔐 Authentication System

This application uses **session-based authentication** with the following features:

- ✅ **Session Management**: Express-session with secure cookies
- ✅ **Role-Based Access**: Admin, Collector, Vendor, Factory roles
- ✅ **Auto-login Support**: Simplified auth for development
- ✅ **OAuth Ready**: Extensible for Google/Facebook login
- ✅ **No External Dependencies**: Pure localhost implementation

### Production Security Recommendations

For production deployment, enhance security with:

1. **Password Hashing**: Implement bcrypt for password storage
2. **HTTPS**: Enable secure cookies with `cookie.secure = true`
3. **CSRF Protection**: Add CSRF token validation
4. **Rate Limiting**: Prevent brute force attacks
5. **Environment Secrets**: Use strong SESSION_SECRET

## 💾 Database

### SQLite Configuration (Default)

The project uses **SQLite** for simplicity:

- ✅ No installation required
- ✅ File-based: `waste2wealth.db`
- ✅ Perfect for development and small deployments
- ✅ Managed by Drizzle ORM

### Schema Management

```bash
# View current schema
npx drizzle-kit studio

# Generate migrations
npx drizzle-kit generate

# Apply migrations
npm run db:push
```

### Switching to PostgreSQL (Optional)

Update `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/waste2wealth
```

Then run migrations:

```bash
npm run db:push
```

## 🎨 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, TailwindCSS |
| **UI Components** | Radix UI, Shadcn/ui |
| **Routing** | Wouter (lightweight) |
| **State Management** | TanStack Query (React Query) |
| **Backend** | Express.js, TypeScript |
| **Database** | SQLite (default) / PostgreSQL |
| **ORM** | Drizzle ORM |
| **Session** | Express-session |
| **Build Tools** | Vite, esbuild |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Wallet & Transactions
- `GET /api/wallet` - Get wallet details
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/redeem` - Withdraw NGNT
- `POST /api/wallet/transfer` - Transfer to another user
- `GET /api/transactions` - Get transaction history

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task (factory)
- `POST /api/tasks/:id/accept` - Accept task (collector)
- `POST /api/tasks/:id/complete` - Mark complete
- `POST /api/tasks/:id/verify` - Verify completion (factory)

### Factories & Vendors
- `GET /api/factories` - List factories
- `POST /api/factories` - Create factory
- `GET /api/vendors` - List vendors
- `POST /api/vendors/profile` - Update vendor profile

### Admin
- `POST /api/admin/payouts` - Disburse payouts (admin only)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows: Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux: Kill process
lsof -ti:4000 | xargs kill -9
```

### Database Issues

```bash
# Reset database (caution: deletes all data)
rm waste2wealth.db
npm run db:push
npm run dev  # Re-seed with demo data
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Notes

### Currency Display

- **NGNT Balance**: Displayed in dashboards as primary currency
- **Naira Equivalent**: Automatically calculated (1 NGNT = ₦1,000)
- **GreenCoins (deprecated)**: Legacy references replaced with NGNT

### Session Storage

Development uses **MemoryStore** (in-memory sessions):

⚠️ **Warning**: Memory sessions don't persist across server restarts

For production, use:
- **connect-sqlite3** (SQLite-backed sessions)
- **connect-redis** (Redis-backed sessions)
- **connect-pg-simple** (PostgreSQL-backed sessions)

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Review troubleshooting section above
- Contact the development team

---

**Built with ❤️ for sustainable communities**

**No Replit dependencies - Pure localhost implementation!**
