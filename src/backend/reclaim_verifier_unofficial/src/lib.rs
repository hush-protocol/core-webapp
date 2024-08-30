use candid::Principal;
use ic_cdk::{init, query, update};
use reclaim::{ClaimInfo,SignedClaim};
use state::{Epoch, Witness};



mod reclaim;
mod state;
mod identity_digest;

#[init]
async fn init(owner: String){
    if !owner.is_empty() {
        state::ReclaimProtocolState::set_owner(Principal::from_text(owner).unwrap());
    }
   
    
}

#[query]
async fn get_owner() -> Principal {
    state::ReclaimProtocolState::get_owner()
}

#[query]
async fn get_current_epoch() -> u64 {
    state::ReclaimProtocolState::get_current_epoch()
}

#[update]
fn add_epoch(witness: Vec<Witness>,minimum_witnesses: u128) -> Result<(), String> {
    let caller: Principal = ic_cdk::caller();
    let owner = state::ReclaimProtocolState::get_owner();
    if caller != owner {
        return Err("Only the owner can add an epoch".to_string());
    }
    let new_epoch_id = state::ReclaimProtocolState::get_current_epoch() + 1_u64;
    let now = ic_cdk::api::time() / 1_000_000_u64; 
    
    let epoch = Epoch {
        id: new_epoch_id,
        witness,
        timestamp_start: now,
        timestamp_end: now + 10000_u64,
        minimum_witness_for_claim_creation: minimum_witnesses,
    };

    state::ReclaimProtocolState::add_epoch(new_epoch_id, epoch);

    Ok(())
}


#[query]
async fn verify_proof(claim_info: ClaimInfo,signed_claim: SignedClaim) -> Result<(), String> {
    let epoch_count = state::ReclaimProtocolState::get_current_epoch();
    let current_epoch: Epoch = match state::ReclaimProtocolState::get_epoch(epoch_count) {
        Some(epoch) => epoch,
        None => return Err("Epoch not found".to_string()),
    };
    let hashed = claim_info.hash();
    if signed_claim.claim.identifier != hashed {
        return Err("Hash Mismatch".to_string());
    }

    let expected_witness = reclaim::SignedClaim::fetch_witness_for_claim(
        current_epoch,
        signed_claim.claim.identifier.clone(),
        signed_claim.claim.timestampS,
    );

    let expected_witness_addresses = Witness::get_addresses(expected_witness);

    let signed_witness = signed_claim.recover_signers_of_signed_claim();

    if expected_witness_addresses.len() != signed_witness.len() {
        return Err("Length Mismatch".to_string());
    }

    for signed in signed_witness {
        if !expected_witness_addresses.contains(&signed) {
            return Err("Signature Mismatch".to_string());
        }
    }
    Ok(())

}



ic_cdk::export_candid!();