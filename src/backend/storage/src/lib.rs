use ic_cdk::{self, query,init};
use state::SecretStorage;
use types::StorageCanisterInput;
mod state;
mod constant;
mod types;
mod cryptography;



#[init]
async fn init(storage_canister_input: StorageCanisterInput){
    state::SecretStorageState::set_username(storage_canister_input.username);
}



#[query]
async fn version() -> String {
    constant::VERSION.to_string()
}


#[query]
async fn get_username() -> String {
    state::SecretStorageState::get_username()
}

#[query]
async fn get_storage(index: u64) -> Option<SecretStorage> {
    state::SecretStorageState::get_secret(index)
}

#[query]
async fn get_storages() -> Vec<SecretStorage> {
    state::SecretStorageState::get_secrets()
}


ic_cdk::export_candid!();