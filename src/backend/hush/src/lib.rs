use candid::Principal;
use ic_cdk::{query, update};
use state::HushProtocolState;
mod constant;
mod state;


#[query]
fn version() -> String {
    constant::VERSION.to_string()
}

#[query]
fn get_storage_canister(username: String) -> Option<Principal> {
    HushProtocolState::get_storage_canister_from_username(&username)
}

#[query]
fn get_recovery_canister(index: u64) -> Option<Principal> {
    HushProtocolState::get_recovery_storage_principal(index)
}

#[query]
fn get_all_recovery_canisters() -> Vec<Principal> {
    HushProtocolState::get_all_recovery_canisters()
}



#[update]
fn create_user(username: String){
    
}