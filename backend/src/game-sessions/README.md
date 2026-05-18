# Game Sessions Module

This module handles game session creation and management for both authenticated users and guest users.

## Features

### Authenticated User Sessions
- **Endpoint**: `POST /sessions`
- **Authentication**: Required (JWT)
- **Features**: 
  - Updates leaderboard
  - Tracks user statistics
  - Full session history

### Guest Sessions
- **Endpoint**: `POST /sessions/guest`
- **Authentication**: Not required
- **Features**:
  - Anonymous session storage
  - Excluded from leaderboard
  - Excluded from user statistics
  - Optional guestId tracking in metadata

## API Endpoints

### Create Authenticated Session
```http
POST /sessions
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "gameId": 1,
  "score": 100,
  "durationSeconds": 60,
  "metadata": {
    "level": 3,
    "difficulty": "hard"
  }
}
```

### Create Guest Session
```http
POST /sessions/guest
Content-Type: application/json

{
  "gameId": 1,
  "score": 100,
  "durationSeconds": 60,
  "metadata": {
    "guestId": "guest_123",
    "level": 3,
    "difficulty": "hard"
  }
}
```

### Get User Sessions
```http
GET /sessions/my-sessions
Authorization: Bearer <jwt-token>
```

### Get Guest Sessions
```http
GET /sessions/guest-sessions?guestId=guest_123
```

## Data Models

### CreateSessionDto
```typescript
{
  gameId: number;           // Required: ID of the game
  score: number;            // Required: Session score
  durationSeconds: number;  // Required: Session duration
  metadata?: {              // Optional: Additional session data
    guestId?: string;       // Optional: Guest identifier
    [key: string]: any;     // Any additional metadata
  };
}
```

### GameSession Entity
```typescript
{
  id: number;               // Auto-generated session ID
  user?: User;              // User entity (null for guests)
  game: Game;               // Game entity
  score: number;            // Session score
  durationSeconds: number;  // Session duration
  metadata?: object;        // Session metadata
  playedAt: Date;           // Timestamp
}
```

## Business Logic

### Guest Session Rules
1. **No Authentication Required**: Guests can create sessions without signing up
2. **Anonymous Storage**: Sessions are saved with `userId: null`
3. **Leaderboard Exclusion**: Guest sessions don't affect leaderboards
4. **Stats Exclusion**: Guest sessions don't update user statistics
5. **Optional Tracking**: GuestId can be stored in metadata for session retrieval
6. **Score Validation**: Negative scores are blocked for guest sessions (prevents abuse)

### Event Emission
Both authenticated and guest sessions emit a `session.completed` event that can be listened to by other modules for additional processing.

## Security Considerations

- Guest sessions are validated to prevent score manipulation
- Negative scores are blocked for guest sessions
- Guest sessions don't affect global statistics
- Session metadata is stored as JSON and should be validated by consumers

## Integration Points

- **LeaderboardModule**: Only processes authenticated user sessions
- **Event System**: Both session types emit events for extensibility
- **Database**: Uses TypeORM with nullable user relationships 