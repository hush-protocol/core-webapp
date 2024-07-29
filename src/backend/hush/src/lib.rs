use candid::Principal;
use ic_cdk::{api::{call::call_with_payment128, management_canister::main::{create_canister, CanisterIdRecord, CreateCanisterArgument, InstallCodeArgument}}, query, update};
use ic_cdk::api::management_canister::main::CanisterInstallMode;
use state::HushProtocolState;
mod constant;
mod state;
mod types;

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
async fn create_user(username: String) -> Result<Principal,String>{
    let storage_canister_input = types::StorageCanisterInput{
        username: username.clone()
    };

    let canister_args = CreateCanisterArgument{
        settings: None
    };
    let canister_args_bytes = candid::encode_one(&storage_canister_input).unwrap();

    let result = match create_canister(canister_args, 1000000000).await {
        Ok((canister_id,)) => (canister_id,),
        Err(err) => {
            return Err(err.1);
        }
    };


    let install_code_argument = InstallCodeArgument
    {
        mode: CanisterInstallMode::Install,
        canister_id:result.0.canister_id,
        wasm_module: include_bytes!("../../../../.dfx/local/canisters/storage/storage.wasm").to_vec(),
        arg: canister_args_bytes
    };
    

    let installed_result = ic_cdk::api::management_canister::main::install_code(install_code_argument).await;

    match installed_result {
        Ok(_) => {
            HushProtocolState::insert_username_to_storage_canister(username,result.0.canister_id);
            Ok(result.0.canister_id)
        },
        Err(err) => {
            Err(err.1)
        }
    }

}

#[update]
fn add_recovery_canister(canister_id: Principal) {
    HushProtocolState::add_recovery_storage_canister(canister_id);
}


ic_cdk::export_candid!();