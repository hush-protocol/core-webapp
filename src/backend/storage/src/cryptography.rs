use crate::{constant::VETKD_SYSTEM_API_CANISTER_ID, types::{VetKDCurve, VetKDKeyId, VetKDPublicKeyReply, VetKDPublicKeyRequest,VetKDEncryptedKeyReply,VetKDEncryptedKeyRequest}};
use candid::Principal;
use ic_cdk::{self, api::call::call_with_payment128};
fn bls12_381_test_key_1() -> VetKDKeyId {
    VetKDKeyId {
        curve: VetKDCurve::Bls12_381,
        name: "test_key_1".to_string(),
    }
}

pub async fn get_encryption_public_key() -> Result<String, String> {
    let request = VetKDPublicKeyRequest {
        canister_id: None,
        derivation_path: vec![b"ibe_encryption".to_vec()],
        key_id: bls12_381_test_key_1()
    };
    let vet_keys_canister = Principal::from_text(VETKD_SYSTEM_API_CANISTER_ID).expect("Invalid principal");
    
    let (response,) : (VetKDPublicKeyReply,)=
    match  ic_cdk::call(vet_keys_canister, "vetkd_public_key", (request,)).await {
        Ok(r) => r,
        Err(err) => return Err(err.1)
    }; 
    Ok(hex::encode(response.public_key))
}


pub async fn get_encrypted_decryption_key(encryption_public_key: Vec<u8>) -> Result<String,String>  {
    let request: VetKDEncryptedKeyRequest = VetKDEncryptedKeyRequest {
        derivation_id: ic_cdk::id().as_slice().to_vec(),
        public_key_derivation_path: vec![b"ibe_encryption".to_vec()],
        key_id: bls12_381_test_key_1(),
        encryption_public_key,
    };
    let vet_keys_canister = Principal::from_text(VETKD_SYSTEM_API_CANISTER_ID).expect("Invalid principal");

    let (response,): (VetKDEncryptedKeyReply,) = match ic_cdk::api::call::call(
        vet_keys_canister,
        "vetkd_encrypted_key",
        (request,),
    ).await{
        Err(err) => return Err(err.1),
        Ok(r) => r
        
    };
    ic_cdk::println!("Encrypted key: {:?}", hex::encode(&response.encrypted_key));
    
    Ok(hex::encode(response.encrypted_key))

}
