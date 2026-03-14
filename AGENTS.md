# GridLock - F1 Predictions Platform

## Project Overview

GridLock is a Formula 1 predictions platform for the 2026 season. Users can:
- Create accounts and log in via magic link authentication
- Make predictions for each race weekend (qualifying, race, gainers, losers)
- Lock predictions before qualifying starts
- View session results from OpenF1 API (cached in database)
- View driver standings and individual driver results
- Compare predictions with other users in the league

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers (Hono framework)
- **Database**: D1 (Cloudflare's SQLite)
- **Email**: Resend API
- **External API**: OpenF1 API (https://api.openf1.org/v1)

## Project Structure

```
src/
├── App/                    # React components
│   ├── DriverResults.tsx   # Driver results page with session table
│   ├── DriversStandings.tsx # All drivers grid
│   ├── SessionResults.tsx  # Session results dialog component
│   ├── Race.tsx            # Race weekend page
│   └── ...
├── components/ui/          # shadcn/ui components
├── data/                   # Static race/session data (JSON)
├── helpers/                # Hooks and utilities
└── shared/
    ├── model.ts            # Zod schemas and types
    ├── Result.ts          # Result type utility
    ├── Race.ts             # Race class
    └── predictionFormHelpers.ts # Prediction randomization

worker/
├── index.ts                # Hono app entry point
├── routes/                 # API route handlers
├── queries/                # Database query functions
├── scheduled_events/       # Cron job handlers
└── middleware/             # Auth middleware
```

## API Endpoints

### Public Routes (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Request magic link (email required) |
| POST | `/api/create-account` | Create new account |
| GET | `/api/verify` | Verify magic link token |
| POST | `/api/logout` | Clear session cookie |
| GET | `/api/leaderboard` | Get leaderboard entries |
| GET | `/api/session-results` | Get session results (cached from OpenF1) |
| GET | `/api/driver-results` | Get all session results for a driver |

### Protected Routes (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Get current user info |
| PATCH | `/api/profile` | Update username |
| GET | `/api/predictions` | Get user's prediction for a race |
| POST | `/api/predictions` | Save prediction |
| POST | `/api/predictions/lock` | Lock prediction |
| GET | `/api/user-predictions` | Get all user's predictions |
| GET | `/api/league-predictions` | Get all locked predictions for a race |
| GET | `/api/admin/users` | List all users (admin only) |
| POST | `/api/admin` | Admin actions (admin only) |

## API Request/Response Schemas

### Session Results

**GET `/api/session-results?session_key=<number>`**

Returns cached session results from OpenF1 API. If not cached, fetches from OpenF1 and stores in database.

```typescript
// Response
SessionResult[]

// SessionResult type
{
  position: number | null;
  driver_number: number;
  number_of_laps: number;
  points?: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  starting_position?: number | null;
  duration: number | string | null;
  gap_to_leader: number | string | null;
  meeting_key: number;
  session_key: number;
}
```

### Driver Results

**GET `/api/driver-results?driver_number=<number>`**

Returns all session results for a specific driver.

```typescript
// Response
SessionResult[]
```

### Predictions

**GET `/api/predictions?circuitCode=<string>`**

```typescript
// Response
{
  id: number;
  user_id: number;
  circuit_code: string;
  prediction: string | null; // JSON string of PredictionContent
  locked: number; // 0 or 1
  created_at: string;
  updated_at: string;
}
```

**POST `/api/predictions`**

```typescript
// Request body
{
  circuitCode: string;
  predictions: PredictionContent;
  isComplete?: boolean;
}

// PredictionContent
{
  qualifying: { p1: DriverTag | null; p2: ...; p3: ...; p4: ...; p5: ... };
  race: { p1: DriverTag | null; p2: ...; p3: ...; p4: ...; p5: ... };
  gainers: { g1: DriverTag | null; g2: ...; g3: ... };
  losers: { l1: DriverTag | null; l2: ...; l3: ... };
}
```

**POST `/api/predictions/lock`**

```typescript
// Request body
{
  circuitCode: string;
}
```

## Result Type Utility

The project uses a custom Result type instead of try/catch for error handling:

```typescript
// From src/shared/Result.ts
type Result<T, E = Error> = Ok<T> | Err<E>;

// Usage in API routes
const result = await tryAsync(() => someAsyncOperation());
if (!result.ok) {
  return c.json({ message: "Error" }, 500);
}
return c.json(result.value);
```

Key functions:
- `ok(value)` - Create successful result
- `err(error)` - Create error result
- `tryAsync(fn)` - Wrap async function, catch errors
- `map(result, fn)` - Transform success value
- `flatMap(result, fn)` - Chain Result-returning functions

## Scheduled Jobs

Scheduled jobs run via Cloudflare Workers scheduled events:

### Lock Prediction Reminder (`lockReminder.ts`)

Sends reminder emails to users who haven't locked predictions:
- 24 hours before qualifying
- 2 hours before qualifying

### Auto-Lock Predictions (`autoLockPredictions.ts`)

Auto-locks predictions 4 hours after prediction window closes:
- Fills incomplete predictions with random entries
- Sends email notification to users

## Database Tables

### `players`
- id, username, email, created_at, verified_at, updated_at, deleted_at, preferences

### `predictions`
- id, user_id, circuit_code, prediction (JSON), locked, created_at, updated_at

### `session_results`
- id, session_key, meeting_key, driver_number, position, number_of_laps, points, dnf, dns, dsq, starting_position, duration, gap_to_leader, created_at, updated_at

### `event_emails`
- event, type, sent, race, sent_at

## Client Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | UserHome | Dashboard |
| `/race` | RaceWeekend | Race calendar |
| `/race/:circuit_code` | RaceComponent | Race details |
| `/race/:circuit_code/prediction` | RacePrediction | Make/edit predictions |
| `/race/:circuit_code/league` | LeaguePredictions | View league predictions |
| `/season` | Season | Season overview |
| `/season/2026` | DriversStandings | All drivers grid |
| `/season/2026/:driver` | DriverResults | Driver's session results |
| `/season/wdc` | Wdc | Drivers' Championship |
| `/season/wcc` | Wcc | Constructors' Championship |
| `/leaderboard` | Leaderboard | Global leaderboard |
| `/profile` | Profile | User profile |

## Key Components

### SessionResults
- Displays driver cards in a grid layout
- Shows position, gap to leader, points
- Clicking a driver navigates to `/season/2026/:driver`
- Accepts `onDriverClick` callback to close parent dialog

### DriverResults
- Table of session results for a driver
- Shows: Race, Session, Grid, Finish, +/-, Points
- Filters out Practice sessions
- Clicking a row opens session results dialog

## External APIs

### OpenF1 API

Base URL: `https://api.openf1.org/v1`

Used endpoints:
- `/session_result?session_key=<key>` - Get session results

Results are cached in `session_results` table to reduce API calls.

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production (tsc + vite)
npm run lint       # ESLint
npm run lint:biome # Biome lint
npm run format     # Format with Biome
npm run deploy     # Build and deploy to Cloudflare
```

## Important Notes

1. **No try/catch**: Use the Result type utility from `@/shared/Result`
2. **TypeScript strict mode**: All code must pass type checking
3. **No comments**: Code should be self-documenting
4. **Zod validation**: All API inputs validated with Zod schemas
5. **Session-based auth**: Uses JWT in HTTP-only cookie
