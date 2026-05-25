#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env, Symbol,
};

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Contract(Symbol),
    Role(Symbol, Address),
}

#[derive(Clone)]
#[contracterror]
#[repr(u32)]
pub enum AdminRegistryError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    MissingContract = 4,
}

#[contract]
pub struct AdminRegistryContract;

#[contractimpl]
impl AdminRegistryContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, AdminRegistryError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.events().publish((Symbol::new(&env, "registry_initialized"),), admin);
    }

    pub fn set_contract(env: Env, key: Symbol, contract_address: Address) {
        Self::require_admin(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Contract(key.clone()), &contract_address);
        env.events().publish((Symbol::new(&env, "contract_set"), key), contract_address);
    }

    pub fn get_contract(env: Env, key: Symbol) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::Contract(key))
            .unwrap_or_else(|| panic_with_error!(&env, AdminRegistryError::MissingContract))
    }

    pub fn set_role(env: Env, role: Symbol, member: Address, enabled: bool) {
        Self::require_admin(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Role(role.clone(), member.clone()), &enabled);
        env.events().publish((Symbol::new(&env, "role_set"), role, member), enabled);
    }

    pub fn has_role(env: Env, role: Symbol, member: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Role(role, member))
            .unwrap_or(false)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, AdminRegistryError::NotInitialized))
    }

    pub fn version(env: Env) -> u32 {
        env.events().publish(
            (Symbol::new(&env, "module"), Symbol::new(&env, "admin_registry")),
            2u32,
        );
        2
    }

    fn require_admin(env: &Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(env, AdminRegistryError::NotInitialized));
        admin.require_auth();
    }
}
