use crate::{constant::VETKD_SYSTEM_API_CANISTER_ID, types::{VetKDCurve, VetKDKeyId, VetKDPublicKeyReply, VetKDPublicKeyRequest}};
use candid::Principal;
use ic_cdk::{self, api::call::call_with_payment128};
fn bls12_381_test_key_1() -> VetKDKeyId {
    VetKDKeyId {
        curve: VetKDCurve::Bls12_381,
        name: "test_key_1".to_string(),
    }
}

pub async fn get_encryption_public_key() -> String {
    let request = VetKDPublicKeyRequest {
        canister_id: None,
        derivation_path: vec![b"ibe_encryption".to_vec()],
        key_id: bls12_381_test_key_1()
    };
    let vet_keys_canister = Principal::from_text(VETKD_SYSTEM_API_CANISTER_ID).expect("Invalid principal");
    
    let (response,) : (VetKDPublicKeyReply,)= ic_cdk::call(vet_keys_canister, "vetkd_public_key", (request,))
        .await
        .expect("call to vetkd_public_key failed");

    hex::encode(response.public_key)
}

