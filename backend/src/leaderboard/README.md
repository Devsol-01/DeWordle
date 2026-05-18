# Leaderboard Module

## Overview
The Leaderboard module tracks and ranks users based on their performance in games, both per-game and globally. It updates rankings in real-time as users complete game sessions, supporting pagination, sorting, and tie-breaking.

## Features
- **Per-Game Leaderboard:** Ranks users for each game by total score, wins, and session count.
- **Global Leaderboard:** Aggregates user performance across all games.
- **Real-Time Updates:** Leaderboard entries are updated whenever a session is completed by a logged-in user.
- **Pagination & Sorting:** Endpoints support pagination and sort tied scores by last update time.
- **Guest Sessions:** Guest (anonymous) users are not ranked.

## Approach & Design
- **Entity:** `LeaderboardEntry` stores user, game, totalScore, wins, totalSessions, and lastUpdated. Each (user, game) pair is unique.
- **Relations:**
  - `@ManyToOne(() => User)`
  - `@ManyToOne(() => Game)`
- **Session Completion:**
  - When a session is created, if the user is logged in, the leaderboard is upserted (created or updated) for that user and game.
  - Guest sessions (userId: null) are ignored.
- **Endpoints:**
  - `GET /leaderboard/:gameSlug` — Returns leaderboard for a specific game.
  - `GET /leaderboard/global` — Returns global leaderboard across all games.
- **Sorting:**
  - Primary: `totalScore` (descending)
  - Secondary: `lastUpdated` (descending, for tie-breaks)
- **Pagination:**
  - Use `skip` and `take` query params for paging results.

## How It Works
1. **Session Completion:**
   - When a user completes a session, the backend calls `LeaderboardService.upsertEntry()`.
   - The service finds or creates a `LeaderboardEntry` for the user and game, updating scores, wins, and session count.
2. **Leaderboard Queries:**
   - Per-game: Fetches and sorts leaderboard entries for a game.
   - Global: Aggregates scores, wins, and sessions across all games for each user.
3. **API Usage:**
   - To get a leaderboard: `GET /leaderboard/:gameSlug?skip=0&take=20`
   - To get the global leaderboard: `GET /leaderboard/global?skip=0&take=20`

## Example
```http
GET /leaderboard/wordle?skip=0&take=10
GET /leaderboard/global?skip=0&take=10
```

## Notes
- Only authenticated users are included in the leaderboard.
- The module is integrated with the session completion logic in `GameSessionsService`.
- Designed for extensibility and efficient queries using TypeORM.
