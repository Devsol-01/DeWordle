#![no_std]

use dewordle_auth::{require_admin, set_admin};
use dewordle_types::{DayConfig, GuessResult, PlayerStreak, Session, SessionStatus};
use dewordle_utils::current_day_id;
use soroban_sdk::{contract, contractimpl, contracttype, panic_with_error, Address, BytesN, Env, Symbol};

#[derive(Clone)]
#[contracttype]
enum DataKey {
    DayConfig(u32),
    Session(BytesN<32>),
    SessionNonce(Address, u32),
    Streak(Address),
}

#[derive(Clone)]
#[contracttype]
pub enum CoreGameError {
    AlreadyInitialized = 1,
    InvalidMaxAttempts = 2,
    DayNotFound = 3,
    DayNotActive = 4,
    DayClosed = 5,
    NonceAlreadyUsed = 6,
    SessionNotFound = 7,
    UnauthorizedSessionOwner = 8,
    SessionAlreadyFinalized = 9,
    AttemptLimitReached = 10,
    SessionStillInProgress = 11,
    InvalidPlayer = 12,
    InvalidCommitment = 13,
}

#[contract]
pub struct CoreGameContract;

#[contractimpl]
impl CoreGameContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Symbol::new(&env, "initialized")) {
            panic_with_error!(&env, CoreGameError::AlreadyInitialized);
        }

        set_admin(&env, &admin);
        env.storage().instance().set(&Symbol::new(&env, "initialized"), &true);
    }

    pub fn set_day_config(
        env: Env,
        day_id: u32,
        puzzle_commitment: BytesN<32>,
        max_attempts: u32,
        closes_at: u64,
    ) {
        require_admin(&env);

        if max_attempts == 0 {
            panic_with_error!(&env, CoreGameError::InvalidMaxAttempts);
        }

        let config = DayConfig {
            day_id,
            puzzle_commitment,
            max_attempts,
            closes_at,
            published: true,
        };

        env.storage().persistent().set(&DataKey::DayConfig(day_id), &config);

        env.events().publish((Symbol::new(&env, "day_published"), day_id), config);
    }

    pub fn create_session(env: Env, player: Address, day_id: u32, nonce: u32) -> BytesN<32> {
        player.require_auth();
        let config = Self::get_day_config_internal(&env, day_id);

        if !config.published {
            panic_with_error!(&env, CoreGameError::DayNotActive);
        }

        if env.ledger().timestamp() > config.closes_at {
            panic_with_error!(&env, CoreGameError::DayClosed);
        }

        let nonce_key = DataKey::SessionNonce(player.clone(), nonce);
        if env.storage().persistent().has(&nonce_key) {
            panic_with_error!(&env, CoreGameError::NonceAlreadyUsed);
        }

        let session_id = Self::derive_session_id(&env, &player, day_id, nonce);

        let session = Session {
            id: session_id.clone(),
            player: player.clone(),
            day_id,
            attempts_used: 0,
            max_attempts: config.max_attempts,
            status: SessionStatus::InProgress,
            finalized: false,
            started_at: env.ledger().timestamp(),
            updated_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Session(session_id.clone()), &session);
        env.storage().persistent().set(&nonce_key, &true);

        env.events().publish(
            (Symbol::new(&env, "session_started"), player, day_id),
            session_id.clone(),
        );

        session_id
    }

    pub fn submit_guess(
        env: Env,
        player: Address,
        session_id: BytesN<32>,
        guess_commitment: BytesN<32>,
        outcome_code: u32,
        is_correct: bool,
    ) -> GuessResult {
        player.require_auth();
        if guess_commitment == BytesN::from_array(&env, &[0; 32]) {
            panic_with_error!(&env, CoreGameError::InvalidCommitment);
        }

        let mut session = Self::get_session_internal(&env, &session_id);

        if session.player != player {
            panic_with_error!(&env, CoreGameError::UnauthorizedSessionOwner);
        }

        if session.finalized {
            panic_with_error!(&env, CoreGameError::SessionAlreadyFinalized);
        }

        if session.attempts_used >= session.max_attempts {
            panic_with_error!(&env, CoreGameError::AttemptLimitReached);
        }

        session.attempts_used += 1;
        session.updated_at = env.ledger().timestamp();

        if is_correct {
            session.status = SessionStatus::Won;
        } else if session.attempts_used >= session.max_attempts {
            session.status = SessionStatus::Lost;
        }

        let result = GuessResult {
            attempt_no: session.attempts_used,
            outcome_code,
            is_correct,
        };

        env.storage().persistent().set(&DataKey::Session(session_id.clone()), &session);

        env.events().publish(
            (Symbol::new(&env, "guess_submitted"), session_id),
            (guess_commitment, result.clone()),
        );

        result
    }

    pub fn finalize_session(env: Env, player: Address, session_id: BytesN<32>) -> Session {
        player.require_auth();
        let mut session = Self::get_session_internal(&env, &session_id);

        if session.player != player {
            panic_with_error!(&env, CoreGameError::UnauthorizedSessionOwner);
        }

        if session.finalized {
            panic_with_error!(&env, CoreGameError::SessionAlreadyFinalized);
        }

        if matches!(session.status, SessionStatus::InProgress) {
            panic_with_error!(&env, CoreGameError::SessionStillInProgress);
        }

        session.finalized = true;
        session.status = SessionStatus::Finalized;
        session.updated_at = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Session(session_id.clone()), &session);

        Self::update_streak(&env, &player);

        env.events().publish((Symbol::new(&env, "session_finalized"), session_id), player);

        session
    }

    pub fn get_session(env: Env, session_id: BytesN<32>) -> Session {
        Self::get_session_internal(&env, &session_id)
    }

    pub fn get_day_config(env: Env, day_id: u32) -> DayConfig {
        Self::get_day_config_internal(&env, day_id)
    }

    pub fn get_streak(env: Env, player: Address) -> PlayerStreak {
        env.storage().persistent().get(&DataKey::Streak(player)).unwrap_or(PlayerStreak {
            current: 0,
            max: 0,
            last_day_played: 0,
        })
    }

    fn get_day_config_internal(env: &Env, day_id: u32) -> DayConfig {
        env.storage()
            .persistent()
            .get(&DataKey::DayConfig(day_id))
            .unwrap_or_else(|| panic_with_error!(env, CoreGameError::DayNotFound))
    }

    fn get_session_internal(env: &Env, session_id: &BytesN<32>) -> Session {
        env.storage()
            .persistent()
            .get(&DataKey::Session(session_id.clone()))
            .unwrap_or_else(|| panic_with_error!(env, CoreGameError::SessionNotFound))
    }

    fn derive_session_id(env: &Env, player: &Address, day_id: u32, nonce: u32) -> BytesN<32> {
        let preimage = (
            player.clone(),
            day_id,
            nonce,
            env.ledger().sequence(),
            env.ledger().timestamp(),
        );

        env.crypto().sha256(&preimage.into_val(env))
    }

    fn update_streak(env: &Env, player: &Address) {
        let mut streak = env
            .storage()
            .persistent()
            .get(&DataKey::Streak(player.clone()))
            .unwrap_or(PlayerStreak {
                current: 0,
                max: 0,
                last_day_played: 0,
            });

        let day = current_day_id(env);

        if streak.last_day_played + 1 == day {
            streak.current += 1;
        } else if streak.last_day_played != day {
            streak.current = 1;
        }

        if streak.current > streak.max {
            streak.max = streak.current;
        }

        streak.last_day_played = day;
        env.storage().persistent().set(&DataKey::Streak(player.clone()), &streak);

        env.events().publish((Symbol::new(env, "streak_updated"), player), streak);
    }
}
