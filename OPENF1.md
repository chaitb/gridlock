# OpenF1 API Usage

This project uses the [OpenF1 API](https://openf1.org) to fetch live and historical F1 session data. All requests are made directly from the browser via the `useApi` hook (`src/helpers/useApi.ts`).

## Base URL

```
https://api.openf1.org/v1
```

No authentication is required.

## How requests are made

`useApi<T>(url, { params })` is a thin fetch wrapper that appends query params, handles errors, and returns `{ data, error, isLoading, refetch }`. OpenF1 endpoints are called by passing the full URL directly:

```ts
const { data: results } = useApi<SessionResult[]>(
  "https://api.openf1.org/v1/session_result",
  { params: { session_key: session.session_key } }
);
```

## Endpoints used

### `GET /v1/session_result`

Returns the final classification for a session.

**Query params**

| Param         | Type   | Description                        |
|---------------|--------|------------------------------------|
| `session_key` | number | Unique key identifying the session |

**Response shape** (mapped to `SessionResult` in `src/model.ts`)

```ts
type SessionResult = {
  position:      number | null;   // finishing position (null for DNF/DNS/DSQ)
  driver_number: number;          // car number, used to look up driver in DRIVERS[]
  number_of_laps: number;
  points:        number;
  dnf:           boolean;
  dns:           boolean;
  dsq:           boolean;
  duration:      number | null;   // total race time in seconds
  gap_to_leader: number | string | null; // seconds behind leader (0 for P1)
  meeting_key:   number;
  session_key:   number;
};
```

**Used in:** `SessionResults` component (`src/App/Race.tsx`)

---

### `GET /v1/starting_grid`

Returns the starting grid order for a session (fetched but not yet rendered).

**Query params**

| Param         | Type   | Description                        |
|---------------|--------|------------------------------------|
| `session_key` | number | Unique key identifying the session |

**Used in:** `SessionResults` component (`src/App/Race.tsx`) — currently fetched, rendering pending.

---

## Driver number mapping

OpenF1 identifies drivers by `driver_number` (car number), not by name or acronym. The `DRIVERS` array (`src/App/driver.ts`) includes a `number` field for each driver so results can be resolved to a full `Driver` object:

```ts
const driver = DRIVERS.find((d) => d.number === result.driver_number);
```

## Session keys

`session_key` values come from the static `SESSIONS` data (`src/data/index.ts`), which is pre-populated for the 2026 season. They are passed directly to OpenF1 endpoints — no separate sessions API call is needed.
