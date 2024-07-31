use crate::types::DkimEmailStorageState;
use candid::Principal;
use viadkim::signature::DKIM_SIGNATURE_NAME;

pub async fn write_recovery_storage_canister(storage_id: Principal, arg: DkimEmailStorageState) -> Result<(), String> {
    let arg_bytes = bincode::serialize(&arg).map_err(|e| format!("Failed to serialize arg: {:?}", e))?;
    
    match ic_cdk::call::<_, ()>(storage_id, "write_recovery_storage_canister_bytes", (arg_bytes,)).await {
        Ok(_) => Ok(()),
        Err((code, err)) => Err(format!("Error: {:?}, {:?}", code, err))
    }
}


pub async fn read_recovery_storage_canister(storage_id: Principal) -> Result<DkimEmailStorageState, String> {
    let (option_res,): (Option<Vec<u8>>,) = match ic_cdk::call::<_, (Option<Vec<u8>>,)>(storage_id, "read_recovery_storage_canister_bytes", ()).await {
        Ok(r) => r,
        Err((code, err)) => return Err(format!("Error: {:?}, {:?}", code, err)),
    };

    let res = match option_res {
        Some(res) => res,
        None => return Err("No bytes found".to_string()),
    };

    if(res.is_empty()){
        return Ok(DkimEmailStorageState{
            storage_id_to_email: std::collections::BTreeMap::new(),

        });
    }

    let state: DkimEmailStorageState = bincode::deserialize(&res).map_err(|e| format!("Failed to deserialize state: {:?}", e))?;
    Ok(state)
}
