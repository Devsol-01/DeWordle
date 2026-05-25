#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env, Symbol,
};

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Emission(u32),
    Balance(Address),
    Claimed(Address),
    Nonce(Address, u64),
}

#[derive(Clone)]
#[contracttype]
pub struct EmissionConfig {
    pub day_id: u32,
    pub win_points: u64,
    pub participation_points: u64,
}

#[derive(Clone)]
#[contracterror]
#[repr(u32)]
pub enum RewardsError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidNonce = 4,
}

#[contract]
pub struct RewardsContract;

#[contractimpl]
impl RewardsContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, RewardsError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.events().publish((Symbol::new(&env, "rewards_initialized"),), admin);
    }

    pub fn set_emission(
        env: Env,
        day_id: u32,
        win_points: u64,
        participation_points: u64,
    ) {
        Self::require_admin(&env);
        let cfg = EmissionConfig {
            day_id,
            win_points,
            participation_points,
        };
        env.storage().persistent().set(&DataKey::Emission(day_id), &cfg);
        env.events().publish((Symbol::new(&env, "emission_set"), day_id), cfg);
    }

    pub fn accrue(env: Env, player: Address, points: u64, nonce: u64, reason: Symbol) {
        Self::require_admin(&env);
        if env
            .storage()
            .persistent()
            .has(&DataKey::Nonce(player.clone(), nonce))
        {
            panic_with_error!(&env, RewardsError::InvalidNonce);
        }

        let balance = Self::balance_of(env.clone(), player.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(player.clone()), &(balance + points));
        env.storage()
            .persistent()
            .set(&DataKey::Nonce(player.clone(), nonce), &true);

        env.events().publish(
            (Symbol::new(&env, "accrued"), player, reason),
            (points, nonce),
        );
    }

    pub fn claim(env: Env, player: Address) -> u64 {
        player.require_auth();

        let balance = Self::balance_of(env.clone(), player.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Balance(player.clone()), &0u64);

        let claimed = Self::claimed_total(env.clone(), player.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Claimed(player.clone()), &(claimed + balance));

        env.events()
            .publish((Symbol::new(&env, "claimed"), player), balance);
        balance
    }

    pub fn balance_of(env: Env, player: Address) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(player))
            .unwrap_or(0)
    }

    pub fn claimed_total(env: Env, player: Address) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::Claimed(player))
            .unwrap_or(0)
    }

    pub fn get_emission(env: Env, day_id: u32) -> Option<EmissionConfig> {
        env.storage().persistent().get(&DataKey::Emission(day_id))
    }

    pub fn version(env: Env) -> u32 {
        env.events().publish(
            (Symbol::new(&env, "module"), Symbol::new(&env, "rewards")),
            2u32,
        );
        2
    }

    fn require_admin(env: &Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(env, RewardsError::NotInitialized));

        admin.require_auth();
    }
}
