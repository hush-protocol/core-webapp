use std::borrow::Borrow;

use candid::Principal;
use ic_cdk::{self, call, init, query, update};
use state::SecretStorage;
use types::{RecoveryVerifyInput, StorageCanisterInput};
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
    state::SecretStorageState::get_secret(index.borrow())
}

#[query]
async fn get_storages() -> Vec<SecretStorage> {
    state::SecretStorageState::get_secrets()
}

#[query]
async fn get_latest_derivation_path () -> String {
    format!("{}#{}",ic_cdk::id().to_string(),state::SecretStorageState::get_secrets().len() + 1)
}

#[query]
async fn read_recovery_storage_canister_bytes() -> Option<Vec<u8>> {
    let caller_canister = ic_cdk::caller();
    state::SecretStorageState::read_recovery_storage_canister_bytes(caller_canister)
}

#[update]
async fn get_public_key() -> Result<String, String> {
    cryptography::get_encryption_public_key().await
}

#[update]
async fn add_secret(secret: SecretStorage, recovery_canister_args: Vec<String>) -> Result<(), String> {
    if(secret.recovery_storage_canisters.len() != recovery_canister_args.len()) {
        return Err("Invalid recovery canister arguments".to_string());
    }
    for (i, canister_id) in secret.recovery_storage_canisters.iter().enumerate() {
        let canister_id =  canister_id.to_owned();
        let is_canister_registered = state::SecretStorageState::if_recovery_storage_canister_exists(canister_id);
        let new_storage_index = state::SecretStorageState::get_latest_secrets_index();
        if !is_canister_registered  {
            state::SecretStorageState::write_recovery_storage_canister_bytes(canister_id, vec![]);

        }
        let result:Result<(bool,), (ic_cdk::api::call::RejectionCode, String)> = call(canister_id, "verify", (&recovery_canister_args[i].to_string(),new_storage_index)).await;
        match result {
            Ok(r) => {
                if r.0 == false {
                    return Err(format!("Failed to add user to recovery canister {} because it is false",canister_id.to_string()).to_string());
                }
            },
            Err(err) => {
                return Err(err.1);
            }
        }
    }
    state::SecretStorageState::add_secret(secret);
    Ok(())
}



#[update]
async fn verify_secret(secret_storage_id: u64,encryption_public_key: Vec<u8>, recovery_verify_inputs: Vec<String>) -> Result<String, String> {
    
    let secret_storage = state::SecretStorageState::get_secret(secret_storage_id.borrow()).unwrap();
    if(secret_storage.recovery_storage_canisters.len() != recovery_verify_inputs.len()) {
        return Err("Invalid recovery canister arguments".to_string())
    }
    let storage_canister_id = ic_cdk::id();
    
    for (i, canister_id) in secret_storage.recovery_storage_canisters.iter().enumerate() {
        let canister_id =  canister_id.to_owned();
        let is_canister_registered = state::SecretStorageState::if_recovery_storage_canister_exists(canister_id);
        if !is_canister_registered  {
            return Err("Recovery canister is not registered with this storage ".to_string())
        }
        let result:Result<(bool,), (ic_cdk::api::call::RejectionCode, String)> = call(canister_id, "verify", (&recovery_verify_inputs[i].to_string(),)).await;
        match result {
            Ok(r) => {
                if r.0 == false {
                    return Err(format!("Failed to add user to recovery canister {} because it is false",canister_id.to_string()).to_string())
                }
            },
            Err(err) => {
               return Err(err.1);
            }
        }
    }
    let key = cryptography::get_encrypted_decryption_key(format!("{}#{}",storage_canister_id.to_string(),secret_storage_id), encryption_public_key).await.unwrap();
    Ok(key)
}


#[update]
async fn write_recovery_storage_canister_bytes(bytes: Vec<u8>) -> Result<(), String> {
    let caller_canister = ic_cdk::caller();
    if(!state::SecretStorageState::if_recovery_storage_canister_exists(caller_canister)) {
        return Err("Canister is not registered as recovery canister".to_string());
    }
    state::SecretStorageState::write_recovery_storage_canister_bytes(caller_canister, bytes);
    Ok(())
}


ic_cdk::export_candid!();